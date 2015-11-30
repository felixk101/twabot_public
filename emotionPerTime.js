"use strict";
let jsonfile = require('./jsonemotions.json')
let equal = require('deep-equal');
//console.log(jsonfile);
//jsonfile=JSON.parse(x);
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
		//deep copy, but fast
		this.emotion = JSON.parse(JSON.stringify(this.startemotion))
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
		if (equal(this.emotion,this.startemotion)) {
			console.log(this.emotion,'has zeroes everyhwere for channel',this.channelName);
			
		} else {
			console.log('emotionAna:',this.emotion,'in last period for channel',this.channelName,'!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
		}
	}
	
	analyzeEmotions(message) {
		let substrings = Object.keys(jsonfile);
		substrings.map((substring) => {
			if (message.indexOf(substring) > -1) {
				let properties = Object.keys(jsonfile[substring]);
				properties.map((property) => {
					if (jsonfile[substring][property].strength) {
						//console.log('incrementing emotion.'+this.emotion[property]);
						this.emotion[property] += jsonfile[substring][property].strength;				
						//console.log('this.emotion is now:',this.emotion);
						
					}
				});
				//console.log(jsonfile[substring]);
			}
			//console.log(key);
			//console.log(jsonfile[key]);
		});

		

		
		//for (let substring in substrings) {
		//	console.log(substring);
			//console.log('1',substrings[substring]);
			//substring = substrings[substring];
			//console.log(substring);
			//console.log(jsonfile[substrings[substring]]);
			//console.log('jsonfile.'+substrings[substring]+':'+jsonfile[substrings[substring]].toString());
			
			//if the substring exists at least once in the message
			/*
			if (message.indexOf(substring) > -1) {
				//console.log('keys for jsonfile:',substrings);
				//console.log('keys for jsonfile.'+substring+':',jsonfile.substring);
				console.log('jsonfile.'+substrings[substring]+':');
				console.log(jsonfile[substrings[substring]]);
				console.log('Object.keys(jsonfile.'+substrings[substring]+'):');
				console.log(Object.keys(jsonfile[substrings[substring]]));
				let propertiesForSubstring = Object.keys(jsonfile[substrings[substring]]);
				for (let property in propertiesForSubstring) {
					//if the property is an emotion
					let strength = jsonfile[substrings[substring]][propertiesForSubstring[property]].strength;
					if () {
						this.emotion[property] += jsonfile[substring][property].strength;
					}
				}
			}*/
	//	}
	}
}

exports.Analyzer=Analyzer;
//let a = new Analyzer('TestChannel');
//a.analyzeEmotions('<3 ^^ BibleThump I\'m sad');

