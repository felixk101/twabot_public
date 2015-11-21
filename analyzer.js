"use strict";
/**
 * Created by Lukas on 16.11.2015.
 */
var fs = require('fs');
let emotions;
fs.readFile('emotions.json','utf-8',function(err,data){
    if (err) {
		throw err; 
	}
	emotions = JSON.parse(data);
});

class Analyzer{

    constructor(){
        this.trainmode=false;
		console.log(this.test())
    }

    test(){
        return emotions;
    }

    analyzeData(rawData) {
        let sender = this.get_sender(rawData);
        let message = this.get_message(rawData);
        let timeStamp=this.getTimeStamp(rawData);
        //message=filterMessage();
        if (this.trainmode === false) {
            setTimeout(this.fractalAnalyze(), 0);
            setTimeout(this.wordspersecond(sender,message), 0);
        }
    }

    fractalAnalyze(sender,message){

    }
    wordspersecond(sender,message){
//        let words=message.split(" ");
   //     console.log(words)
    }

    getTimeStamp(data){
        let timeStamp=data.split('|')[0]
        return timeStamp;
    }

    get_message(data){
        /*This function filters the message out of the received data.*/
        data=data.split(',');
        let returnValue=data.splice(1).join(',');

        returnValue=returnValue.replace(/\r\n/g,'');
        return returnValue;
    }

    get_sender(data){
        /*This funciton filters the sender out of the received data.*/
        let user=data.split('|')[1].split('!');

        user=user[1].split('@')[0];

        return user;
    }
}

exports.Analyzer=Analyzer;
