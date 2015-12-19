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
        fallingEmotionsChart: null
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
                    console.log('lagacyData: '+type);
                    console.log(data);
                }
            });

            socket.on('updateData', (data) => {
                for (let type in data) {
                    console.log('updateData: '+type);
                    console.log(data);
                }
            });
        },
        setDiagrammData: function(type, data){
            console.log(data);
        },
        updateDiagrammData: function(type, data){
            //this.$set(type, data[type].concat(this[type])); // Anpassung an neue struktur
        }
    },

    watch: {
        'fractal' : function(data, oldData) {
            CanvasDrawing.updateFractal(data);
        },
        'msgPerTime' : function (data, oldData) {
            if (this.msgPerTimeChart == null)
                this.$set('msgPerTimeChart', CanvasDrawing.initMsgPerTime(data));
            else
                CanvasDrawing.updateMsgPerTime(this.msgPerTimeChart, data);
        },
        'fallingEmotions' : function (data, oldData) {
            if (this.fallingEmotionsChart == null)
                this.$set('fallingEmotionsChart', CanvasDrawing.initFallingEmotions(data));
            else
                CanvasDrawing.updateFallingEmotions(this.fallingEmotionsChart, data);
        }
    }
});
