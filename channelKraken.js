"use strict";
/**
 * Created by Lukas on 08.11.2015.
 */

var request=require('request');
var url='https://api.twitch.tv/kraken/streams';
function getChannels(offset) {
    request({url: url+'?limit=100&offset='+offset, jason: true}, function (err, response, body) {
        console.log(err);
        //console.log(response);
        console.log(typeof body);
        let json = JSON.parse(body);
        console.log(json._links);
    });
}

function scanChannels(){
    request({url:'https://api.twitch.tv/kraken/streams/summary',json:true},function(err,response,body){
        console.log(body);
        let data=JSON.parse(body);
        console.log(data);
    });
}
scanChannels()


