"use strict";

let express = require('express');
//let socketio = require('socket.io');

class Webserver{
    constructor(twabot){
        this.twabot = twabot;
        this.app = express();
        //this.io = socketio(this.app);
        //twabot.channelCrawler.activeChannels[name];

        this.__registerSites();
        //this.__handleConnections();
    }

    __registerSites(){
        this.app.use('/overview/activeChannels/', function (req, res){
            let overviewList = this.twabot.channelCrawler.getMostViewedChannels(9);
            let overview = sliceToOverviewData(overviewList);
            res.json(overview);
        }.bind(this));

        this.app.use('/user.html', function (req, res){
            if (req.query.channel)
                res.redirect('/user/'+req.query.channel);
            else
                res.status(404).end();
        });

        this.app.use('/user/:user/', function (req, res){
            let options = {root: __dirname + '/public/'};
            res.sendFile('user.html', options, function(err){
                if (err)
                    res.status(404).end();
            })
        });

        this.app.use(express.static('interface/public'));
    }

    /*__handleConnections(){
        this.io.on('connection', function(socket){
            socket.on('registerChannel', function(channelName){
                let channel = channelthis.twabot.channelCrawler.activeChannels[channelName];
                socket.emit('legacyData', channel.rethinkDB.readData('fractal'));
            })
        });
    }*/

    startServer() {
        this.app.listen(80);
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
        let newChannel = {
            name: channel.name,
            viewers: channel.viewers,
            logo: channel.logo,
            rethinkDB:{
                streamID: channel.rethinkDB.streamID,
                streamName: channel.rethinkDB.streamName
            }
        };
        overview.push(newChannel);
    }
    return overview;
}

module.exports = Webserver;

if (require.main === module) {
    let web = new Webserver(1);
    web.startServer();
}