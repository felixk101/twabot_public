"use strict";
/**
 * Created by Lukas on 17.11.2015.
 */
const ChannelCrawler=require('./channelCrawler.js');
const request=requie('request');
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
        //this.updateChanIntervalID=setInterval(this.updateChannels,300000);
    }

    updateChannels(){
        //let channelNames=[];
        //let chanNameItterator;
        //let channelPerTick=50;
        //let updateIntervallID;
        var url='https://api.twitch.tv/kraken/streams';
        let updatePromises=[];

        for(let x=0;x<Object.keys(this.channelCrawler.activeChannels)/50+1;x++){
            updatePromises.push(new Promise((resolve,reject)=>{
                request({url: url + '?limit='+50+'&offset=' + x*50, json: true},(err,response,body)=>{
                    if(err){
                        reject(err);
                    }
                    for(let x=0;x<50;x++){
                        let chan=this.channelCrawler.activeChannels[body.streams[x].channel.name];
                        if(chat!==undefined){
                            chan.logo=body.streams[x].channel.logo;
                            chan.viewer=body.streams[x].viewers;
                            chan.gotUpdated=true;
                        }
                    }
                    resolve(0);
                })
            }));
        }
        Promise.all(updatePromises).then((result)=>{
            let deleteList=[];
            for(let x in this.channelCrawler.activeChannels){
                if(x.gotUpdated===false){
                    x.closeChat();
                    delteList.push(x.name);
                }else{
                    x.gotUpdated=false;
                }
            }
            for(let x in deleteList){
                this.channelCrawler.deleteChannel(deleteList[x]);
            }
        }).catch((err)=>{
            console.log(err);
        })
        //for(let x in this.channelCrawler.getActiveChannelsDC()){
        //    channelNames.push(x.getChannelName());
        //}
//
        //chanNameItterator=channelNames[Symbol.iterator]();
        //updateIntervallID=setInterval(()=>{
        //    for(let x=0;x<channelPerTick;x++){
        //        let channel=it.next().value;
        //        if(channel===undefined){
        //            clearInterval(updateIntervallID);
        //            break;
        //        }
        //        this.channelCrawler.activeChannels[channel].isOnline();
        //    }
        //},2000);
    }

}

let twabot=new Twabot();
twabot.start();