"use strict";

let express = require('express');

class Webserver{
    constructor(twabot){
        //this.twabot = twabot.channelCrawler.activeChannels[name];
        this.app = express();

        //app.use('/user/:user/:diagramm?', function (req, res){

        //});

        this.app.use(express.static('public'));
    }

    startServer() {
        this.app.listen(80);
    }
};

if (require.main === module) {
    let web = new Webserver(1);
    web.startServer();
}