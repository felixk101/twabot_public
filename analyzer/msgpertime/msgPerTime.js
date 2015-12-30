"use strict";
/*
 * The MessagesPerSecond Analyzer determines how many words are sent in a certain time period
 */

//over what time period to measure, in ms
let periodLength = 2500;

class Analyzer{


    constructor(channelName,rethinkDB) {
		this.rethinkDB=rethinkDB;
		this.channelName=channelName;
		this.periodStart=Date.now();
		this.periodEnd=Date.now() + periodLength;
		this.counter = 0;
	
		let self = this;

		//advance the period of measurement and reset counter
		setInterval(function(){
			//only push the analysis when this period is done
			self.pushAnalysis();
			self.periodStart = Date.now();
			self.periodEnd = self.periodStart + periodLength;
			self.counter = 0;
		}, periodLength);
		
    }

	//here we are told to handle a chat message
	process(message, timeStamp) {
		if (timeStamp > this.periodStart && timeStamp < this.periodEnd) {
			this.counter += 1;
		} else {
			//ignore the message if outside of this timeStamp
		}
		
	}
	pushAnalysis() {
		this.rethinkDB.writeData('msgPerTime',this.counter);
	}

	analysis() {
		//find the average words per second
		return this.counter * 1000/periodLength;
	}
}

exports.Analyzer=Analyzer;
