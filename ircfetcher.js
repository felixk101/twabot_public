"use strict"
/**
 * Created by Lukas on 07.11.2015. modified by felix 08.11.15
 */
var fs=require('fs');
var net=require('net');
var request=require('request');
var host ;//= 'irc.twitch.tv';
var port ;//= 6667;
var NICK = 'hochschuleaugsburg';
var PASS = 'oauth:lhq4ad0tqxgkxu9kxbo65jtpppqm47';

var chan = process.argv[2] || 'bobross'; //no # sign!

function fetchChat(chan){
	//fs.open(chan+'_log.json', a);
	getChannelHost(chan);
}

function getChannelHost(chan){
	console.log('Looking up https://api.twitch.tv/api/channels/'+chan+'/chat_properties');
	//Ask Twitch for information about the channel, including chat servers
	request({
		url: 'https://api.twitch.tv/api/channels/'+chan+'/chat_properties',
		json: true
	}, function (error, response, body) {

		if (!error && response.statusCode === 200) {
			//Use the first chat server for the channel that Twitch's API gives us
			host=body.chat_servers[0].split(":")[0];
			port=parseInt(body.chat_servers[0].split(":")[1]);
			//callback
			connectToChat({host: host, port: port},chan);
		} else {
			console.log('ERROR: Could not find any info about channel \''+chan+'\'. (error:'+error+')');
			return {error};
		}
	})
	
};

function get_message(data){
	let returnValue='';
	if(data.length-1>1){

		data=data.splice(1);
		returnValue=data.join(':');

	}else{
		returnValue=data[1];
	}
	returnValue=returnValue.replace(/\r\n/g,'');
	return returnValue;
}

function get_sender(data){

	let user=data[0].split('!');

	user[1]=user[1].split('@')[0];
	return user[0];
}

function getTimestamp(){
	let date=new Date();
	return (date.getDate()+'.'+date.getMonth()+1+'.'+date.getFullYear()+'|'+date.getHours() +
	':'+date.getMinutes()+':'+date.getSeconds()+':'+date.getMilliseconds());

}

function connectToChat(options,chan) {
	console.log('Connecting to server with arguments:',options);
	var client = net.connect(options, function () {
		console.log('Connected to Server');
		client.write('PASS ' + PASS + '\r\n');
		client.write('NICK ' + NICK + '\r\n');
		client.write('JOIN #' + chan + '\r\n');

		client.on('data', function (data) {
			data = data.toString();
			let input = data.split(':');
			if (input[0] === '') {
				input = input.splice(1);
			}
			if (input[0].split(' ')[0] === 'PING') {
				client.write('PONG ' + input[1] + '\r\n');
			} else if (input[0].split(' ')[0] === 'PART') {

			} else if (input[0].split(' ')[1] == 'PRIVMSG') {

				let message = get_message(input);
				let sender = get_sender(input);
				var dateobject = new Date();
				var timestamp = dateobject.toJSON();
				console.log(timestamp+'|'+sender + ":" + message);
				fs.appendFile(chan+'.log', timestamp+'|'+message+'\n', function (err) {
					if(err) {
						console.log('error writing log:',err);
					}
				});
			}
		});
		client.on('end', function () {
			console.log('Disconectd');
		});
	});
}

//fetchChat(chan);
exports.fetchChat=fetchChat;


