"use strict";
let emotions = require('../jsonemotions.json');
let significants = JSON.parse(JSON.stringify(emotions));
let fs = require('fs');
let commonwords = require('common-words');

class Trainer{
    constructor(){
		this.busy = false;
		setInterval(function() {
			let data = JSON.stringify(emotions, null, '\t');
			fs.writeFile('./trained-emotions.json',data,function(err) {
				if (err) {
					console.log(err);
				} else {
					//console.log('Wrote to trained-emotions.json');
				}
			});
			data = JSON.stringify(significants, null, '\t');
			fs.writeFile('./significant-trained-emotions.json',data,function(err) {
				if (err) {
					console.log(err);
				} else {
					//console.log('Wrote to significant-trained-emotions.json');
				}
			});
			//fs.readFile('./trained-emotions.json',function(err, data) {
			//	if (err) {
			//		console.log(err);
			//	} else {
			//		console.log('Read from trained-emotions.json');
			//	}
			//	emotions = JSON.parse(data);
			//	
			//});
			//overwrite jsonemotions
		}, 5000);
    }
	
	process(message) {
		//extract words from rawData
		message = (message+'').split(',',2)[1];
		message = message.replace(/\r\n/g,'');
		let words = message.split(' ');
		let knownString = false;
		for (let word of words) {
			if (Object.keys(emotions).indexOf(word) > -1) {
				knownString = word;
			}
		}
		//if there's a string whose emotions we know
		if (knownString) {
			for (let word of words) {
				let properties = Object.keys(emotions[knownString]);
				//if any word doesn't exist yet in our emotions file
				if (Object.keys(emotions).indexOf(word) == -1) {
					//get all the emotions from the known String
					// and set their strengths to 1
					properties.map((property) => {
						if (emotions[knownString][property].strength) {
							//console.log('trying to create emotions.'+word+'');
							emotions[word]={};
							emotions[word][property]={};
							emotions[word][property].strength = 1;
						}
					});
					emotions[word].canBeChanged=true;
				//if the word does exist, increase their strength by 1 
					//for each emotion in the known String
					//(note that some values need to be initialized first)
				} else if (emotions[word].canBeChanged) {
					properties.map((property) => {
						if (emotions[knownString][property].strength) {
							if (!emotions[word][property]) {
								emotions[word][property] = {};
							}
							if (emotions[word][property].strength && emotions[word][property].strength <= 100) {
								emotions[word][property].strength += 1;
								if (emotions[word][property].strength > 25 && !this.isCommon(word)) {
									//console.log('emotions.'+word+'.'+property+'.strength = '+emotions[word][property].strength+' > 25 ?!');
									significants[word] = emotions[word];
								}
							} else {
								emotions[word][property].strength = 1;
							}
						}
					});
				}
			}
		//console.log();
		//console.log(emotions);
		//console.log('emotions now has',Object.keys(emotions).length,'entries');
		}
	}

	isCommon(string) {
		commonwords.forEach(function(obj) {
			if (obj.word == string) 
				return true
		});
		return false;
	}
}
exports.Trainer = Trainer;

