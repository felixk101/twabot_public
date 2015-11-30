"use strict";
/**
 * Created by Lukas on 09.11.2015.
 */

var fs=require('fs');
var net=require('net');
var request=require('request');
var credentials=require('./credentials.js');
var analyzer=require('./analyzer.js');
var db=require('./rethinkdb.js');
class Channel{
    constructor(name){
        this.online=false;
        this.name=name;
        this.rethinkDB=new db.RethinkDB(name);
        this.analyser=new analyzer.Analyzer(this.name,this.rethinkDB);
        this.client;
    }

    isOnline(){
        /*This function checks if the channel is online*/
        console.log(this.client.destroyed);
    }

    closeChat(){
        /*This function will close the connection to the Twitch IRC server*/
        this.client.end();
        console.log("Chat Closed")
    }

    connect(streamName){
        /*This function will start the connection attempt*/
        console.log("Start Connecting to",this.name);
        return new Promise(function(resolve,reject){
            if(credentials.DBACTIVE) {
                this.rethinkDB.connect(streamName);
            }
            let err=this.fetchChat(this.name);

            if(err){
                reject(err)
            }else{
                resolve(1)
            }
        }.bind(this));

    }

    fetchChat(chan){

        fs.open('logs/'+chan+'.json', 'a',function(err,fd){
            if(err){
                return err;
            }
        });

        return this.getChannelHost(chan,this.client);
    }

    getChannelHost(chan,client){
        /*This function will look for a twitch irc server that runs the chat of the channel.
        * If he finds a server a connection will be created.*/
        console.log('Looking up https://api.twitch.tv/api/channels/'+chan+'/chat_properties');
        //Ask Twitch for information about the channel, including chat servers

        request({
            url: 'https://api.twitch.tv/api/channels/'+chan+'/chat_properties',
            json: true
        },  (error, response, body)=>{

            if (!error && response.statusCode === 200) {
                //Use the first chat server for the channel that Twitch's API gives us
                this.host=body.chat_servers[0].split(":")[0];
                this.port=parseInt(body.chat_servers[0].split(":")[1]);

                this.connectToChat({host: this.host, port: this.port},chan,client);

            } else {
                console.log('ERROR: Could not find any info about channel \''+chan+'\'. (error:'+error+')');
                return {error};
            }
        })

    }

    connectToChat(options,chan,client) {
        /*This function will connect to the Twitch irc server. After a successful connection, it will receive
        * chatt messages thru the data-Event.*/
        console.log('Connecting to server with arguments:',options);
        this.client = net.connect(options, () => {
            console.log('Connected to Server');
            this.client.write('PASS ' + credentials.PASS + '\r\n');
            this.client.write('NICK ' + credentials.NICK + '\r\n');
            this.client.write('JOIN #' + chan + '\r\n');
            this.online=true;
            this.client.on('data',  data =>{

                data = data.toString();
                let input = data.split(':');
                if (input[0] === '') {
                    input = input.splice(1);
                }
                if (input[0].split(' ')[0] === 'PING') {
                    this.client.write('PONG ' + input[1] + '\r\n');
                } else if (input[0].split(' ')[0] === 'PART') {

                } else if (input[0].split(' ')[1] == 'PRIVMSG') {
                    //let message = Channel.get_message(input);
                    //let sender = Channel.get_sender(input);
                    let dateobject = new Date();
                    let timestamp = dateobject.toJSON();
					this.analyser.analyzeData(Date.now()+"|"+input);
                    //console.log(timestamp+'|'+sender + ":" + message);
                    fs.appendFile('logs/'+chan+'.log', this.getTimestamp()+'|'+input+'\n', function (err) {
                        if(err) {
                            console.log('error writing log:',err);
                        }
                    });
                }
            });
            this.client.on('end', function () {
                console.log('Disconectd');
            });
        });
    }


    getTimestamp() {
        let date = new Date();
        return (date.getUTCDate() + '.' + date.getUTCMonth() + '.' + date.getUTCFullYear() + ';' + date.getUTCHours() +
        ':' + date.getUTCMinutes() + ':' + date.getUTCSeconds() + ':' + date.getUTCMilliseconds());
    }
    getName(){
        return this.name;
    }

}

exports.Channel=Channel;

//let chann=new Channel('kbncsgo');
//chann.connect();
//let chan=new Channel('cohhcarnage');
//chan.connect();
//console.log(chan.getTimestamp())
