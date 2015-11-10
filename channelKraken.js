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
	console.log('Attempting to access Twitch API...');

    request({url: url+'?limit=50&offset='+offset}, function (err, response, body) {
        //console.log(err);
        //console.log(response);
        //console.log(body);
		if (!err) {
        	let json = JSON.parse(body);
        	for (let x=0;x<50;x++){
				console.log('fetching channel number',x);           		 
				ircfetcher.fetchChat(json.streams[x].channel.name);
        	}
		} else {

			console.log('error',err);
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


