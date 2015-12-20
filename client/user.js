'use strict';

const Vue = require('vue');
Vue.use(require('vue-resource'));
const url = require('url');
const CanvasDrawing = require('./canvasDrawing.js');
const chartDataFrame = require('./chartDataFrame.json');
const emotionColorMap = require('./emotionColorMap.json');
const msgPerTimeCount = CanvasDrawing.msgPerTimeCount;

                                                            // in canvasDrawing bekommen
let fallingEmotionsFrame = Object.create(chartDataFrame);
for (let emotion in emotionColorMap){
    fallingEmotionsFrame.labels.push(emotion);
    fallingEmotionsFrame.datasets[0].dataColors.push(emotionColorMap[emotion]);
}

let meinVue = new Vue({
    el: '#user',

    data: {
        fractal: [],
        fallingEmotions: fallingEmotionsFrame,
        msgPerTimeChart: null,
        fallingEmotionsCharts: null
    },

    ready: function() {
        let name = this.calculateChannelName();
        this.fetchDiagrammData();
    },

    methods: {
        calculateChannelName: function(){
            let path = url.parse(document.URL);
            let pathname = path.pathname.split('/');
            let index = pathname.indexOf('user');
            return pathname[index+1];
        },

        fetchDiagrammData: function () {
            let socket = io();
            socket.on('connect', function(){
                let path = url.parse(document.URL);
                let pathname = path.pathname.split('/');
                let index = pathname.indexOf('user');
                socket.emit('registerChannel', pathname[index+1])
            });

            socket.on('legacyData', (data) => {
                for (let type in data) {
                    if (type == 'fallingEmotions'){
                        for (let emotion in data[type].data){
                            let position = this.fallingEmotions.labels.indexOf(emotion);
                            this.fallingEmotions.datasets[0].data[position] = data[type].data[emotion];
                        }
                        this.fallingEmotionsUpdate();
                    }
                    if (type == 'msgPerTime'){
                        let msgPerTimeList = data[type];
                        for (let msgData of msgPerTimeList) {
                            this.msgPerTimeUpdate(msgData.data);
                        }
                    }
                    if (type == 'fractal'){
                        //this.fractal.push(data[type].data);
                        //this.fractalUpdate();
                    }
                }
            });

            socket.on('updateData', (data) => {
                for (let type in data) {
                    if (type == 'fallingEmotions'){
                        for (let emotion in data[type].data){
                            let position = this.fallingEmotions.labels.indexOf(emotion);
                            this.fallingEmotions.datasets[0].data[position] = data[type].data[emotion];
                        }
                        this.fallingEmotionsUpdate();
                    }
                    if (type == 'msgPerTime'){
                        this.msgPerTimeUpdate(data[type].data);
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
            CanvasDrawing.updateFractal(this.fractal);
        },

        msgPerTimeUpdate : function (data) {
            if (this.msgPerTimeChart == null)
                this.$set('msgPerTimeChart', CanvasDrawing.initMsgPerTime());
            else
                CanvasDrawing.updateMsgPerTime(this.msgPerTimeChart, data);
        },

        fallingEmotionsUpdate : function () {
            if (this.fallingEmotionsCharts == null)
                this.$set('fallingEmotionsCharts', CanvasDrawing.initFallingEmotions(this.fallingEmotions));
            else
                CanvasDrawing.updateFallingEmotions(this.fallingEmotionsCharts, this.fallingEmotions);
        }
    }
});
