"use strict";
/**
 * Created by Lukas on 22.11.2015.
 */
const r=require('rethinkdb');
const credentilas=require('./credentials.js')

class RethinkDB{
    /*
    * The class RethinkDB is the interface of the Twabot-Project to the Database rethinkDB.
    *
    * Structure of the RethinkDB.
    *   Each channel has its own database. In every database, a StreamNameMapTable will be existing.
    *   Every stream of a channel will have its own set of tables. The table names will have a id and a analyze type.
    *   The StreamNameMapTable will hold all id and the appertaining stream name.
    *   The id and the analyze type of a stream table will be separated through the last '_'.
    *   For instance:
    *       <id>_<analyzeType> : gkejwh-3h3-3hweh-ehekhj_msgPerTime
    *
    * This class contains the methods:
    *   constructor(channelName,streamName): Creates the class RethinkDB and initialize the class variables.
    *
    *   connect(streamName): Creates a connection to rethinkDB and creates, if not existing, a new database for the
    *                        channel with the name 'channelName'.
    *
    *   createStreamNameMapTable(streamName): Creates a map of every single stream of the Channel.
    *
    *   createNewStreamTable(streamName): Creates per stream a table for every analyze type.
    *
    *   writeData(type,data): This function sends the data to the database of the channel
    *
    *   readData(): This function reads data of the database from this channel
    * */
    constructor(channelName,streamName){
        this.channelName=channelName;
        this.streamName=streamName;
        this.streamID=-1;
        this.con=undefined;
        this.currentStreamTable="";
        this.connected=false;
    }

    //connect(streamName){
    //    this.streamName=streamName;
    //    r.connect({host:credentilas.DBHOST,port:credentilas.DBPORT},(err,result)=>{
    //        this.con=result;
    //        r.dbList().run(this.con,(err,result)=>{
    //            new Promise((resolve,reject)=>{
    //                if(result.indexOf(this.channelName)===-1){
    //                    r.dbCreate(this.channelName).run(this.con,(err,result)=>{
    //                        if(err){
    //                            reject(err);
    //                        }
    //                        resolve(0);
    //                    })
    //                }else{
    //                    this.con.use(this.channelName);
    //                    resolve(0);
    //                }
    //            }).then((result)=> {
    //                    //this.createStreamNameMapTable(this.streamName,this.createNewStreamTable2.bind(this))
    //                    this.createStreamNameMapTable2(this.streamName);
    //                }
    //            ).catch((err)=>{
    //                    console.log("Error by the creation of a database:\n"+err);
    //                })
//
    //        })
    //    });
//
    //}

    connect(streamName){
        /*
        * This function connects to the addresse of the rethinkDB server. After he sucsesfully created a connection,
        * the function will save the connection and checks if there is already a database for the channel.
        * If there is not a database, a new one will be created, else it will use the already existing one.
        * Then it will call the createStreamNameMapTable function.
        * params:
        *   streamName: The name of the currentStream.
        * */
        this.streamName=streamName;

        // Connect to the rethinkDB
        r.connect({host:credentilas.DBHOST,port:credentilas.DBPORT})
        .then((result)=>{
                /*The connection is being saved for later use*/
                this.con=result;
                /*A list of all databases is requested to check if the database of the channel is existing*/
                return r.dbList().run(this.con);
            }).then((result)=>{

                /*If the database don't exist, result.indexOf(this.channelName) will be returning -1.*/
                if(result.indexOf(this.channelName)===-1){
                    /*A new database with the name of the channel is created and used.*/
                    return r.dbCreate(this.channelName).run(this.con);
                }else{

                    /*The database of this channel will be used for all rethinkDB-requests*/
                    this.con.use(this.channelName);
                    Promise.resolve(null);
                }
            }).then((result)=>{
                this.createStreamNameMapTable(this.streamName);
            }).catch((err)=>{
                console.log(err);
            })
    }

