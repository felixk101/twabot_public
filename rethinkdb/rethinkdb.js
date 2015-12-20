"use strict";
/**
 * Created by lukas on 17.12.15.
 */
const r=require('rethinkdb');
const credentials=require('./../credentials/credentials.js')

class RethinkDB{
    constructor(channelName,streamName){
        this.channelName=channelName;
        this.streamName=streamName;
        this.streamID=-1;
        this.con=undefined;
        this.currentStreamTable="";
        this.connected=false;
        this.isConnecting=false;
    }

    connect(streamName){
        /*
        * This function will create a connection to the rethinkdb server and saves it in the
        * variable 'this.con'. After a successful connection, the function will check if a table for this channel
        * already exist. If it dosen't exist, the function will create a table and the associated secondaryIndex.
        * Then it will call the createNewStream Method.
        *
        * parms:
        *   streamName: The name of the stream.
        * */
        this.streamName=streamName;
        this.isConnecting=true;
        console.log("Connection to rethinkdb started Version 2")
        /* Connect to the rethinkDB */
        r.connect({host:credentials.DBHOST,port:credentials.DBPORT})
            .then((result)=>{
                /* Saves the connection and set the database that will be used*/

                this.con=result;
                this.con.use('twabot');
                return r.db('twabot').tableList().run(this.con);
            })
            .then((result)=> {

                /* Check if a table with the name 'this.channelName' exist and creates it if the table dosen't exist. */
                if (result.indexOf(this.channelName) === -1) {
                    return r.db('twabot').tableCreate(this.channelName).run(this.con)

                } else {
                    return Promise.resolve(null);
                }

            }).then((result)=>{
                /* Request a list of secondIndexs of the table 'this.channelName'. */
                return r.table(this.channelName).indexList().run(this.con);

            }).then((result)=> {
                /* Check if the index exist and create if it dosen't exist. */
                if (result.indexOf('streamTitle') === -1) {
                    return r.table(this.channelName).indexCreate('streamTitle').run(this.con)
                } else {
                    return Promise.resolve(null)
                }
            }).then((result)=>{
                /* If the index is new created, it will wait until the index is ready to use. */
                if(result!==null){
                    return r.table(this.channelName).indexWait('streamTitle').run(this.con);

                }else{
                    return Promise.resolve(null);
                }
            }).then((result)=>{
                this.createNewStream(this.streamName);
        }).catch((err)=>{
            console.error('rethinkdb.connect: '+err);
        })
    }

    createNewStream(streamName){
        /*
        * This function will check if a table for the stream with the name 'streamName' already exist. If it dosen't
        * it will create a new list and save the id in the variable 'this.streamID'. If the table exist, it will take
        * the ID and save it as well in the variable 'this.streamID'.
        *
        * Then it check if the table has all specified secondaryIndexs and the function
        * will add all missing secondaryIndexs. If this is done the table will be ready to use.
        * */
        if(!this.connected && !this.isConnecting){
           return 'RethinkDB is not connected';
        }
        streamName+="";
        // Request a list from the table 'this.channelname' with entrys that contain the streamTitle 'streamName'
        r.table(this.channelName).getAll(streamName,{index:'streamTitle'}).run(this.con)
            .then((result)=>{
                result.close();
                return result.toArray();
            })
            .then((result)=>{

                // Check if a entry with the streamTitle 'streamName' exist and create a new one if it dosen't exist.
                if(result.length===0){

                    return r.table(this.channelName).insert({
                        streamTitle:streamName,
                        date:Date.now()
                    }).run(this.con)
                }else{

                    this.streamID=result[0].id;

                    return Promise.resolve(null);
                }
            })
            .then((result)=>{
                /* The id of the stream will be saved in the variable 'this.streamID' and checks if a table with
                * the id as name exist
                * */
                if(result!==null){

                    this.streamID=result.generated_keys[0];

                }
                this.streamID=this.streamID.replace(/-/g,'_');

                return r.db('twabot').tableList().filter((table)=>{return table.eq(this.channelName+'_'+this.streamID)}).run(this.con);
            })
            .then((result)=>{
                /* If the table dosen't exist a new one will be created. */
                if(result.length===0){
                    return r.db('twabot').tableCreate(this.channelName+'_'+this.streamID).run(this.con);
                }
                return Promise.resolve(null);
            })
            .then((result)=>{
                /* request a list of secondaryIndex from the table 'this.channelName+'_'+this.streamID'. */
                return r.table(this.channelName+'_'+this.streamID).indexList()
                    .filter((index)=>{return index.eq('type')}).run(this.con);
            })
            .then((result)=>{
                /* If a secondaryIndex dosen't exist in the table, it will be created.
                 * The variable 'analyseType' contains all possible secondaryIndexs. */
                if(result.length===0) {
                    return r.table(this.channelName+'_'+this.streamID).indexCreate('type').run(this.con)

                }else {
                    return Promise.resolve(null);
                }
            })
            .then((result)=>{
                if(result!==null){
                    return r.table(this.channelName+'_'+this.streamID).indexWait('type').run(this.con)
                }else{
                    return Promise.resolve(null)
                }
            })
            .then((result)=>{
                /* The table is ready to use. */
                this.isConnecting=false;
                this.connected=true;
                console.log("StreamTable created");
            }).catch((err)=>{
                console.error('rethinkdb.createNewStream: '+err);
        })
    }

