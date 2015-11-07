var net = require('net');

var HOST = 'irc.twitch.tv';
var PORT = 6667;
var NICK = 'hochschuleaugsburg';
var PASS = 'oauth:lhq4ad0tqxgkxu9kxbo65jtpppqm47';

var CHAN = 'starcraft';

var client = new net.Socket();

function fetch (channel) {
	client.connect(PORT, HOST);
	console.log('maybe connected now?');
	client.connect(PORT, HOST, function() {
		console.log('CONNECTED TO: ' + HOST + ':' + PORT);
		client.write('PASS '+PASS+'%s\r\n');
		client.write('NICK '+NICK+'%s\r\n');
		//client.write('JOIN '+CHAN+'%s\r\n');
		console.log('send stuff');
	});
	
	client.on('connect', function(idk) {
		console.log('idk:',idk);
	});
	client.on('data', function(data) {
		console.log('DATA: ' + data);
		// Close the client socket completely
		//client.destroy();
	});
	
	client.on('close', function() {
    	console.log('Connection closed');
	});
}

try {
	fetch();
} catch (e) {
	console.log('caught an error:',e);
} finally {
	client.destroy();
	console.log('end of program');
}
