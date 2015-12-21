'use strict';

const Vue = require('vue');
Vue.use(require('vue-resource'));
const url = require('url');
const CanvasDrawing = require('./canvasDrawing.js');
const msgPerTimeCount = CanvasDrawing.msgPerTimeCount;


let meinVue = new Vue({
    el: '#user',

    data: {
        channelName: "",
        fractal: [],
        //fallingEmotions: fallingEmotionsFrame,
        msgPerTimeChart: null,
        fallingEmotionsCharts: null
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
                        //this.fallingEmotions =
                        //for (let emotion in data[type].data){
                            //let position = this.fallingEmotions.labels.indexOf(emotion);
                            //this.fallingEmotions.datasets[0].data[position] = data[type].data[emotion];
                        //}
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
                        //this.fallingEmotions = data[type].data;
                        //for (let emotion in data[type].data){
                            //let position = this.fallingEmotions.labels.indexOf(emotion);
                            //this.fallingEmotions.datasets[0].data[position] = data[type].data[emotion];
                        //}
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



        fractalUpdate : function() {
                                                                    // slice the array to a maximum size
            CanvasDrawing.updateFractal(this.fractal,getCanvases('fractal'));
        },

        msgPerTimeUpdate : function (updateData) {
            if (this.msgPerTimeChart == null) {
                this.$set('msgPerTimeChart', CanvasDrawing.initMsgPerTime(getCanvases('msgPerTime')));
                this.$nextTick(() => {
                    CanvasDrawing.updateMsgPerTime(this.msgPerTimeChart, updateData);
                });
            }
            else
                CanvasDrawing.updateMsgPerTime(this.msgPerTimeChart, updateData);
        },

        fallingEmotionsUpdate : function (updateData) {
            if (this.fallingEmotionsCharts == null) {
                this.$set('fallingEmotionsCharts', CanvasDrawing.initFallingEmotions(getCanvases('fallingEmotions')));
                this.$nextTick(() => {
                    CanvasDrawing.updateFallingEmotions(this.fallingEmotionsCharts, updateData);
                });
            }
            else
                CanvasDrawing.updateFallingEmotions(this.fallingEmotionsCharts, updateData);
        }
    }
});

function getCanvases(type){
    let canvases = [];
    canvases.push(document.getElementById('overview_' + type));
    //canvases.push(document.getElementById('detail_' + type));
    return canvases;
}