    writeData(type,data){
        /*
        * If the a connection to the rethinkdb exist, the function will write data in the table with
        * the name 'this.streamID'.
        *
        * Every entry has a id, timestamp, data and type key. The type specify the analyse type and data will
        * hold the data.
        * */
        if(!this.connected ){
            return;
        }

        r.table(this.channelName+'_'+this.streamID).insert({
            id:new Date(),
            timestamp:new Date(),
            data:data,
            type:type
        }).run(this.con).then().catch((err)=>{
            console.error('rethinkdb.writeData: '+err);
        })
    }

    isConnected(){
        return this.connected;
    }

    getStreamID(){
        return this.streamID;
    }

    getChangeFeed(analyzeType){
        /*
        * This function will return a promise with a stream that will fire a data event if the table
        * that he has subscribe to get changed.
        *
        * !!!!!! Important !!!!!!!
        * The stream has to been closed by hand or a memory leak will arise at the rethinkdb
        *
        * param:
        *   analyzeType: This specify the data you will receive.
        * */
        if(!this.connected){
            Promise.reject('RethinkDB is not connected');
        }
        analyzeType+="";
        return r.table(this.channelName+'_'+this.streamID).filter(r.row('type').eq(analyzeType)).changes().run(this.con);
    }

    getTableWithType(type){
        /*
        * This function will return a promise with all values with the analyse type 'type'.
        * */
        if(!this.connected){
            Promise.reject('RethinkDB is not connected');
        }
        return r.table(this.channelName+'_'+this.streamID).getAll(type,{index:'type'}).run(this.con)
            .then((result)=>{
                result.close();
                return result.toArray();
            })

    }

    getWholeStream(){
        /*
        * This function will return a promise with the whole stream table.
        * */
        if(!this.connected){
            Promise.reject('RethinkDB is not connected');
        }
        return r.table(this.channelName+'_'+this.streamID).run(this.con)
            .then((result)=>{
                result.close();
                return result.toArray();
            })
    }

    getElementsSince(type,time){
        /*
         * This function will return a promise with a list of elements that have a timestamp that
         * got created during now and now-time.
         * */
        if(!this.connected){
            Promise.reject('RethinkDB is not connected');
        }
        type+="";
        let now=new Date();
        let past=new Date(now-time);
        console.log(new Date(now),new Date(past))
        return r.table(this.channelName+'_'+this.streamID).filter(r.row('type').eq(type).and(r.row('timestamp')
            .during(new Date(past),new Date(now)))).run(this.con)
            .then((result)=>{
                result.close();
                return result.toArray();
            })

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