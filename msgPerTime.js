"use strict";
/*
 * The MessagesPerSecond Analyzer determines how many words are sent per second
 * TODO: implement a rolling time period, so that every message counts
 */

//how often we print the analysis to terminal/push to the Database, in ms
//let timeBetweenOutputs = 1000;
//over what time period to measure, in ms
let periodLength = 10000;

class Analyzer{


    constructor(channelName,rethinkDB) {
		this.rethinkDB=rethinkDB;
		this.channelName=channelName;
		this.periodStart=Date.now();
		this.periodEnd=Date.now() + periodLength;
		this.counter = 0
	

	
		//schedule output
		//		//setInterval(function(){
		//	console.log(self.analysis(),'words per second');
		//}, timeBetweenOutputs);
		
		let self = this;


		//advance the period of measurement and reset counter
		setInterval(function(){
			//only push the analysis when this period is done
			self.pushAnalysis();
			self.periodStart = Date.now();
			self.periodEnd = self.periodStart + periodLength;
			self.counter = 0;
			//console.log('periodStart is now',Date.now()-self.periodStart,'ms behind');
		}, periodLength);
		
    }
	process(message, timeStamp) {
		if (timeStamp > this.periodStart && timeStamp < this.periodEnd) {
			this.counter += 1;
		} else {
			//should not be possible!!!
			if (timeStamp > this.periodEnd) {
				console.log('message is',timeStamp-this.periodEnd,'ms AFTER period end!');
			} else {
				console.log('message is',this.periodStart-timeStamp,'ms BEFORE period start!');
			}
		}
		
	}
	pushAnalysis() {
		//replace this with a database push
		//console.log('msgperTime:',this.counter,'messages in last period for channel',this.channelName);
	}
	analysis() {
		//find the average words per second
		return this.counter * 1000/periodLength;
	}
}

exports.Analyzer=Analyzer;
