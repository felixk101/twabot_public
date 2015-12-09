"use strict";
/**
 * Created by Lukas on 08.11.2015.
 */

/*--------------------------------------------------------------------
!!!!  ACHTUNG das Script nur einmal alle 30 sekunden ausführen !!!!!
----------------------------------------------------------------------*/

//der channelkraken holt sich 50 Streams und verbindet sich über die fetchChat Methode mit deren IRC-Chats.

var request=require('request');
var Channel=require('./channel');
var url='https://api.twitch.tv/kraken/streams';




class ChannelCrawler{
    constructor(){
        this.viewerLimit=250;
        this.url='https://api.twitch.tv/kraken/streams';
        this.activeChannels={};
        this.newChannelList=[];
        this.channelLimit=50;
        this.crawlerActive=false;
    }
    getChannels(offset) {
        /*This function creates a GET-Request to the address url with the arguments limit and offset.
         * Twitch holds a list of all active streams ordered by the Viewer count. The stream at the start of the list
         * has the most viewers.
         * With the argument offset, you will chose where you will start in the list and with the argument limit you will
         * determine the number of Streams you will get.
         * For instace if you want to get 50 streams at the position 200
         * of the list you have to type 'url'?limit=50&offset=50.
         *
         * params:
         *  offset: The starting position of the list of streams.
         * */
        console.log('Attempting to access Twitch API...');

        return new Promise(function(resolve,reject){
            request({url: url + '?limit='+this.channelLimit+'&offset=' + offset, json: true}, function (err, response, body) {

                let newChannels=[]
                let viewerCount=-1;
                for (let x = 0; x < this.channelLimit; x++) {
                    //console.log(body.streams[x],'\n');
                    if(viewerCount===-1){
                        viewerCount=parseInt(body.streams[x].viewers);
                    }else if(parseInt(body.streams[x].viewers)<viewerCount){
                        viewerCount=parseInt(body.streams[x].viewers);
                    }

                    if(!(body.streams[x].channel.name in this.activeChannels)) {
                        newChannels.push([body.streams[x].channel.name,body.streams[x].channel.status]);
                    }
                    //if(this.newChannelList.indexOf(body.streams[x].channel.name)===-1){
                    //    this.newChannelList.push(body.streams[x].channel.name);
                    //}

                }

                let fetchChannels=newChannels.map(function(data){
                    let channel=new Channel.Channel(data[0]);
                    this.activeChannels[channel.getChannelName()]=channel;
                    return channel.connect(data[1]);
                }.bind(this));

                Promise.all(fetchChannels).then(function(result){
                    resolve(viewerCount);

                }).catch(function (err) {
                    //console.log("Test");
                    reject(err);
                    return;
                });

            }.bind(this));
        }.bind(this))
    }

    * registerChannels(offset) {
    /*This function creates a GET-Request to the address 'https://api.twitch.tv/kraken/streams/summary.'
     * Twitch will send a json object wich contains three vaules, first one is the number of active streamms
     * the second one is the total number of viewers on Twitch at the moment and the third value is a list of
     * links with one link*/

    yield setTimeout(function(){
        this.getChannels(offset).then(function(result){
            if(result>this.viewerLimit) {
                console.log("Channel crawler cooldown. Streams: "+this.activeChannels.length);
                this.registerChannels(offset+this.channelLimit).next();
            }else{
                console.log("Channel crawler ends.Streams: "+this.activeChannels.size);
                this.crawlerActive=false;

            }

        }.bind(this)).catch(function(err){
            console.log("Promise error: "+err)

        });

    }.bind(this),31000)
}
    startCrawler(){
        if(this.crawlerActive===false){
            this.crawlerActive=true;
            this.registerChannels(0).next()


        }else{
            console.log('Crawler already active');
        }

    }

    getActiveChannelsDC(){
        return JSON.parse(JSON.stringify(this.activeChannels));
    }

    deleteChannel(name){
        delete this.activeChannels[name];
    }

    closeChannel(name){
        this.activeChannels[name].closeChat();
    }

}
//let crawler=new ChannelCrawler();
//crawler.registerChannels(0).next()
exports.ChannelCrawler=ChannelCrawler;


