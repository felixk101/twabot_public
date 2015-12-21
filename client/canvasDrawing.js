"use strict";

const Chart = require('chart.js');
const emotionColorMap = require('./emotionColorMap.json');
const TransformOptions = require('./TransformOptions');

//Chart.defaults.global.animationSteps = 30;
//Chart.defaults.global.animation = false;
const msgPerTimeCount = 20;
exports.msgPerTimeCount = msgPerTimeCount;

exports.updateFractal = function (data, canvases) {
    for (let canvas of canvases){
        let ctx = canvas.getContext('2d');
        let transformOptions = new TransformOptions(canvas.width, canvas.height);
        drawFractal(ctx, transformOptions, data);
    }
};

exports.initMsgPerTime = function (canvases, chartOptions={responsive: true}) {
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
        msgPerTimeChartData.labels.push("");
        msgPerTimeChartData.datasets[0].data.push(0);
    }
    let charts = [];
    for (let canvas of canvases) {
        let ctx = canvas.getContext('2d');

        // Build the chart
        let chart = new Chart(ctx).Line(msgPerTimeChartData, chartOptions);
        charts.push(chart);
    }
    return charts;
};

exports.updateMsgPerTime = function (charts, dataset) {
    for (let chart of charts) {
        for (let data of dataset) {
            let chartLength = chart.datasets[0].points.length;
            for (let i = 0; i < chartLength - 1; i++) {
                chart.datasets[0].points[i].value = chart.datasets[0].points[i + 1].value;
            }
            chart.datasets[0].points[chartLength - 1].value = data;
        }
        chart.update();
    }
};

const chartOptionsGlobal = {
    responsive: true,
    scaleOverride : true,
    scaleSteps : 4,
    scaleStepWidth : 250,
    scaleStartValue : 0
};

exports.initFallingEmotions = function (canvases, chartOptions=chartOptionsGlobal) {
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

    let charts = [];
    for (let canvas of canvases) {
        let ctx = canvas.getContext('2d');

        // Build the chart
        let chart = new Chart(ctx).Bar(fallingEmotionsChartData, chartOptions);

        console.log(chart);
        // Set the barcolors
        for (let i=0; i<chart.datasets[0].bars.length; i++){
            chart.datasets[0].bars[i].fillColor = emotionColorMap[chart.datasets[0].bars[i].label];
        }

        chart.update();
        charts.push(chart);
    }
    return charts;
};

exports.updateFallingEmotions = function (charts, data) {
    for (let chart of charts) {
        for (let i=0; i<chart.datasets[0].bars.length; i++) {
            chart.datasets[0].bars[i].value = data[chart.datasets[0].bars[i].label];
        }
        chart.update();
    }
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
