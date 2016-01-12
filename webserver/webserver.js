"use strict";
/**
 * Created by Andreas Wundlechner
 *
 * The webserver class handles all requests by browsers. This includes serving html objects and
 * handling socket.io connections. The requests for analysed data will be forwarded to the database.
 *
 * The code corresponding to the fractal analysis isn't finished,
 * so for performance optimisation it is commented out.
 * The missing fractal is caused by too less time.
 */

const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const analyzerTypes = require('./analyzerTypes.json');
// Amount of measurements to display in the diagram.
const msgPerTimeCount = 20;
//const fractalCount = 20;

// The period, how often a value will be actualized (in ms).
const msgPerTimePeriodLength = 2500;
const fallingEmotionsPeriodLength = 100;

// Mapping the times for the database request.
const elementsSincePeriodLengths = {
    msgPerTime: msgPerTimePeriodLength * (msgPerTimeCount + 4),
    fallingEmotions: fallingEmotionsPeriodLength * 4
    //fractal: 0
};

// The counter, how many most active Channels will be displayed.
const activeChannelsCount = 6;

/**
 * The webserver will be created and started from the main programm (twabot.js).
 */
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

    /**
     * This function is the setup for all requests by the client with the get method
     */
    __registerSites(){
        // Requesting /overview/activeChannels/ respondes a list of the most active channels.
        this.app.use('/overview/activeChannels/', (req, res) => {
            let overviewList = this.twabot.channelCrawler.getMostViewedChannels(activeChannelsCount);

            // Shrink the channels with a lot of data to the minimum, a browser needs to display
            let overviewPromises = [];
            for (let channel of overviewList){
                if (channel)
                    overviewPromises.push(convertToBrowserChannel(channel));
            }

            // Send the converted channels to the browser
            Promise.all(overviewPromises)
                .then((overviewList) => {
                    res.json(overviewList);
                })
                .catch((err) => {
                    console.log(err);
                    res.status(404).end()
                });
        });

        // Requesting /overview/emotionChannels/ respondes a dictionary of
        // the most emotional channels. emotion: channel
        this.app.use('/overview/emotionChannels/', (req, res) => {
            let emotionChannels = this.twabot.channelCrawler.getMostEmotionalChannels();

            // Create a set of channels for minimum of database requests
            let emotionChannelRequests = {};
            for (let emotion in emotionChannels){
                if (emotionChannels[emotion]) {
                    let channelName = emotionChannels[emotion].name;
                    emotionChannelRequests[channelName] = emotionChannels[emotion];
                }
            }

            // Shrink the channels for the browser
            let emotionPromises = [];
            for (let channelRequest in emotionChannelRequests){
                emotionPromises.push(convertToBrowserChannel(emotionChannelRequests[channelRequest]));
            }

            // Send the converted channels to the browser
            Promise.all(emotionPromises)
                .then((emotionList) => {
                    // But first the 'emotion: channel' structure must be created.
                    let emotionChannelsOutput = {};
                    for (let emotion in emotionChannels){
                        if (emotionChannels[emotion]) { // Check if the emotion channel exits
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

        // The redirection for search requests (All channels consist out of lowercase letters)
        this.app.use('/user.html', (req, res) => {
            if (req.query.channel)
                res.redirect('/user/'+req.query.channel.toLowerCase());
            else
                res.redirect('/');
        });

        // Sending the user.html document, if the channel is in our channel list
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

        // Serve all the static documents from the folder public (like favicon.ico)
        this.app.use(express.static('public'));
    }

    /**
     * This function is the setup for all socket.io connections to the browser.
     */
    __handleConnections(){
        this.io.on('connection', (socket) => {
            // When a browser connects, it sends a registerChannel event with the requested channel name.
            socket.on('registerChannel', (channelName) => {
                let channel = this.twabot.channelCrawler.activeChannels[channelName];
                if (channel) {
                    // Gather and send all the legacy data to the client for its history
                    for (let type of analyzerTypes) {
                        channel.rethinkDB.getElementsSince(type, elementsSincePeriodLengths[type])
                            .then((analysisList) => {
                                let packagedContent = {};
                                packagedContent[type] = sliceAnalysis(analysisList, type);
                                socket.emit('legacyData', packagedContent);
                            })
                            .catch((err) => console.log(err));
                    }
                    // Send the updated data to the client.
                    for (let type of analyzerTypes){
                        channel.rethinkDB.getChangeFeed(type)
                            .then((data) =>{
                                data.on('data', (analysis) => {
                                    let packagedContent = {};
                                    packagedContent[type] = analysis.new_val;
                                    socket.emit('updateData', packagedContent);
                                });
                                // When the connection to the browser is closed,
                                // close also the database connection.
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

/**
 * This function converts the heavy channel objects, the server uses, to light channels,
 * which the browser can use. The heavy channel also couldn't be converted to json.
 * @param channel Channel from the server internal.
 * @returns {Promise} The promise returns the new light channel, when the database requests are finished.
 */
function convertToBrowserChannel(channel){
    return new Promise((resolve, reject) => {
        // Request the analysis data from the database.
        let legacyDataPromises = [];
        for (let type of analyzerTypes){
            legacyDataPromises.push(channel.rethinkDB.getElementsSince(type, elementsSincePeriodLengths[type]));
        }

        Promise.all(legacyDataPromises)
            .then((analysisLists) => {
                // Create a new channel object.
                let newChannel = {
                    name: channel.name,
                    viewers: channel.viewers,
                    logo: channel.logo
                };

                // Add analysis data.
                for (let analysisList of analysisLists){
                    let type = analysisList[0].type;
                    newChannel[type] = sliceAnalysis(analysisList, type);
                }

                // Return the new channel.
                resolve(newChannel);
            })
            .catch((err) => {
                reject(err);
            });
    });

}

/**
 * Slice the analysis data from the database to a minimum, which the browser needs. Used for legacy data.
 * @param analysisList The list of all requested measurements.
 * @param type The type of analysis.
 * @returns Returns the shrunken analysis.
 */
function sliceAnalysis(analysisList, type){
    if (type == 'fallingEmotions') {
        // Only the latest measurement is important.
        return analysisList[analysisList.length-1];
    } else if (type == 'msgPerTime') {
        if (analysisList.length > msgPerTimeCount)
            return analysisList.slice(analysisList.length - msgPerTimeCount, analysisList.length);
        else
            return analysisList;
    } //else if (type == 'fractal') {
    //    if (analysisList.length > fractalCount)
    //        return analysisList.slice(analysisList.length - fractalCount, analysisList.length);
    //    else
    //        return analysisList;
    //}
    throw new Error('Unknown type: ' + type);
}

module.exports = Webserver;
