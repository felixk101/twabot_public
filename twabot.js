"use strict";
/**
 * Created by Lukas on 17.11.2015.
 */
const ChannelCrawler=require('./channelCrawler.js')

class Twabot{

    constructor(){
        this.webserver=undefined;
        this.channelCrawler=new ChannelCrawler.ChannelCrawler();
    }

    start(){
        this.channelCrawler.registerChannels(0).next()
    }

}

let twabot=new Twabot();
twabot.start();