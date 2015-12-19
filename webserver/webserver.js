"use strict";

const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const analyzerTypes = require('./analyzerTypes.json');


class Webserver{
    constructor(twabot){
        this.twabot = twabot;
        this.app = express();
        this.server = http.Server(this.app);
        this.io = socketio(this.server);
        //twabot.channelCrawler.activeChannels[name];

        this.__registerSites();
        this.__handleConnections();
    }

    __registerSites(){
        this.app.use('/overview/activeChannels/', function (req, res){
            let overviewList = this.twabot.channelCrawler.getMostViewedChannels(9);
            let overview = sliceToOverviewData(overviewList);
            res.json(overview);
        }.bind(this));

        this.app.use('/overview/emotionChannels/', function (req, res){
            let emotionChannels = this.twabot.channelCrawler.getMostEmotionalChannels();
            for (let emotion in emotionChannels){
                if (emotionChannels[emotion])
                    emotionChannels[emotion]=convertToLightweightChannel(emotionChannels[emotion]);
            }
            //let overviewList = this.twabot.channelCrawler.getMostViewedChannels(9);
            //let overview = sliceToOverviewData(overviewList);
            res.json(emotionChannels);
        }.bind(this));

        this.app.use('/user.html', function (req, res){
            if (req.query.channel)
                res.redirect('/user/'+req.query.channel);
            else
                res.redirect('/');
        });

        this.app.use('/user/:user/', function (req, res){
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
        }.bind(this));

        this.app.use(express.static('public'));
    }

    __handleConnections(){
        this.io.on('connection', (socket) => {
            socket.on('registerChannel', (channelName) => {
                console.log(channelName);
                let channel = this.twabot.channelCrawler.activeChannels[channelName];
                if (channel) {
                    for (let type of analyzerTypes){
                        // Send all the legacy data to the client for its history
                        console.log(type);
                        console.log(channel);
                        channel.rethinkDB.getTableWithType(type)
                            .then((analysisList) => {
                                let packageContent = {};
                                if (type == 'fallingEmotions')
                                    packageContent[type] = analysisList[0];
                                else
                                    packageContent[type] = analysisList;

                                socket.emit('legacyData', packageContent);
                            })
                            .catch((err) => console.log(err));

                        channel.rethinkDB.getChangeFeed()
                            .then((data) =>{
                                data.on('data', (data) => {
                                    socket.emit('updateData', data);
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

                    /*
                    let fractalPromis = channel.rethinkDB.getChangeFeed('fractal');
                    fractalPromis
                        .then((data) => { // data is a stream of new analysed data
                            data.on("data", (data) => {
                                socket.emit('update', data);
                            });
                        })
                        .catch((err) => {
                            console.log(err);
                        });*/
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

if (require.main === module) {
    let web = new Webserver(1);
    web.startServer();
}