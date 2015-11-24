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
        this.con=undefined;
        this.currentTable=streamName;
        this.connected=false;
    }

    connect(){
        let promise=r.connect({host:credentilas.DBHOST,port:credentilas.DBPORT});

        promise.then((result)=>{
            this.con=result;

            let promise=r.dbList().run(this.con);
            promise.then( (result) =>{
                console.log("CreateChannel")
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
                        console.log("The module is using now " + this.channelName + " database");
                        this.createStreamNameMapTable().then(
                            this.createNewStreamTable(this.streamName)
                            .then((result)=> {
                                console.log("The module is using now " + this.streamName + " table in "+this.channelName+" database");
                                    this.connected=true;
                            }).catch((err)=>{
                                if(err[0]===0){
                                    console.log("Error by request of a list of tables:\n"+err[1]);
                                }else{
                                    console.log("Error by creation of a new Table:\n"+err[1]);
                                }
                            })).catch((err)=>{
                                if(err[0]===0){
                                    console.log("Error by request of a list of tables:\n"+err[1]);
                                }else if(err[0]===1){
                                    console.log("Error by creation of a the StreamNameMapTable:\n"+err[1]);
                                }else if(err[0]===2){
                                    console.log("Error by creation of index:\n "+err[1])
                                }
                        })


                    }).catch((err)=>{
                        console.log("Error by creation of a database:\n"+err);
                    });

            }).catch((err)=>{
                console.log("Error by request of a list of databases : \n"+err);
            });

        }).catch( (err) =>{
            console.log("Error by connection to database: \n"+err);
        })
    }

    createNewStreamTable(streamName){
        if(!this.connected){
            return;
        }
        streamName=streamName+"";
        let tableNames = ['Fractal', 'msgPerTime', 'raw'];

        const createNewStreamTables=tableNames.map((tableName)=>{
            console.log("Create Table")
            return new Promise((resolve,reject)=>{
                new Promise((resolve,reject)=>{

                    r.table("StreamNameMap").getAll(streamName,{index:'streamTitle'}).run(this.con,(err,result)=>{
                        if(err){
                            reject([0,err]);
                        }
                        if(result===null){
                            r.table("StreamNameMap").insert({
                                streamTitle:streamName
                            }).run(this.con,(err,result)=>{
                                if(err){
                                   console.log(err)
                                }
                                console.log(result);
                                resolve(0);
                            })
                        }else{
                            resolve(0);
                        }
                    })

                }).then((result)=>{

                r.db(this.channelName).tableList().run(this.con,(err,result)=>{

                    if(err){
                        reject([0,err]);
                    }

                    if(result.indexOf(this.streamName+"_"+tableName)===-1){
                        r.db(this.channelName).tableCreate(streamName+"_"+tableName).run(this.con,(err,result)=>{

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
                })}
                ).catch((err)=>{
                        console.log(err)
                    })
            })
        });
        return Promise.all(createNewStreamTables);
        //.then((result)=>{
          //  Console.log("The module is using now "+this.streamName+" table in "+this.channelName+" database")
          //  }).catch((err)=>{
          //      if(err[0]===0){
          //          console.log("Error by request of a list of tables:\n"+err[1]);
          //      }else{
          //          console.log("Error by creation of a new Table:\n"+err[1]);
          //      }
          //  });
    }

    createStreamNameMapTable(){
        if(!this.connected){
            return;
        }
        return new Promise((resolve,reject)=>{
            this.con.use(this.channelName);

            r.db(this.channelName).tableList().run(this.con,(err,result)=>{
                if(err){
                    reject([0,err]);
                }

                if(result.indexOf("StreamNameMap")===-1){
                    r.db(this.channelName).tableCreate("StreamNameMap").run(this.con,(err,result)=>{
                        console.log("createStreamNameMapTable");
                        if(err){
                            reject([1,err]);
                        }
                        r.table('StreamNameMap').indexCreate('streamTitle').run(this.con,(err,result)=>{
                            if(err){
                                reject([2,err]);
                            }
                            resolve(0);
                    })})
                    //new Promise((resolve,reject)=>{
                    //    r.db(this.channelName).tableCreate("StreamNameMap").run(this.con,(err,result)=>{
                    //        console.log("createStreamNameMapTable");
                    //        if(err){
                    //            reject([1,err]);
                    //        }
                    //
                    //        resolve(0);
                    //})}).then((reslut)=>{
                    //        r.table('StreamNameMap').indexCreate('streamTitle').run(this.con,(err,result)=>{
                    //        if(err){
                    //            reject([2,err]);
                    //        }
                    //        resolve(0);
//
                    //    })}).catch((err)=>{
                    //            reject(err);
                    //        })
                }else{
                    resolve(0);
                }
            })
        })
    }

    writeData(message){
        if(!this.connected){
            return;
        }
        console.log(typeof message);
        r.table(this.streamName+"_"+message.type).insert({
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
        r.table(this.streamName+"_raw").run(this.con,(err,cursor)=>{
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
