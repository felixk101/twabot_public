"use strict";
/**
 * Created by Lukas on 08.11.2015.
 */

/*--------------------------------------------------------------------
!!!!  ACHTUNG das Script nur einmal alle 30 sekunden ausführen !!!!!
----------------------------------------------------------------------*/

//der channelkraken holt sich 50 Streams und verbindet sich über die fetchChat Methode mit deren IRC-Chats.

var request=require('request');
var Channel=require('./channel');
var emotions=require('../listemotions.json');
var db=require('../rethinkdb/rethinkdb')
let trainer=require('./trainer.js');
var url='https://api.twitch.tv/kraken/streams';

class ChannelCrawler{
    constructor(){
        this.viewerLimit=30000;
        this.url='https://api.twitch.tv/kraken/streams';
        this.activeChannels={};
        this.newChannelList=[];
        this.channelLimit=50;
        this.crawlerActive=false;
		this.emotional = this.getMostEmotionalChannels();
		this.trainer = new trainer.Trainer();
    }
    getChannels(offset) {
        /*This function creates a GET-Request to the address url with the arguments limit and offset.
         * Twitch holds a list of all active streams ordered by the Viewer count. The stream at the start of the list
         * has the most viewers.
         * With the argument offset, you will chose where you will start in the list and with the argument limit you will
         * determine the number of Streams you will get.
         * For instace if you want to get 50 streams at the position 200
         * of the list you have to type 'url'?limit=50&offset=50.
         *
         * params:
         *  offset: The starting position of the list of streams.
         * */
        console.log('Attempting to access Twitch API...');

        return new Promise(function(resolve,reject){
            request({url: url + '?limit='+this.channelLimit+'&offset=' + offset, json: true}, function (err, response, body) {

                let newChannels=[]
                let viewerCount=-1;
                for (let x = 0; x < this.channelLimit; x++) {
                    //console.log(body.streams[x]);
                    if(viewerCount===-1){
                        viewerCount=parseInt(body.streams[x].viewers);
                    }else if(parseInt(body.streams[x].viewers)<viewerCount){
                        viewerCount=parseInt(body.streams[x].viewers);
                    }

                    if(!(body.streams[x].channel.name in this.activeChannels)) {
                        newChannels.push([body.streams[x].channel.name,body.streams[x].channel.status,viewerCount,
                            body.streams[x].channel.logo]);
                    }
                    //if(this.newChannelList.indexOf(body.streams[x].channel.name)===-1){
                    //    this.newChannelList.push(body.streams[x].channel.name);
                    //}

                }

                let fetchChannels=newChannels.map(function(data){
					//pass name and number of viewers and trainer
                    let channel=new Channel.Channel(data[0],data[2],this.trainer);
                    channel.logo=data[3];
                    this.activeChannels[channel.getChannelName()]=channel;
                    return channel.connect(data[1]);
                }.bind(this));

                Promise.all(fetchChannels).then(function(result){
                    resolve(viewerCount);

                }).catch(function (err) {
                    //console.log("Test");
                    reject(err);
                    return;
                });

            }.bind(this));
        }.bind(this))
    }

    * registerChannels(offset) {
    /*This function creates a GET-Request to the address 'https://api.twitch.tv/kraken/streams/summary.'
     * Twitch will send a json object wich contains three vaules, first one is the number of active streamms
     * the second one is the total number of viewers on Twitch at the moment and the third value is a list of
     * links with one link*/

    yield setTimeout(function(){
        this.getChannels(offset).then(function(result){
            if(result>this.viewerLimit) {
                console.log('Channel crawler cooldown. Streams: '+this.activeChannels.length);
                this.registerChannels(offset+this.channelLimit).next();
            }else{
                console.log('Channel crawler ends.Streams: '+this.activeChannels.size);
                this.crawlerActive=false;
                return;

            }

        }.bind(this)).catch(function(err){
            console.error('Promise error: '+err)

        });

    }.bind(this),31000)
}
    startCrawler(){
        /*
        * This function will start the channelcrawler.
        * */
        if(this.crawlerActive===false){
            this.crawlerActive=true;
            this.registerChannels(0).next()


        }else{
            console.log('Crawler already active');
        }

    }

    getMostViewedChannels(count){
        /*
        * This function will give a sorted list of the most viewed channels.
        * The most viewed channel will have the index 0.
        * With the argument count is it possible to specify the size of the list that will be returned.
        *
        * arguments:
        *   count:  The size of the list that will be returned.
        *
        * */
        let channelList=[];
        for(let x in this.activeChannels){
            channelList.push(this.activeChannels[x]);
        }
        channelList=channelList.sort((a,b)=>{
            if(a.viewers>b.viewers){
                return 1;
            }
            if(a.viewers<b.viewers){
                return -1;
            }
            return 0;
        });
        let mostViewChannels=[];
        for (let x =0;x<count;x++){
            mostViewChannels.push(channelList.pop());
        }
        return mostViewChannels;

    }

    deleteChannel(name){
        /**
         * This function will delete the channel with the name 'name' from the activeChannel dictionary.
         */

        delete this.activeChannels[name];
    }

    closeChannel(name){
        /*
        * This function will close the chat of a channel and ends the TCP connection.
        * */
        if(typeof this.activeChannels[name]!=='undefined') {
            this.activeChannels[name].closeChat();
        }
    }
	getMostEmotionalChannels() {
		let self=this;
		
		//setInterval(function() {
			let returnValue = {};
			let channels = [];
			//List of channels as strings:
			for (let chanObj in self.activeChannels) {
				channels.push(''+chanObj);
			}

			//for every emotion
			for (let emotion of emotions) {
				//get the last fallingEmotions value among all channels
				//and find the maximum
				let max = undefined;
				let maxvalue = 0;
				for (let channame in self.activeChannels) {
					let nextvalue = self.activeChannels[channame].getCurrentEmotions()[emotion];
					if (nextvalue > maxvalue) {
						maxvalue = nextvalue;
						max = self.activeChannels[channame];
					}
				}
				returnValue[emotion]= max;
			}
			return returnValue;
			
		//}, 3000);
	}

}


exports.ChannelCrawler=ChannelCrawler;

if (require.main === module){

    let crawler=new ChannelCrawler();
    crawler.registerChannels(0).next()
	//crawler.getMostEmotionalChannels();
}
