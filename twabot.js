"use strict";
/**
 * Created by Lukas on 17.11.2015.
 */
const ChannelCrawler=require('./twitch/channelCrawler.js');
const request=require('request');
const r=require('rethinkdb');
const credentials=require('./credentials/credentials.js');
const Webserver=require('./webserver/webserver.js');

class Twabot{

    constructor(webserverPort){
        this.webserver=new Webserver(this,webserverPort);
        this.channelCrawler=new ChannelCrawler.ChannelCrawler();
        this.crawlerIntervalID;
        this.updateChanIntervalID;

    }


    /**
     * This function starts all services of Twabot.
     *
     */
    start(){
        this.setUpRethinkDB().then((result)=> {
            console.log('Starts the services of Twabot');
            this.webserver.startServer();
            this.channelCrawler.startCrawler();
            this.crawlerIntervalID = setInterval(this.channelCrawler.startCrawler, 900000);
            this.updateChanIntervalID = setInterval(this.startChannelUpdate.bind(this), 300000);
            console.log('Services are started')
        }).catch((err)=>{
            throw err;
        })
    }

    /**
     * This function create all necessary databases in the rethinkDB.
     *
     * @returns {Promise.<T>}
     */
    setUpRethinkDB(){
    let con;
    return r.connect({host:credentials.DBHOST,port:credentials.DBPORT})
        .then((result)=>{
            con=result;
            return r.dbList().run(con);
        })
        .then((result)=>{
            if(result.indexOf('twabot')<0){
                return r.dbCreate('twabot').run(con);
            }else{
                return Promise.resolve(null);
            }
        })

}

    /**
     * This function will start the update of the channels.
     *
     */
    startChannelUpdate(){
        this.updateChannels(Object.keys(this.channelCrawler.activeChannels).length/50+1).next();
    }

    /**
     * This function will update the viewercount, onlinestatus, logo of a channel and it will delete
     * channels that aren't online anymore.
     *
     * At first, it will create a number of request to get the information of the Channels. Then the function
     * will look if a channel didn't updated. If a channel didn't get updatetd the function will delete it from
     * the activeChannel list.
     *
     * The request have a delay of 2 seconds each.
     *
     * @param updateStepsCount
     */
    * updateChannels(updateStepsCount){

        yield setTimeout(()=>{
            let url='https://api.twitch.tv/kraken/streams';
            console.log('Start updateStep: '+updateStepsCount);
            updateStepsCount=updateStepsCount-1;

            if(updateStepsCount>=0){
                request({url: url + '?limit='+50+'&offset=' + updateStepsCount*50, json: true},(err,response,body)=>{

                    if(err) {
                        throw err;
                    }
                    for(let x=0;x<50;x++){
                        console.log(body.streams[x].channel.name)
                        let chan=this.channelCrawler.activeChannels[body.streams[x].channel.name];
                        if(typeof chan!== 'undefined'){
                            chan.logo=body.streams[x].channel.logo;
                            chan.viewer=body.streams[x].viewers;
                            chan.online=true;
                            chan.gotUpdated=true;
                        }
                    }
                    this.updateChannels(updateStepsCount).next();
                    return;
                });
            }else{
                let activeChannels=this.channelCrawler.activeChannels;
                    console.log('Update ChannelLists:');
                    let deleteList=[];
                    for(let x in activeChannels){
                        if(activeChannels[x].gotUpdated===false){
                            console.log('Chat of '+x+' closed');
                            activeChannels[x].closeChat();
                            deleteList.push(activeChannels[x]);
                        }else{
                            console.log('Chat of '+x+' alive');
                            activeChannels[x].gotUpdated=false;
                        }
                    }
                    for(let x in deleteList){

                        this.channelCrawler.closeChannel(deleteList[x].name);
                        this.channelCrawler.deleteChannel(deleteList[x].name);
                    }
            }
        },2000);

    }


}

/**
 * This function will check if the arguments are correct
 *
 * @returns {*[]} returns a list with the arguments.
 */
function checkArguments(){
    let argv=process.argv.splice(2);
    let webserverPort=parseInt(argv[0],10);
    if(typeof argv[0] !=='undefined'){
        if( /^\d+$/.test(argv[0])===false) {
            throw new Error('Argument Error: \n Arg1: Port of the webserver has to be ' +
                'a number inbetween the range of 1024–49151');
        }
        if(parseInt(argv[0],10)<1024||parseInt(argv[0],10)>49151){
            throw new Error('Argument Error: \n Arg1: Port of the webserver has to be ' +
                'a number inbetween the range of 1024–49151');
        }
    }
    return [parseInt(argv[0],10)];
}

if (require.main === module) {
    let argv=checkArguments();
    let webServerPort=argv[0]

    let twabot = new Twabot(webServerPort);
    twabot.start();
}
