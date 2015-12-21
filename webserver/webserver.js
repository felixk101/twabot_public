"use strict";

const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const analyzerTypes = require('./analyzerTypes.json');
const msgPerTimeCount = 20;


class Webserver{
    constructor(twabot){
        this.twabot = twabot;
        this.app = express();
        this.server = http.Server(this.app);
        this.io = socketio(this.server);

        this.__registerSites();
        this.__handleConnections();
    }

    __registerSites(){
        this.app.use('/channelData/:channelName/', (req, res) => {
            let channelName = req.params.channelName;
            let channel = this.twabot.channelCrawler.activeChannels[channelName];
            if (channel) {
                for (let type of analyzerTypes){
                    // Send all the legacy data to the client for its history
                    channel.rethinkDB.getElementsSince(type, 100000)
                        .then((analysisList) => {
                            let packagedContent = {};
                            if (type == 'fallingEmotions') {
                                packagedContent[type] = analysisList[0];
                            } else if (type == 'msgPerTime') {
                                if (analysisList.length > msgPerTimeCount)
                                    packagedContent[type] = analysisList.slice(
                                        analysisList.length - msgPerTimeCount, analysisList.length);
                                else
                                    packagedContent[type] = analysisList;
                            } else {
                                packagedContent[type] = analysisList;
                            }
                            res.json(packagedContent);
                        })
                        .catch((err) => {
                            console.log(err);
                            res.status(404).end();
                        });
                }
            }
        });

        this.app.use('/overview/activeChannels/', (req, res) => {
            let overviewList = this.twabot.channelCrawler.getMostViewedChannels(9);
            let overview = sliceToOverviewData(overviewList);
            res.json(overview);
        });

        this.app.use('/overview/emotionChannels/', (req, res) => {
            let emotionChannels = this.twabot.channelCrawler.getMostEmotionalChannels();
            for (let emotion in emotionChannels){
                if (emotionChannels[emotion])
                    emotionChannels[emotion]=convertToLightweightChannel(emotionChannels[emotion]);
            }
            res.json(emotionChannels);
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
                    for (let type of analyzerTypes){
                        // Send all the legacy data to the client for its history
                        channel.rethinkDB.getElementsSince(type, 100000)
                            .then((analysisList) => {
                                let packagedContent = {};
                                if (type == 'fallingEmotions') {
                                    packagedContent[type] = analysisList[analysisList.length-1];
                                } else if (type == 'msgPerTime') {
                                    if (analysisList.length > msgPerTimeCount)
                                        packagedContent[type] = analysisList.slice(
                                            analysisList.length - msgPerTimeCount, analysisList.length);
                                    else
                                        packagedContent[type] = analysisList;
                                } else {
                                    packagedContent[type] = analysisList;
                                }
                                socket.emit('legacyData', packagedContent);
                            })
                            .catch((err) => console.log(err));

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
        this.server.listen(80);
        console.log("Webserver started on port 80");
    }
};

/**
 * Slice the list of channels down to a minimum which the client needs to display.
 * @param overviewList The list of channels to be displayed.
 * @returns A list of "minimum" Channels.
 */
function sliceToOverviewData(overviewList){
    let overview = [];
    for (let channel of overviewList){
        if (channel)
            overview.push(convertToLightweightChannel(channel));
    }
    return overview;
}

function convertToLightweightChannel(channel){
    let newChannel = {
        name: channel.name,
        viewers: channel.viewers,
        logo: channel.logo,
        rethinkDB:{
            streamID: channel.rethinkDB.streamID,
            streamName: channel.rethinkDB.streamName
        }
    };
    return newChannel;
}

module.exports = Webserver;
