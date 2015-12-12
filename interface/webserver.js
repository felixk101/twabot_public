"use strict";

let express = require('express');

class Webserver{
    constructor(twabot){
        this.twabot = twabot;
        this.app = express();
        //twabot.channelCrawler.activeChannels[name];

        this.app.use('/overview/activeChannels/', function (req, res){
            console.log(twabot.channelCrawler.activeChannels);
            let overviewList = twabot.channelCrawler.activeChannels;
            res.json(overviewList);
        });

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

    startServer() {
        this.app.listen(80);
        console.log("Webserver started on port 80");
    }
};

module.exports = Webserver;

if (require.main === module) {
    let web = new Webserver(1);
    web.startServer();
}