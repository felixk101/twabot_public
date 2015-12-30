"use strict";
/**
 * Created by Andreas Wundlechner
 */

const Chart = require('chart.js');
const emotionColorMap = require('./emotionColorMap.json');
const TransformOptions = require('./TransformOptions');

//Chart.defaults.global.animationSteps = 30;
//Chart.defaults.global.animation = false;
const msgPerTimeCount = 20;
exports.msgPerTimeCount = msgPerTimeCount;

exports.updateFractal = function (data) {
    let ctx = canvas.getContext('2d');
    let transformOptions = new TransformOptions(canvas.width, canvas.height);
    drawFractal(ctx, transformOptions, data);
};

const msgPerTimeChartOptions = {
    responsive: true,
    animation: false
};

exports.initMsgPerTime = function (canvas, chartOptions=msgPerTimeChartOptions) {
    let msgPerTimeChartData = {
        labels: [],
        datasets: [{
            label: "Messages Per Time",
            fillColor: "rgba(100,100,100,0.3)",
            strokeColor: "rgba(180,180,180,1)",
            pointColor: "rgba(180,180,180,1)",
            pointStrokeColor: "#fff",
            pointHighlightFill: "#fff",
            pointHighlightStroke: "rgba(190,190,190,1)",
            data: []
        }]
    };
    for (let i=0; i<msgPerTimeCount; i++) {
        msgPerTimeChartData.labels.push("");
        msgPerTimeChartData.datasets[0].data.push(0);
    }

    let ctx = canvas.getContext('2d');

    // Build the chart
    let chart = new Chart(ctx).Line(msgPerTimeChartData, chartOptions);

    return chart;
};

exports.updateMsgPerTime = function (chart, dataset) {
    for (let data of dataset) {
        let chartLength = chart.datasets[0].points.length;
        for (let i = 0; i < chartLength - 1; i++) {
            chart.datasets[0].points[i].value = chart.datasets[0].points[i + 1].value;
        }
        chart.datasets[0].points[chartLength - 1].value = data;
    }
    chart.update();
};

const fallingEmtionsChartOptions = {
    responsive: true,
    animation: false,
    scaleOverride : true,
    scaleSteps : 4,
    scaleStepWidth : 250,
    scaleStartValue : 0
};
/**
 *
 * @param canvas
 * @param chartOptions
 * @returns {*}
 */
exports.initFallingEmotions = function (canvas, chartOptions=fallingEmtionsChartOptions) {
    let fallingEmotionsChartData = {
        labels: [],
        datasets: [{
            fillColor: "rgba(220,220,220,1)",
            strokeColor: "rgba(220,220,220,1)",
            highlightFill: "rgba(220,220,220,1)",
            highlightStroke: "rgba(220,220,220,1)",
            data: [],
            dataColors: []
        }]
    };
    for (let emotion in emotionColorMap){
        fallingEmotionsChartData.labels.push(emotion);
        fallingEmotionsChartData.datasets[0].data.push(0);
    }

    let ctx = canvas.getContext('2d');

    // Build the chart
    let chart = new Chart(ctx).Bar(fallingEmotionsChartData, chartOptions);

    // Set the barcolors
    for (let i=0; i<chart.datasets[0].bars.length; i++){
        chart.datasets[0].bars[i].fillColor = emotionColorMap[chart.datasets[0].bars[i].label];
    }

    chart.update();
    return chart;
};

exports.updateFallingEmotions = function (chart, data) {
    for (let i=0; i<chart.datasets[0].bars.length; i++) {
        chart.datasets[0].bars[i].value = data[chart.datasets[0].bars[i].label];
    }
    chart.update();
};


function drawFractal(ctx, transformOptions, data){
    ctx.save();
    transformOptions.apply(ctx);
    ctx.clearRect(0,0,transformOptions.width,transformOptions.height);

    // for emotions:
    drawPath(ctx, transformOptions);
    ctx.restore();
}

function drawPath(ctx, transformOptions){
    ctx.moveTo(0,transformOptions.height/2);
    ctx.beginPath();
    ctx.lineTo(transformOptions.width, transformOptions.height/2);
    ctx.closePath();
}
