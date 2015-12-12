"use strict";
/**
 * Created by Lukas on 17.11.2015.
 */
const ChannelCrawler=require('./channelCrawler.js');
const request=require('request');
const credentials=require('./credentials.js');

class Twabot{

    constructor(){
        this.webserver=undefined;
        this.channelCrawler=new ChannelCrawler.ChannelCrawler();
        this.crawlerIntervalID;
        this.updateChanIntervalID;
    }

    start(){
        this.channelCrawler.startCrawler();

        //this.crawlerIntervalID=setInterval(this.channelCrawler,900000);
        this.updateChanIntervalID=setInterval(this.updateChannels,40000);
    }

    updateChannels(){
        //let channelNames=[];
        //let chanNameItterator;
        //let channelPerTick=50;
        //let updateIntervallID;
        var url='https://api.twitch.tv/kraken/streams';
        let updatePromises=[];
        let updateInvervallID;
        
        for(let x=0;x<Object.keys(this.channelCrawler.activeChannels)/10+1;x++){
            updatePromises.push(new Promise((resolve,reject)=>{
                request({url: url + '?limit='+50+'&offset=' + x*50, json: true},(err,response,body)=>{
                    if(err){
                        reject(err);
                        return;
                    }
                    for(let x=0;x<50;x++){
                        let chan=this.channelCrawler.activeChannels[body.streams[x].channel.name];
                        if(typeof chan!== "undefined"){
                            chan.logo=body.streams[x].channel.logo;
                            chan.viewer=body.streams[x].viewers;
                            chan.online=true;
                            chan.gotUpdated=true;
                        }
                    }
                    resolve(0);
                })
            }));
        }
        updateInvervallID=setInterval(()=>{
            let list=updatePromises.pop();
            if(typeof list==='undefined'){
                clearInterval(updateInvervallID);
                for(let x in this.channelCrawler.activeChannels){
                    if(x.gotUpdated===false){
                        x.closeChat();
                        deleteList.push(x.name);
                    }else{
                        x.gotUpdated=false;
                    }
                }
                for(let x in deleteList){
                    this.channelCrawler.closeChannel(deleteList[x]);
                    this.channelCrawler.deleteChannel(deleteList[x]);
                }
                return;
            }
            list().then((result)=>{
                console.log("Update ChannelLists:");
            }).catch((err)=>{
                console.log(err);
            });
        },2000);

    }

}

let twabot=new Twabot();
twabot.start();
