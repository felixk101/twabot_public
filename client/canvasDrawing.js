"use strict";

const Chart = require('chart.js');
Chart.defaults.global.animationSteps = 25;
const TransformOptions = require('./TransformOptions');
const msgPerTimeCount = 20;
exports.msgPerTimeCount = msgPerTimeCount;

exports.updateFractal = function (data) {
    let canvases = getCanvases('fractal');
    for (let canvas of canvases){
        let ctx = canvas.getContext('2d');
        let transformOptions = new TransformOptions(canvas.width, canvas.height);
        drawFractal(ctx, transformOptions, data);
    }
};

exports.initMsgPerTime = function () {
    let msgPerTimeChartData = {
        labels: [],
        datasets: [{
            label: "Messages Per Time",
            fillColor: "rgba(220,220,220,0.2)",
            strokeColor: "rgba(220,220,220,1)",
            pointColor: "rgba(220,220,220,1)",
            pointStrokeColor: "#fff",
            pointHighlightFill: "#fff",
            pointHighlightStroke: "rgba(220,220,220,1)",
            data: []
        }]
    };
    for (let i=0; i<msgPerTimeCount; i++) {
        msgPerTimeChartData.datasets[0].data.push(0);
        msgPerTimeChartData.labels.push("");
    }
    let canvases = getCanvases('msgPerTime');
    let charts = [];
    for (let canvas of canvases) {
        let ctx = canvas.getContext('2d');

        // Build the chart
        let chartOptions = {
            responsive: true
        };
        let chart = new Chart(ctx).Line(msgPerTimeChartData, chartOptions);
        charts.push(chart);
    }
    return charts;
};

exports.updateMsgPerTime = function (charts, data) {
    for (let chart of charts) {
        let chartLength = chart.datasets[0].points.length;
        for (let i=0; i<chartLength-1; i++){
            chart.datasets[0].points[i].value = chart.datasets[0].points[i+1].value;
        }
        chart.datasets[0].points[chartLength-1].value = data;
        chart.update();
    }
};

exports.initFallingEmotions = function (data) {
    let canvases = getCanvases('fallingEmotions');
    let charts = [];
    for (let canvas of canvases) {
        let ctx = canvas.getContext('2d');

        // Build the chart
        let chartOptions = {
            responsive: true,
            scaleOverride : true,
            scaleSteps : 4,
            scaleStepWidth : 250,
            scaleStartValue : 0
        };
        let chart = new Chart(ctx).Bar(data, chartOptions);

        // Set the barcolors
        for (let i=0; i<chart.datasets[0].bars.length; i++){
            chart.datasets[0].bars[i].fillColor = data.datasets[0].dataColors[i];
        }
        chart.update();
        charts.push(chart);
    }
    return charts;
};

exports.updateFallingEmotions = function (charts, data) {
    for (let chart of charts) {
        for (let i=0; i<chart.datasets[0].bars.length; i++) {
            chart.datasets[0].bars[i].value = data.datasets[0].data[i];
        }
        chart.resize();
        chart.update();
    }
};

function getCanvases(type){
    let canvases = [];
    canvases.push(document.getElementById('overview_' + type));
    canvases.push(document.getElementById('detail_' + type));
    return canvases;
}


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