    //createNewStreamTable(streamName){
    //    console.log("Print")
    //    streamName=streamName+"";
//
    //    new Promise((resolve,reject)=>{
    //        r.table("StreamNameMap").getAll(streamName,{index:'streamTitle'}).run(this.con,(err,result)=>{
    //            if(err){
    //                reject([0,err]);
    //            }
    //            result.toArray((err,result)=>{
//
    //                if(result.length===0){
    //                    r.table("StreamNameMap").insert({
    //                        streamTitle:streamName,
    //                        date:Date.now()
    //                    }).run(this.con,(err,result)=>{
    //                        if(err){
    //                            console.log(err)
    //                        }
    //                        this.streamID=result.generated_keys[0];
    //                        resolve(0);
    //                    })
    //                }else{
    //                    this.streamID=result[0].id;
    //                    resolve(0);
    //                }
    //            });
//
    //        })
//
    //    }).then((result)=>{
    //            this.streamID=this.streamID.replace(/-/g,'_');
    //            let tableNames = ['fractal', 'msgPerTime','raw'];
//
    //            const createNewStreamTables=tableNames.map((tableName)=>{
    //                console.log("Create Table")
    //                return new Promise((resolve,reject)=>{
//
    //                    r.db(this.channelName).tableList().run(this.con,(err,result)=>{
//
    //                        if(err){
    //                            reject([0,err]);
    //                        }
//
    //                        if(result.indexOf(this.streamID+"_"+tableName)===-1){
//
    //                            r.db(this.channelName).tableCreate(this.streamID+"_"+tableName).run(this.con,(err,result)=>{
//
    //                                if(err){
    //                                    reject([1,err]);
    //                                }
//
    //                                this.streamName=streamName;
    //                                resolve(0);
    //                            })
    //                        }else{
    //                            this.streamName=streamName;
    //                            resolve(0);
    //                        }
    //                    })
//
    //            }).catch((err)=>{
    //            console.log("Error"+err)
    //        })
    //            })
    //            Promise.all(createNewStreamTables).then((result)=>{
    //                this.connected=true;
    //            }).catch();
    //        }).catch((err)=>{
    //            console.log(err)
    //        });
//
    //}

    createNewStreamTable(streamName){
        /*
        * This function will create a table for each analyze type and the raw data.
        * The name of all tables is <id>_<analyzeType>. If the table is created for the raw data, the analyzeType will
        * be raw.
        *
        * At first the function will serach the streamNameMapTable with the secondary index for the id. If the id isn't
        * found, the function will create a new entry with the streamTitle and the date of creation. The id will be
        * generated by the rethinkDB. The id will be send back and can be accesed via the result argument of the Promise.
        * The id is a string and all '-' will be replaced with '_'. Then it will be saved at the variable 'streamID'.
        *
        * After this, the function will be crate a list of Promises. Each Promise will create a table of an analyze Type.
        * If all tables are created, the 'connected' variable will be set true and it will be posible to send and
        * request data of the database.
        *
        * parms:
        *   streamName: The name of the stream.
         *
        * */
        streamName=streamName+"";
        /*
        * The id of the stream is requested, if it dosent exist a new entry will be created.
        * */
        r.table("StreamNameMap").getAll(streamName,{index:'streamTitle'}).run(this.con)
            .then((result)=> {
                return result.toArray();
            })
            .then((result)=>{

                /*result.length is 0 if the streamName does not exist.*/
                if(result.length===0){
                    /*The entry for the streamName will be created.*/
                    return r.table("StreamNameMap").insert({
                        streamTitle:streamName,
                        date:Date.now()
                    }).run(this.con);
                }else{
                    /*result[0].id contains the id for the streamName*/
                    this.streamID=result[0].id;
                    return Promise.resolve(null);
                }
            })
            .then((result)=>{
                if(result!==null){
                    /*The generated key is being saved.*/
                    this.streamID=result.generated_keys[0];
                }
                this.streamID=this.streamID.replace(/-/g,'_');
                /*The list of available analyze types.*/
                let tableNames = ['fractal', 'msgPerTime','raw'];

                /*For each element of the list, a Promis is being created.*/
                const createNewStreamTables=tableNames.map((tableName)=>{
                    console.log("Create Table")
                    return new Promise((resolve,reject)=>{

                        /*Request of a list of all tables*/
                        r.db(this.channelName).tableList().run(this.con)
                            .then((result)=>{
                                /*Check if table already exist*/
                                if(result.indexOf(this.streamID+"_"+tableName)===-1){

                                    /*Creation of the table with the name <streamID>_<analyzeType>*/
                                    return r.db(this.channelName).tableCreate(this.streamID+"_"+tableName).run(this.con)
                                }else{
                                    this.streamName=streamName;
                                    Promise.resolve(null);
                                }
                            })
                            .then((result)=>{
                                return Promise.resolve(0);
                            })
                            .catch((err)=>{
                                console.log("Error"+err)
                            })
                })
            })

                /*All Promises in the list 'createNewStreamTables' are executed.*/
                Promise.all(createNewStreamTables).then((result)=>{

                    /*Now it is possible to read and write from/to the database*/
                    this.connected=true;
                }).catch((err)=>{
                    console.log(err);
                });

            }).catch((err)=>{
                console.log(err);
            });



    }

