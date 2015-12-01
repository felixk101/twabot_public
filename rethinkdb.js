"use strict";
/**
 * Created by Lukas on 22.11.2015.
 */
const r=require('rethinkdb');
const credentilas=require('./credentials.js')

class RethinkDB{
    constructor(channelName,streamName){
        this.channelName=channelName;
        this.streamName=streamName;
        this.streamID=-1;
        this.con=undefined;
        this.currentStreamTable="";
        this.connected=false;
    }

    connect(streamName){
        this.streamName=streamName;
        r.connect({host:credentilas.DBHOST,port:credentilas.DBPORT},(err,result)=>{
            this.con=result;
            r.dbList().run(this.con,(err,result)=>{
                new Promise((resolve,reject)=>{
                    if(result.indexOf(this.channelName)===-1){
                        r.dbCreate(this.channelName).run(this.con,(err,result)=>{
                            if(err){
                                reject(err);
                            }
                            resolve(0);
                        })
                    }else{
                        this.con.use(this.channelName);
                        resolve(0);
                    }
                }).then((result)=> {
                        this.createStreamNameMapTable(this.streamName,this.createNewStreamTable.bind(this))
                    }
                ).catch((err)=>{
                        console.log("Error by the creation of a database:\n"+err);
                    })

            })
        });

    }

    createNewStreamTable(streamName){

        streamName=streamName+"";
        new Promise((resolve,reject)=>{
            r.table("StreamNameMap").getAll(streamName,{index:'streamTitle'}).run(this.con,(err,result)=>{
                if(err){
                    reject([0,err]);
                }
                result.toArray((err,result)=>{

                    if(result.length===0){
                        r.table("StreamNameMap").insert({
                            streamTitle:streamName,
                            date:Date.now()
                        }).run(this.con,(err,result)=>{
                            if(err){
                                console.log(err)
                            }
                            this.streamID=result.generated_keys[0];
                            resolve(0);
                        })
                    }else{
                        this.streamID=result[0].id;
                        resolve(0);
                    }
                });

            })

        }).then((result)=>{
                this.streamID=this.streamID.replace(/-/g,'_');
                let tableNames = ['fractal', 'msgPerTime','raw'];

                const createNewStreamTables=tableNames.map((tableName)=>{
                    console.log("Create Table")
                    return new Promise((resolve,reject)=>{

                        r.db(this.channelName).tableList().run(this.con,(err,result)=>{

                            if(err){
                                reject([0,err]);
                            }

                            if(result.indexOf(this.streamID+"_"+tableName)===-1){

                                r.db(this.channelName).tableCreate(this.streamID+"_"+tableName).run(this.con,(err,result)=>{

                                    if(err){
                                        reject([1,err]);
                                    }

                                    this.streamName=streamName;
                                    resolve(0);
                                })
                            }else{
                                this.streamName=streamName;
                                resolve(0);
                            }
                        })

                }).catch((err)=>{
                console.log("Error"+err)
            })
                })
                Promise.all(createNewStreamTables).then((result)=>{
                    this.connected=true;
                }).catch();
            }).catch((err)=>{
                console.log(err)
            });

    }

    createStreamNameMapTable(streamName,callback){

            this.con.use(this.channelName);

            r.db(this.channelName).tableList().run(this.con,(err,result)=>{
                if(err){
                    console.log("Error by the request of a list of tables: "+err);
                    return;
                }

                if(result.indexOf("StreamNameMap")===-1){
                    r.db(this.channelName).tableCreate("StreamNameMap").run(this.con,(err,result)=>{
                        if(err){
                            console.log("Error by the creation of the StreamNameMapTable of the channel "
                                +this.channelName+": \n"+err);
                            return;
                        }
                        r.table('StreamNameMap').indexCreate('streamTitle').run(this.con,(err,result)=>{
                            if(err){
                                console.log('Error by creation of the index "streamTitle": \n'+err);
                                return;
                            }
                            r.table('StreamNameMap').indexWait('streamTitle').run(this.con,(err,result)=>{
                                if(err){
                                    console.log(err);
                                    return;
                                }
                                callback(streamName)
                            })

                            //callback(streamName);
                    })});

                }else{
                    callback(streamName);
                }
            })

    }

    writeData(message){
        if(!this.connected){
            return;
        }
        console.log(typeof message);
        r.table(this.streamID+"_"+message.type).insert({
            id:new Date(),
            timestamp:new Date(),
            data:message.data.rawData
        }).run(this.con,(err,result)=>{
            console.log(err);
            console.log(result);
        })
    }

    readData(){
        if(!this.connected){
            return;
        }
        r.table(this.streamID+"_raw").run(this.con,(err,cursor)=>{
            console.log(err);
            cursor.toArray((err,result)=>{
                if(err){
                    throw err;
                }
                console.log(JSON.stringify(result,null,5))
            })
        })
    }

    isConnected(){
        return this.connected;
    }

    close(){
        if(!this.connected){
            return;
        }

    }

}

exports.RethinkDB=RethinkDB;
