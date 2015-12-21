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
        msgPerTimeChart: null,
        fallingEmotionsChart: null
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



        fractalUpdate : function() {
                                                                    // slice the array to a maximum size
            CanvasDrawing.updateFractal(this.fractal,getCanvas('fractal'));
        },

        msgPerTimeUpdate : function (updateData) {
            if (this.msgPerTimeChart == null) {
                this.$set('msgPerTimeChart', CanvasDrawing.initMsgPerTime(getCanvas('msgPerTime')));
                this.$nextTick(() => {
                    CanvasDrawing.updateMsgPerTime(this.msgPerTimeChart, updateData);
                });
            }
            else
                CanvasDrawing.updateMsgPerTime(this.msgPerTimeChart, updateData);
        },

        fallingEmotionsUpdate : function (updateData) {
            if (this.fallingEmotionsChart == null) {
                this.$set('fallingEmotionsChart', CanvasDrawing.initFallingEmotions(getCanvas('fallingEmotions')));
                this.$nextTick(() => {
                    CanvasDrawing.updateFallingEmotions(this.fallingEmotionsChart, updateData);
                });
            }
            else
                CanvasDrawing.updateFallingEmotions(this.fallingEmotionsChart, updateData);
        }
    }
});

function getCanvas(type){
    return document.getElementById('canvas_' + type);
}
