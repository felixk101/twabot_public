"use strict";
let jsonfile = require('./../../jsonemotions.json')
let fs = require('fs');
const equal = require('deep-equal');
/*
 * The EmotionPerTime Analyzer determines what emotions are sent in a certain time period
 */

//over what time period to measure, in ms
let periodLength = 10000;

class Analyzer{

    constructor(channelName,rethinkDB) {
		this.rethinkDB=rethinkDB;
		this.channelName=channelName;
		this.periodStart=Date.now();
		this.periodEnd=Date.now() + periodLength;
		this.counter = 0
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
		//deep copy, but fast - 
		this.emotion = JSON.parse(JSON.stringify(this.startemotion))
		let self = this;

		//advance the period of measurement and reset counter
		setInterval(function(){
			//only push the analysis when this period is done
			self.pushAnalysis();
			self.periodStart = Date.now();
			self.periodEnd = self.periodStart + periodLength;
			self.emotion = JSON.parse(JSON.stringify(self.startemotion))
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
			//ignore messages outside of our time period
		}
	}

	pushAnalysis() {
		if (equal(this.emotion,this.startemotion)) {
			//no emotions were detected
		} else {
			//at least one emotion was detected
		}
		//we should update the database either way
		this.rethinkDB.writeData('fractal',this.emotion);
	}

	analyzeEmotions(message) {
		/* 
		 * for every emote/smily in our jsonfile
		 * 	if our message contains it at least once:
		 * 		add all the properties with a strength attribute to us
		 * 		(a strength attribute means the property is an emotion)
		*/
		let substrings = Object.keys(jsonfile);
		substrings.map((substring) => {
			if (message.indexOf(substring) > -1) {
				let properties = Object.keys(jsonfile[substring]);
				properties.map((property) => {
					if (jsonfile[substring][property].strength) {
						this.emotion[property] += jsonfile[substring][property].strength;
					}
				});
			}
		});
	}
}

exports.Analyzer=Analyzer;

