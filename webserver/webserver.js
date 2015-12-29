"use strict";

const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const analyzerTypes = require('./analyzerTypes.json');
const msgPerTimeCount = 20;
const fractalCount = 20;


class Webserver{
    constructor(twabot, port){
        if (!port)
            port = 8080;
        this.twabot = twabot;
        this.port = port;
        this.app = express();
        this.server = http.Server(this.app);
        this.io = socketio(this.server);

        this.__registerSites();
        this.__handleConnections();
    }

    __registerSites(){
        this.app.use('/overview/activeChannels/', (req, res) => {
            let overviewList = this.twabot.channelCrawler.getMostViewedChannels(6);
            let overviewPromises = [];
            for (let channel of overviewList){
                if (channel)
                    overviewPromises.push(convertToLightweightChannel(channel));
            }
            Promise.all(overviewPromises)
                .then((overviewList) => {
                    res.json(overviewList);
                })
                .catch((err) => {
                    console.log(err);
                    res.status(404).end()
                });
        });

        this.app.use('/overview/emotionChannels/', (req, res) => {
            let emotionChannels = this.twabot.channelCrawler.getMostEmotionalChannels();
            let emotionPromises = [];
            for (let emotion in emotionChannels){
                if (emotionChannels[emotion])
                    emotionPromises.push(convertToLightweightChannel(emotionChannels[emotion]));
            }
            Promise.all(emotionPromises)
                .then((emotionList) => {
                    let emotionChannelsOutput = {};
                    for (let emotion in emotionChannels){
                        if (emotionChannels[emotion]) {
                            let channelName = emotionChannels[emotion].name;
                            let index = 0;
                            for (index = 0; index < emotionList.length; index++) {
                                if (emotionList[index].name == channelName)
                                    break;
                            }
                            emotionChannelsOutput[emotion] = emotionList[index];
                        }
                    }
                    res.json(emotionChannelsOutput);
                })
                .catch((err) => {
                    console.log(err);
                    res.status(404).end()
                });
        });

        this.app.use('/user.html', (req, res) => {
            if (req.query.channel)
                res.redirect('/user/'+req.query.channel);
            else
                res.redirect('/');
        });

        this.app.use('/user/:user/', (req, res) => {
            let options = {root: __dirname + '/../public/'};
            if (this.twabot.channelCrawler.activeChannels[req.params.user]) {
                res.sendFile('user.html', options, function (err) {
                    if (err)
                        res.status(404).end();
                });
            }
            else {
                res.redirect('/');
            }
        });

        this.app.use(express.static('public'));
    }

    __handleConnections(){
        this.io.on('connection', (socket) => {
            socket.on('registerChannel', (channelName) => {
                let channel = this.twabot.channelCrawler.activeChannels[channelName];
                if (channel) {
                    for (let type of analyzerTypes) {
                        // Send all the legacy data to the client for its history
                        channel.rethinkDB.getElementsSince(type, 20000)
                            .then((analysisList) => {
                                let packagedContent = {};
                                packagedContent[type] = sliceAnalysis(analysisList, type);
                                socket.emit('legacyData', packagedContent);
                            })
                            .catch((err) => console.log(err));
                    }
                    for (let type of analyzerTypes){
                        channel.rethinkDB.getChangeFeed(type)
                            .then((data) =>{
                                data.on('data', (analysis) => {
                                    let packagedContent = {};
                                    packagedContent[type] = analysis.new_val;
                                    socket.emit('updateData', packagedContent);
                                });
                                socket.conn.on('close', (msg) => {
                                    data.close();
                                });
                                socket.on('error', (msg) => {
                                    data.close();
                                });
                            })
                            .catch((err) => console.log(err));
                    }
                }
            });
            socket.on('error', (err) => {
                console.log('socket.io threw an error: ');
                console.log(err);
            });

        });
    }

    startServer() {
        this.server.listen(this.port);
        console.log("Webserver started on port " + this.port);
    }
}

function convertToLightweightChannel(channel){
    let legacyDataPromises = [];
    for (let type of analyzerTypes){
        legacyDataPromises.push(channel.rethinkDB.getElementsSince(type, 20000));
    }
    return Promise.all(legacyDataPromises)
        .then((analysisLists) => {
            let newChannel = {
                name: channel.name,
                viewers: channel.viewers,
                logo: channel.logo
            };
            for (let analysisList of analysisLists){
                let type = analysisList[0].type;
                newChannel[type] = sliceAnalysis(analysisList, type);
            }
            return Promise.resolve(newChannel);
        })
        .catch((err) => {
            return Promise.reject(err);
        });
}

function sliceAnalysis(analysisList, type){
    if (type == 'fallingEmotions') {
        return analysisList[analysisList.length-1];
    } else if (type == 'msgPerTime') {
        if (analysisList.length > msgPerTimeCount)
            return analysisList.slice(analysisList.length - msgPerTimeCount, analysisList.length);
        else
            return analysisList;
    } else { // fractal
        if (analysisList.length > fractalCount)
            return analysisList.slice(analysisList.length - fractalCount, analysisList.length);
        else
            return analysisList;
    }
}

module.exports = Webserver;
