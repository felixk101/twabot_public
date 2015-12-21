"use strict";
/**
 * Created by Lukas on 09.11.2015.
 */

var fs=require('fs');
var net=require('net');
var request=require('request');
var credentials=require('./../credentials/credentials.js');
var analyzer=require('./../analyzer/analyzer.js');
var db=require('./../rethinkdb/rethinkdb.js');
class Channel{
    constructor(name,viewers){
        this.online=false;
        this.name=name;
		this.viewers=viewers;
        this.rethinkDB=new db.RethinkDB(name);
        this.analyser=new analyzer.Analyzer(this.name,this.rethinkDB,this.viewers);
        this.logo;
        this.viewer;
        this.client;
        this.gotUpdated=false;
    }

    isOnline(){
        /*This function checks if the channel is online*/
        console.log(this.client.destroyed);
    }

    closeChat(){
        /*This function will close the connection to the Twitch IRC server*/

        this.client.end();
        this.rethinkDB.close();
        console.log('Chat of '+this.name+' closed')
    }

    connect(streamName){
        /*This function will start the connection attempt*/
        console.log('Start Connecting to',this.name,streamName);
        return new Promise(function(resolve,reject){
            if(credentials.DBACTIVE) {
                this.rethinkDB.connect(streamName);
            }
            let err=this.fetchChat(this.name);

            if(err){
                reject(err)
                return;
            }else{
                resolve(1)
            }
        }.bind(this));

    }

    fetchChat(chan){

        //fs.open('logs/'+chan+'.json', 'a',function(err,fd){
        //    if(err){
        //        return err;
        //    }
        //});

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
                console.error('ERROR: Could not find any info about channel \''+chan+'\'. (error:'+error+')');
                return {error};
            }
        })

    }

    connectToChat(options,chan,client) {
        /*This function will connect to the Twitch irc server. After a successful connection, it will receive
        * chatt messages thru the data-Event.*/
        console.log('Connecting to server with arguments:',options);
        this.client = net.connect(options, () => {
            console.log('Connected to Server, Channel: '+chan);
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
                    let dateobject = new Date();
                    let timestamp = dateobject.toJSON();
					this.analyser.analyzeData(new Date()+"|"+input);
                    //console.log(timestamp+'|'+sender + ":" + message);
                    //fs.appendFile('logs/'+chan+'.log', this.getTimestamp()+'|'+input+'\n', function (err) {
                    //    if(err) {
                    //        console.log('error writing log:',err);
                    //    }
                    //});
                }
            });
            this.client.on('end', () => {
                console.log('Chat of '+this.getChannelName()+' has disconectd');
            });

            this.client.on('error',(err)=>{
                console.error(err);
            })
        });
    }


    getTimestamp() {
        let date = new Date();
        return (date.getUTCDate() + '.' + date.getUTCMonth() + '.' + date.getUTCFullYear() + ';' + date.getUTCHours() +
        ':' + date.getUTCMinutes() + ':' + date.getUTCSeconds() + ':' + date.getUTCMilliseconds());
    }
    getChannelName(){
        return this.name;
    }
		
	getCurrentEmotions() {
		return this.analyser.getCurrentEmotions();
	}

}

exports.Channel=Channel;
if (require.main === module) {
    let chann=new Channel('lirik',500);
    chann.connect(' GAIMEZ - store: dbh.la/lirik - twitter: @LIRIK GAIMEZ - store: dbh.la/lirik - twitter: @LIRIK ');
    setTimeout(()=>{
        chann.rethinkDB.getTableWithType('raw')
            .then((result)=>{
                console.log(result)
            })
    },8000)
}
