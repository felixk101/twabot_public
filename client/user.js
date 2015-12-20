'use strict';

const Vue = require('vue');
Vue.use(require('vue-resource'));
const url = require('url');
const CanvasDrawing = require('./canvasDrawing.js');
const chartDataFrame = require('./chartDataFrame.json');
const emotionColorMap = require('./emotionColorMap.json');

let msgPerTimeFrame = Object.create(chartDataFrame);

let fallingEmotionsFrame = Object.create(chartDataFrame);
for (let emotion in emotionColorMap){
    fallingEmotionsFrame.labels.push(emotion);
    fallingEmotionsFrame.datasets[0].dataColors.push(emotionColorMap[emotion]);
}

let meinVue = new Vue({
    el: '#user',

    data: {
        fractal: [],
        msgPerTime: msgPerTimeFrame,
        fallingEmotions: fallingEmotionsFrame,
        msgPerTimeChart: null,
        fallingEmotionsCharts: null
    },

    ready: function() {
        this.fetchDiagrammData();
    },

    methods: {
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
                    console.log('legacyData: '+type);
                    console.log(data);
                }
            });

            socket.on('updateData', (data) => {
                for (let type in data) {
                    console.log(data);
                    if (type == 'fallingEmotions'){
                        for (let emotion in data[type].data){
                            let position = this.fallingEmotions.labels.indexOf(emotion);
                            this.fallingEmotions.datasets[0].data[position] = data[type].data[emotion];
                        }
                        this.fallingEmotionsUpdate();
                    }
                }
            });
        },



        fractalUpdate : function(data, oldData) {
            CanvasDrawing.updateFractal(data);
        },

        msgPerTimeUpdate : function (data, oldData) {
            if (this.msgPerTimeChart == null)
                this.$set('msgPerTimeChart', CanvasDrawing.initMsgPerTime(data));
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
