"use strict";
let jsonfile = require('./../../jsonemotions.json')
const equal = require('deep-equal');
/*
 * The FallingEmotionPerTime Analyzer determines what emotions are sent in a time period and creates a nice decaying display
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
		//the decayRate of emotions depends on the number of viewers
		this.decayRate = viewers/3000*2;
	
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
			//subtract the decayrate, but don't let values go below zero
			ems.map((e) => {
				self.emotion[e] = Math.max(Math.round(self.emotion[e]-self.decayRate), 0)
			});
		}, periodLength);
    }

	process(message, timeStamp) {
		if (timeStamp > this.periodStart && timeStamp < this.periodEnd) {
			this.analyzeEmotions(message);
		} else {
			//ignore messages outside of this time period
		}
	}

	pushAnalysis() {
		if (equal(this.emotion,this.startemotion)) {
			//no emotions detected
		} else {
			//at least one emotion detected
		}
		//we should update the data either way
		this.rethinkDB.writeData('fallingEmotions',this.emotion);
	}

	analyzeEmotions(message) {
		//almost the same as emotionsPerTime
		let substrings = Object.keys(jsonfile);
		substrings.map((substring) => {
			if (message.indexOf(substring) > -1) {
				let properties = Object.keys(jsonfile[substring]);
				properties.map((property) => {
					if (jsonfile[substring][property].strength) {
						//Don't let any emotion go over 1000 in strength
						this.emotion[property] = Math.min(this.emotion[property]+jsonfile[substring][property].strength, 1000);
					}
				});
			}
		});
	}

	getCurrentEmotions() {
		return this.emotion;
	}
}

exports.Analyzer=Analyzer;

