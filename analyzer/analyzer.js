"use strict";
/**
 * Created by Lukas on 16.11.2015.
 */
let fs = require('fs');
//analyzers
let mpt = require('./msgpertime/msgPerTime.js');
let ept = require('./fractal/emotionPerTime.js');
let fal = require('./fractal/fallingEmotionPerTime.js')

let emotions = [];
fs.readFile('jsonemotions.json','utf-8',function(err,data){
    if (err) {
		throw err;
	}
	emotions = JSON.parse(data);

});

class Analyzer{

    constructor(channelName,rethinkDB,viewers){

        this.trainmode=false;
        this.rethinkDB=rethinkDB;
		//this.analyzers=[new mpt.Analyzer()];
		this.mptAnalyzer = new mpt.Analyzer(channelName,rethinkDB);
		this.eptAnalyzer = new ept.Analyzer(channelName,rethinkDB);
		this.falAnalyzer = new fal.Analyzer(channelName,rethinkDB,viewers);
		
    }

    analyzeData(rawData) {
        let sender = this.get_sender(rawData);
        let message = this.get_message(rawData);
		let timeStamp = this.getTimeStamp(rawData);
        let text={type:'raw',data:{timeStamp:timeStamp,rawData:rawData}};
        let testData=JSON.parse(JSON.stringify(text));

        //let timeStamp=this.getTimeStamp(rawData);
        //let timeStamp=this.getTimeStamp(rawData);
        //message=filterMessage();
        if (this.trainmode === false) {
            //setTimeout(this.fractalAnalyze(), 0);
            //setTimeout(this.wordspersecond(sender,message), 0);

            this.rethinkDB.writeData('raw',rawData);

			//setTimeout(this.mptAnalyzer.process(message, Date.now()), 0);
			//setTimeout(this.eptAnalyzer.process(message, Date.now()), 0);
			setTimeout(this.mptAnalyzer.process(message, Date.now()), 0);
			setTimeout(this.eptAnalyzer.process(message, Date.now()), 0);
			setTimeout(this.falAnalyzer.process(message, Date.now()), 0);
        }
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
