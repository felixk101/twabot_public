"use strict";
let jsonfile = require('./../../jsonemotions.json')
let fs = require('fs');
const equal = require('deep-equal');
/*
 * The FallingEmotionPerTime Analyzer determines what emotions are sent in a time period and creates a nice decaying display
 */

//over what time period to measure, in ms
let periodLength = 100;

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
		//and on the period length
		this.defaultdecayRate = viewers/400 * periodLength/100;
		this.decayRate = this.defaultdecayRate;
	
		//deep copy, but fast
		this.emotion = JSON.parse(JSON.stringify(this.startemotion))
		let self = this;

		//advance the period of measurement and reset counter
		setInterval(function(){
			let total = 0;
			//only push the analysis when this period is done
			self.pushAnalysis();
			self.periodStart = Date.now();
			self.periodEnd = self.periodStart + periodLength;
			let ems = Object.keys(self.emotion)
			//subtract the decayrate, but don't let values go below zero
			ems.map((e) => {
				self.emotion[e] = Math.max(Math.round(self.emotion[e]-self.decayRate), 0)
				total += self.emotion[e]
			});
			//can be modified in case the values get too high
			if (total > 1000) {
				self.decayRate = self.defaultdecayRate;
			} else {
				self.decayRate = self.defaultdecayRate;
			}
		}, periodLength);

		setInterval(function() {
			fs.readFile('./significant-trained-emotions.json', function(err,data) {
				if (err) {
					console.log(err);
				} else {
					jsonfile = JSON.parse(data);
				}
			}, 5000);
		});

    }

	process(message, timeStamp) {
		if (timeStamp > this.periodStart && timeStamp < this.periodEnd) {
			this.analyzeEmotions(message);
		} else {
			if (timeStamp < this.periodStart) {
				//console.log(this.periodStart-timeStamp,' ms before');
			} else {
				//console.log(timeStamp - this.periodEnd,' ms behind');
			}
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

