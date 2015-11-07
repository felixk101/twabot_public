"use strict"
/**
 * Created by Lukas on 07.11.2015.
 */
var net=require('net');
var HOST = 'irc.twitch.tv';
var PORT = 6667;
var NICK = 'hochschuleaugsburg';
var PASS = 'oauth:lhq4ad0tqxgkxu9kxbo65jtpppqm47';
var CHAN = '#lirik'

var options={port:PORT,host:HOST};

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
	return (date.getDay()+'.'+date.getMonth()+'.'+date.getFullYear()+'|'+date.getHours() +
	':'+date.getMinutes()+':'+date.getSeconds()+':'+date.getMilliseconds());

}

function connectToChat() {
	var client = net.connect(options, function () {
		console.log('Connected to Server');
		client.write('PASS ' + PASS + '\r\n');
		client.write('NICK ' + NICK + '\r\n');
		client.write('JOIN ' + CHAN + '\r\n');

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
				console.log(getTimestamp()+'|'+sender + ":" + message);
			}
		});
		client.on('end', function () {
			console.log('Disconectd');
		});
	});
}

connectToChat();


