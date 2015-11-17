"use strict";
/**
 * Created by Lukas on 16.11.2015.
 */

var emotions=require('fs').readFile('emotions.json','utf-8',function(err,data){
    emotions="";
});

class Analyzer{


    constructor(){
        this.trainmode=false;


    }

    test(){
        return emotions;
    }

    analyzeData(rawData) {
        let sender = this.get_sender(rawData);
        let message = this.get_message(rawData);
        //let timeStamp=getTimeStamp(rawData);
        //message=filterMessage();
        if (this.trainmode === false) {
            setTimeout(this.fractalAnalyze(), 0);
            setTimeout(this.wordspersecond(sender,message), 0);
        }
    }

    fractalAnalyze(sender,message){

    }
    wordspersecond(sender,message){
        let words=message.split(" ");
        console.log(words)
    }

    getTimeStamp(){

    }

    get_message(data){
        /*This function filters the message out of the received data.*/
        let returnValue='';
        if(data.length-1>1){

            data=data.splice(1);
            returnValue=data.join(':');

        }else{
            returnValue=data[1];
        }
        returnValue=returnValue.replace(/\r\n/g,'');
        return returnValue;
    }

    get_sender(data){
        /*This funciton filters the sender out of the received data.*/
        let user=data[0].split('!');

        user[1]=user[1].split('@')[0];
        return user[0];
    }
}

exports.Analyzer=Analyzer;
