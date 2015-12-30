'use strict';

const Vue = require('vue');
Vue.use(require('vue-resource'));
const url = require('url');
const CanvasDrawing = require('./canvasDrawing.js');
const msgPerTimeCount = CanvasDrawing.msgPerTimeCount;

let msgPerTimeChart = null;
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
        this.fetchDiagrammData(channelName);
    },

    methods: {
        getChannelName: function(){
            let path = url.parse(document.URL);
            let pathname = path.pathname.split('/');
            let index = pathname.indexOf('user');
            return pathname[index+1];
        },

        fetchDiagrammData: function (channelName) {
            let socket = io();
            socket.on('connect', function(){
                socket.emit('registerChannel', channelName)
            });

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

        msgPerTimeUpdate : function (updateData) {
            if (msgPerTimeChart == null)
                msgPerTimeChart = CanvasDrawing.initMsgPerTime(getCanvas('msgPerTime'));
            CanvasDrawing.updateMsgPerTime(msgPerTimeChart, updateData);
        },

        fallingEmotionsUpdate : function (updateData) {
            if (fallingEmotionsChart == null)
                fallingEmotionsChart = CanvasDrawing.initFallingEmotions(getCanvas('fallingEmotions'));
            CanvasDrawing.updateFallingEmotions(fallingEmotionsChart, updateData);
        }
    }
});

function getCanvas(type){
    return document.getElementById('canvas_' + type);
}
