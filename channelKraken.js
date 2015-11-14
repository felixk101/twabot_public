"use strict";
/**
 * Created by Lukas on 08.11.2015.
 */

/*--------------------------------------------------------------------
!!!!  ACHTUNG das Script nur einmal alle 30 sekunden ausführen !!!!!
----------------------------------------------------------------------*/

//der channelkraken holt sich 50 Streams und verbindet sich über die fetchChat Methode mit deren IRC-Chats.

var request=require('request');
var ircfetcher=require('./ircfetcher.js')
var url='https://api.twitch.tv/kraken/streams';

var activeChannels=[];

function getChannels(offset) {
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
    request({url: url+'?limit=50&offset='+offset, json:true}, function (err, response, body) {

        for (let x=0;x<50;x++){
            ircfetcher.fetchChat(body.streams[x].channel.name);
        }
        //console.log(json.streams[x].channel.name);
    });
}


function registerChannels(){
    /*This function creates a GET-Request to the address 'https://api.twitch.tv/kraken/streams/summary.'
    * Twitch will send a json object wich contains three vaules, first one is the number of active streamms
    * the second one is the total number of viewers on Twitch at the moment and the third value is a list of
    * links with one link*/
    let channelCount=0;
    let registerChannels=0;
    let callbacksDone=false;
    request({url:'https://api.twitch.tv/kraken/streams/summary',json:true},function(err,response,body){
        console.log(body.channels);
        channelCount=parseInt(body.channels);


           getChannels(0);



        console.log(Math.floor(channelCount/50));
    });
}
getChannels()


