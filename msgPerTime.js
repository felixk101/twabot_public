"use strict";
/*
 * The MessagesPerSecond Analyzer determines how many words are sent per second
 * TODO: implement a rolling time period, so the counter doesn't totally reset 
 */

//how often we print the analysis to terminal/push to the Database, in ms
let timeBetweenOutputs = 5000;
//over what time period to measure, in ms
let periodLength = 20000;

class Analyzer{


    constructor() {
		this.periodStart=Date.now();
		this.periodEnd=Date.now() + periodLength;
		this.counter = 0
		//schedule output
		let self = this;
		setInterval(function(){
			console.log(self.analysis(),'words per second');
		}, timeBetweenOutputs);
		//advance the period of measurement and reset counter
		setInterval(function(){
			this.periodStart += periodLength;
			this.periodEnd += periodLength;
			this.counter = 0;
		}, periodLength);
		
    }
	process(message, timeStamp) {
		if (!(timeStamp > this.periodStart && timeStamp < this.periodEnd)) {
			//should not be possible!!!
			console.log('Warning: current timestamp outside measurement period!')
		} else {
			this.counter += 1;
		}
		
	}
	analysis() {
		//find the average words per second
		return this.counter * 1000/periodLength;
	}
	updatePeriod() {
		this.periodStart += 1000;
		this.periodEnd += 1000;
	}
}

exports.Analyzer=Analyzer;
