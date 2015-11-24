"use strict";
let jsonfile = require('./emotions.json')
//console.log(jsonfile);
//let emotionMap=JSON.parse(jsonfile);
/*
 * The EmotionPerTime Analyzer determines what emotions are sent per period
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
				"excited":0.0,
                "amused":0.0,
                "happy":0.0,
                "praising":0.0,
                "loving":0.0,
                "surprised":0.0,
                "bored":0.0,
                "annoyed":0.0,
                "angry":0.0,
                "provoking":0.0,
                "envious":0.0,
                "hating":0.0,
                "sad":0.0,
                "embarassed":0.0,
		}
		this.emotion = this.startemotion
		let self = this;

		//advance the period of measurement and reset counter
		setInterval(function(){
			//only push the analysis when this period is done
			self.pushAnalysis();
			self.periodStart = Date.now();
			self.periodEnd = self.periodStart + periodLength;
			self.emotion = self.startemotion;
			//console.log('periodStart is now',Date.now()-self.periodStart,'ms behind');
		}, periodLength);
		
    }
	process(message, timeStamp) {
		if (timeStamp > this.periodStart && timeStamp < this.periodEnd) {
			this.analyzeEmotions(message);
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
		if (this.emotion == this.startemotion) {
			console.log('emotionAna: Failed to register any emotions for this channel');
		} else {
			console.log('emotionAna:',this.emotion,'in last period for channel',this.channelName);
		}
	}
	
	analyzeEmotions(message) {
		for (var substring in jsonfile){
			//if the substring occurs at least once in the message
			if (message.indexOf(substring) > -1) {
				console.log(substring,'exists in a message in',this.channelName);
				//look at every emotion for that substring
				for (var emotionForSubstring in substring) {
					//console.log(emotionForSubstring);
					if (substring[emotionForSubstring][0]) {
						console.log('changing emotion',this.emotion.emotionForSubstring);
						this.emotion.emotionForSubstring += emotionForSubstring.strength;
					} else {
						console.log('no strength property for',emotionForSubstring);
					}
					
				}
			}
		}
	}
}

exports.Analyzer=Analyzer;
