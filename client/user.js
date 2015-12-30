"use strict";
/**
 * Created by Andreas Wundlechner
 *
 * This script will run, when the user selects a channel from the overview.
 *
 * The code corresponding to the fractal analysis isn't finished,
 * so for performance optimisation it is commented out.
 * The missing fractal is caused by too less time.
 */

const Vue = require('vue');
Vue.use(require('vue-resource'));
const url = require('url');
const CanvasDrawing = require('./canvasDrawing.js');
const msgPerTimeCount = CanvasDrawing.msgPerTimeCount;

// Represents the chart.js object for the messages per time analysis.
let msgPerTimeChart = null;
// Represents the chart.js object for the falling emotions analysis.
let fallingEmotionsChart = null;

let meinVue = new Vue({
    el: '#user',

    data: {
        channelName: ""
        //fractal: []
    },

    ready: function() {
        let channelName = this.getChannelName();
        this.$set('channelName', channelName);
        this.fetchDiagramData(channelName);
    },

    methods: {
        /**
         * Cut the channel name out of the url.
         * @returns channel name as a string
         */
        getChannelName: function(){
            let path = url.parse(document.URL);
            let pathname = path.pathname.split('/');
            let index = pathname.indexOf('user');
            return pathname[index+1];
        },

        /**
         * Fetch all the needed data from the server to display the analysis.
         * @param channelName The name of the requested channel.
         */
        fetchDiagramData: function (channelName) {
            // Connect to the server (socket.io).
            let socket = io();

            // Send the registerChannel event when the connection to the server is ready.
            socket.on('connect', function(){
                socket.emit('registerChannel', channelName)
            });

            // Fetch all the old legacy data to display the current state and a bit history.
            // data.fallingEmotions.data holds the current falling emotions analysis state.
            // data.msgPerTime is a list of old messages per time analysis dates.
            socket.on('legacyData', (data) => {
                for (let type in data) {
                    if (type == 'fallingEmotions'){
                        this.fallingEmotionsUpdate(data[type].data);
                    } else if (type == 'msgPerTime'){
                        let updateData = [];
                        for (let msgData of data[type]) {
                            updateData.push(msgData.data);
                        }
                        this.msgPerTimeUpdate(updateData);
                    } else if (type == 'fractal'){
                        //this.fractal.push(data[type].data);
                        //this.fractalUpdate();
                    }
                }
            });

            // Fetch the updated data when it arrives
            // data.fallingEmotions.data holds the updated falling emotions analysis state.
            // data.msgPerTime.data holds the updated messages per time analysis data.
            socket.on('updateData', (data) => {
                for (let type in data) {
                    if (type == 'fallingEmotions'){
                        this.fallingEmotionsUpdate(data[type].data);
                    }
                    if (type == 'msgPerTime'){
                        this.msgPerTimeUpdate([data[type].data]);
                    }
                    if (type == 'fractal'){
                        //this.fractal.push(data[type].data);
                        //this.fractalUpdate();
                    }
                }
            });
        },


        //fractalUpdate : function() {
        //    CanvasDrawing.updateFractal(this.fractal,getCanvas('fractal'));
        //},

        /**
         * This function updates the messages per time chart and creates it, if it doesn't exit yet.
         * @param updateData List of messages per time measurements.
         */
        msgPerTimeUpdate : function (updateData) {
            if (msgPerTimeChart == null)
                msgPerTimeChart = CanvasDrawing.initMsgPerTime(getCanvas('msgPerTime'));
            CanvasDrawing.updateMsgPerTime(msgPerTimeChart, updateData);
        },

        /**
         * This function updates the falling emotions chart and creates it, if it doesn't exit yet.
         * @param updateData The new falling emotions analysis state.
         */
        fallingEmotionsUpdate : function (updateData) {
            if (fallingEmotionsChart == null)
                fallingEmotionsChart = CanvasDrawing.initFallingEmotions(getCanvas('fallingEmotions'));
            CanvasDrawing.updateFallingEmotions(fallingEmotionsChart, updateData);
        }
    }
});

/**
 * Fetch the canvas from the document.
 * @param type Type of the analysis as string.
 * @returns canvas HTML canvas object.
 */
function getCanvas(type){
    return document.getElementById('canvas_' + type);
}
