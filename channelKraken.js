"use strict";
/**
 * Created by Lukas on 08.11.2015.
 */

/*--------------------------------------------------------------------
!!!!  ACHTUNG das Script nur einmal alle 30 sekunden ausführen !!!!!
----------------------------------------------------------------------*/



var request=require('request');
var ircfetcher=require('./ircfetcher.js')
var url='https://api.twitch.tv/kraken/streams';

var activeChannels=[];
function getChannels(offset) {
    request({url: url+'?limit=50&offset='+offset, json:true}, function (err, response, body) {
        //console.log(err);
        //console.log(response);
        //console.log(body);

        for (let x=0;x<50;x++){
            ircfetcher.fetchChat(body.streams[x].channel.name);
        }
        //console.log(json.streams[x].channel.name);
    });
}
function registerCallbackCounter(){

}

function registerChannels(){
    let channelCount=0;
    let registerChannels=0;
    let callbacksDone=false;
    request({url:'https://api.twitch.tv/kraken/streams/summary',json:true},function(err,response,body){
        console.log(body.channels);
        channelCount=parseInt(body.channels);


            getChannels(0);
            channelCount++;


        //console.log(Math.floor(channelCount/50));
    });
}
getChannels(0);


