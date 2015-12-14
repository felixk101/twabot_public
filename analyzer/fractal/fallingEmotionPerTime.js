"use strict";
let jsonfile = require('./../../jsonemotions.json')
let equal = require('deep-equal');
//console.log(jsonfile);
//jsonfile=JSON.parse(x);
/*
 * The FallingEmotionPerTime Analyzer determines what emotions are sent per period and makes a nice decaying display
 */

//over what time period to measure, in ms
let periodLength = 1000;

class Analyzer{


    constructor(channelName,rethinkDB,viewers) {
		this.rethinkDB=rethinkDB;
		this.channelName=channelName;
		this.viewers=viewers;
		this.periodStart=Date.now();
		this.periodEnd=Date.now() + periodLength;
		this.startemotion = {
				"amused":0.0,
				"annoyed":0.0,
				"aroused":0.0,
				"bored":0.0,
                "embarassed":0.0,
				"excited":0.0,
				"happy":0.0,
                "hating":0.0,
				"loving":0.0,
                "provoking":0.0,
				"rage":0.0,
                "sad":0.0,
                "surprised":0.0,
		}
		this.decayRate = viewers/3000*2;
		//this.decayRate = rethinkDB.viewerCount; //round up!
	
		//deep copy, but fast
		this.emotion = JSON.parse(JSON.stringify(this.startemotion))
		let self = this;

		//advance the period of measurement and reset counter
		setInterval(function(){
			//only push the analysis when this period is done
			self.pushAnalysis();
			self.periodStart = Date.now();
			self.periodEnd = self.periodStart + periodLength;
			let ems = Object.keys(self.emotion)
			ems.map((e) => {
				self.emotion[e] = Math.max(Math.round(self.emotion[e]-self.decayRate), 0)
			});
			//self.emotion = JSON.parse(JSON.stringify(self.startemotion))
		}, periodLength);
		
    }
	process(message, timeStamp) {
		if (timeStamp > this.periodStart && timeStamp < this.periodEnd) {
			this.analyzeEmotions(message);
		} else {
			//should not be possible!!!
			//but we're going to ignore them
			if (timeStamp > this.periodEnd) {
				//console.log('message is',timeStamp-this.periodEnd,'ms AFTER period end!');
			} else {
				//console.log('message is',this.periodStart-timeStamp,'ms BEFORE period start!');
			}
		}
		
	}
	pushAnalysis() {
		//replace this with a database push
		if (equal(this.emotion,this.startemotion)) {
			//no emotions detected
		} else {
			//at least one emotion detected
		}
		//we should update the data either way
		this.rethinkDB.writeData('fallingEmotions',this.emotion);
		//console.log(this.emotion);
	}

	analyzeEmotions(message) {
		let substrings = Object.keys(jsonfile);
		substrings.map((substring) => {
			if (message.indexOf(substring) > -1) {
				let properties = Object.keys(jsonfile[substring]);
				properties.map((property) => {
					if (jsonfile[substring][property].strength) {
						//console.log('incrementing emotion.'+this.emotion[property]);
						this.emotion[property] = Math.min(this.emotion[property]+jsonfile[substring][property].strength, 1000);				
						//console.log('this.emotion is now:',this.emotion);
						
					}
				});
			}
		});
	}
}

exports.Analyzer=Analyzer;

