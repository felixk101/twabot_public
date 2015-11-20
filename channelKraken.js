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
var viewerLimit=15000;


class ChannelCrawler{
    constructor(){
        this.viewerLimit=15;
        this.url='https://api.twitch.tv/kraken/streams';
        this.activeChannels=[];
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
            request({url: url + '?limit=20&offset=' + offset, json: true}, function (err, response, body) {
                console.log(this)
                let newChannels=[]
                let viewerCount=-1;
                for (let x = 0; x < 1; x++) {

                    if(viewerCount===-1){
                        viewerCount=parseInt(body.streams[x].viewers);
                    }else if(parseInt(body.streams[x].viewers)<viewerCount){
                        viewerCount=parseInt(body.streams[x].viewers);
                    }

                    if(!(body.streams[x].channel.name in this.activeChannels)) {
                        newChannels.push(body.streams[x].channel.name);
                    }

                }
                console.log(newChannels)
                let fetchChannels=newChannels.map(function(name){
                    let channel=new Channel.Channel(name);
                    this.activeChannels[channel.getName()]=channel;
                    return channel.connect();
                }.bind(this));

                Promise.all(fetchChannels).then(function(result){

                    resolve(viewerCount);

                }).catch(function (err) {
                    //console.log("Test");
                    reject(err);
                });

            }.bind(this));
        }.bind(this))
    }
    getChannelCount(){
        request({url: 'https://api.twitch.tv/kraken/streams/', json: true}, function (err, response, body) {
                console.log(body.streams[0].viewers);
                let channelCount = parseInt(body.channels);}
        );
    }

    * registerChannels(offset) {
    /*This function creates a GET-Request to the address 'https://api.twitch.tv/kraken/streams/summary.'
     * Twitch will send a json object wich contains three vaules, first one is the number of active streamms
     * the second one is the total number of viewers on Twitch at the moment and the third value is a list of
     * links with one link*/

    yield setTimeout(function(){

        getChannels(offset).then(function(result){
            if(result>this.viewerLimit) {

                console.log("Channel kraken cooldown. Streams: "+this.activeChannels.length);
                this.registerChannels(offset+20).next();
            }else{
                console.log("Channel kraken ends.Streams: "+this.activeChannels.length);
                console.log(this.activeChannels)

            }

        }).catch(function(err){
            console.log("Promise error: "+err)
        });

    },31000)
}


}
//function getChannels(offset) {
//    /*This function creates a GET-Request to the address url with the arguments limit and offset.
//     * Twitch holds a list of all active streams ordered by the Viewer count. The stream at the start of the list
//     * has the most viewers.
//     * With the argument offset, you will chose where you will start in the list and with the argument limit you will
//     * determine the number of Streams you will get.
//     * For instace if you want to get 50 streams at the position 200
//     * of the list you have to type 'url'?limit=50&offset=50.
//     *
//     * params:
//     *  offset: The starting position of the list of streams.
//     * */
//    console.log('Attempting to access Twitch API...');
//    return new Promise(function(resolve,reject){
//        request({url: url + '?limit=50&offset=' + offset, json: true}, function (err, response, body) {
//
//            let newChannels=[]
//            let viewerCount=-1;
//            for (let x = 0; x < 50; x++) {
//
//                if(viewerCount===-1){
//                    viewerCount=parseInt(body.streams[x].viewers);
//                }else if(parseInt(body.streams[x].viewers)<viewerCount){
//                    viewerCount=parseInt(body.streams[x].viewers);
//                }
//
//                if(!(activeChannels[body.streams[x].channel.name] in activeChannels)) {
//                    newChannels.push(body.streams[x].channel.name);
//                }
//
//            }
//            console.log(newChannels)
//            let fetchChannels=newChannels.map(function(name){
//                let channel=new Channel.Channel(name);
//                activeChannels[channel.getName()]=channel;
//                return channel.connect();
//            });
//
//            Promise.all(fetchChannels).then(function(result){
//
//                resolve(viewerCount);
//
//            }).catch(function (err) {
//                //console.log("Test");
//                reject(err);
//            });
//
//        });
//    })
//}
//    function getChannelCount(){
//        request({url: 'https://api.twitch.tv/kraken/streams/', json: true}, function (err, response, body) {
//            console.log(body.streams[0].viewers);
//            let channelCount = parseInt(body.channels);}
//        );
//    }
//    function* registerChannels(offset) {
//        /*This function creates a GET-Request to the address 'https://api.twitch.tv/kraken/streams/summary.'
//         * Twitch will send a json object wich contains three vaules, first one is the number of active streamms
//         * the second one is the total number of viewers on Twitch at the moment and the third value is a list of
//         * links with one link*/
//
//            yield setTimeout(function(){
//
//                getChannels(offset).then(function(result){
//                    if(result>viewerLimit) {
//
//                        console.log("Channel kraken cooldown. Streams: "+activeChannels.length);
//                        registerChannels(offset+50).next();
//                    }else{
//                        console.log("Channel kraken ends.Streams: "+activeChannels.length);
//                        console.log(activeChannels)
//
//                    }
//
//                }).catch(function(err){
//                    console.log("Promise error: "+err)
//                });
//
//            },31000)
//    }
//
//registerChannels(0).next();

let crawler=new ChannelCrawler();
crawler.getChannels(0);

