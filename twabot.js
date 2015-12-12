"use strict";
/**
 * Created by Lukas on 17.11.2015.
 */
const ChannelCrawler=require('./channelCrawler.js');
const request=require('request');
const credentials=require('./credentials.js');
const Webserver=require('./interface/webserver.js');

class Twabot{

    constructor(){
        this.webserver=new Webserver(this);
        this.channelCrawler=new ChannelCrawler.ChannelCrawler();
        this.crawlerIntervalID;
        this.updateChanIntervalID;
    }

    start(){
        /*
        * This function starts all services of Twabot.
        *
        * */
        console.log("Starts the services of Twabot");
        this.webserver.startServer();
        this.channelCrawler.startCrawler();
        this.crawlerIntervalID=setInterval(this.channelCrawler.startCrawler,900000);
        this.updateChanIntervalID=setInterval(this.startChannelUpdate.bind(this),300000);
        console.log("Services are started")
    }

    startChannelUpdate(){
        /*
        * This function will start the update of the channels.
        * */
        this.updateChannels(this.createUpdateList()).next();
    }

    createUpdateList(){
        /*
        * This function creates a list with number for the updateChannel methode.
        * */
        let updateIntervallSteps=[];
        for (let x = 0;x < Object.keys(this.channelCrawler.activeChannels).length/50+1;x++){
            updateIntervallSteps.push(x);
        }

        return updateIntervallSteps;

    }
    * updateChannels(updateSteps){
        /*
        * This function will update the viewercount, onlinestatus, logo of a channel and it will delete
        * channels that aren't online anymore.
        *
        * At first, it will create a number of request to get the information of the Channels. Then the function
        * will look if a channel didn't updated. If a channel didn't get updatetd the function will delete it from
        * the activeChannel list.
        *
        * The request have a delay of 2 seconds each.
        *
        * */

        yield setTimeout(()=>{
            let url='https://api.twitch.tv/kraken/streams';
            console.log("Start updateStep: "+updateSteps);
            let step=updateSteps.pop();

            if(typeof step !=='undefined'){
            request({url: url + '?limit='+50+'&offset=' + step*50, json: true},(err,response,body)=>{

                if(err) {
                    throw err;
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
                this.updateChannels(updateSteps).next();
                return;
            })
            }else{
                let activeChannels=this.channelCrawler.activeChannels;
                    console.log("Update ChannelLists:");
                    let deleteList=[]


                    for(let x in activeChannels){
                        if(activeChannels[x].gotUpdated===false){
                            console.log("Chat of "+x+" closed");
                            activeChannels[x].closeChat();
                            deleteList.push(activeChannels[x]);
                        }else{
                            console.log("Chat of "+x+" alive");
                            activeChannels[x].gotUpdated=false;
                        }
                    }
                    for(let x in deleteList){
                        this.channelCrawler.closeChannel(deleteList[x]);
                        this.channelCrawler.deleteChannel(deleteList[x]);
                    }
            }
        },2000);

    }
}

let twabot=new Twabot();
twabot.start();