    //createStreamNameMapTable(streamName,callback){
//
    //        this.con.use(this.channelName);
//
    //        r.db(this.channelName).tableList().run(this.con,(err,result)=>{
    //            if(err){
    //                console.log("Error by the request of a list of tables: "+err);
    //                return;
    //            }
//
    //            if(result.indexOf("StreamNameMap")===-1){
    //                r.db(this.channelName).tableCreate("StreamNameMap").run(this.con,(err,result)=>{
    //                    if(err){
    //                        console.log("Error by the creation of the StreamNameMapTable of the channel "
    //                            +this.channelName+": \n"+err);
    //                        return;
    //                    }
    //                    r.table('StreamNameMap').indexCreate('streamTitle').run(this.con,(err,result)=>{
    //                        if(err){
    //                            console.log('Error by creation of the index "streamTitle": \n'+err);
    //                            return;
    //                        }
    //                        r.table('StreamNameMap').indexWait('streamTitle').run(this.con,(err,result)=>{
    //                            if(err){
    //                                console.log(err);
    //                                return;
    //                            }
    //                            callback(streamName)
    //                        })
//
    //                        //callback(streamName);
    //                })});
//
    //            }else{
    //                callback(streamName);
    //            }
    //        })
//
    //}

    createStreamNameMapTable(streamName){
        /*
        * This function will create a table in the database of this channel which is gonna contain all names of streams
        * with the appertaining ids.
        *
        * The function checks if the table is already existing, if not it will create a new one. After the table is
        * created, the secondary index 'streamName' will be created.
        * After that the function createNewStreamTable() will be called
        *
        * params:
        *   streamName: The name of the Stream
        *
        * */

        /*The connection is now using the database with the channelname*/
        this.con.use(this.channelName);

        /*A list with all existing tables is requested*/
        r.db(this.channelName).tableList().run(this.con).then((result)=>{
            /*If the StreamNameMapTabel don't exist this if will be true*/
            if(result.indexOf("StreamNameMap")===-1){

                /* A new StreamNameMap will be created.*/
                return r.db(this.channelName).tableCreate("StreamNameMap").run(this.con)
            }else{
                return Promise.resolve(null)
            }
        })
            .then((result)=>{
            if(result!==null){

                /*The secondary index 'streamTitle' is created*/
                return r.table('StreamNameMap').indexCreate('streamTitle').run(this.con);
            }else{
                return Promise.resolve(null);
            }
        })
            .then((result)=>{
                if(result!==null) {

                    /*This promise will be resolved if the secondary index is ready to use.*/
                    return r.table('StreamNameMap').indexWait('streamTitle').run(this.con)
                }else{
                    return Promise.resolve(null);
                }
            })
        .then((result)=>{
                this.createNewStreamTable(streamName);
            }).catch((err)=>{
                console.log(err);
            })
    }

    writeData(type,data){
        /*This function will write data with a timestamp in the database of the channel.
        * args:
        *   type: This argument will tell what type of analyze data this is.
        *   data: The data to write into the database.
        */
        if(!this.connected){
            return;
        }
        r.table(this.streamID+"_"+type).insert({
            id:new Date(),
            timestamp:new Date(),
            data:data
        }).run(this.con,(err,result)=>{
            console.log(err);
            console.log(result);
        })
    }

    readData(){
        /*work in progress, dont use*/
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
        /*This function will close the connection to the rethinkDB 5 seconds after the call.*/
        if(!this.connected){
            return;
        }
        this.connected=false;
        setTimeout(()=>{
            this.con.close();
        },5000);

    }

}

exports.RethinkDB=RethinkDB;
