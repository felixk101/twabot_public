"use strict";

const Chart = require('chart.js');
const TransformOptions = require('./TransformOptions');

exports.updateFractal = function (data) {
    let canvases = getCanvases('fractal');
    for (let canvas of canvases){
        let ctx = canvas.getContext('2d');
        let transformOptions = new TransformOptions(canvas.width, canvas.height);
        drawFractal(ctx, transformOptions, data);
    }
};

exports.initMsgPerTime = function (data) {
    let canvases = getCanvases('msgPerTime');
    let charts = [];
    for (let canvas of canvases) {
        let ctx = canvas.getContext('2d');

        // Build the chart
        let chartOptions = {
            responsive: true
        };
        let chart = new Chart(ctx).Line(data, chartOptions);
        charts.push(chart);
    }
    return charts;
};

exports.updateMsgPerTime = function (charts, data) {
    for (let chart of charts) {
        chart.datasets[0].data = data.datasets[0].data;
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
            responsive: true
        };
        let chart = new Chart(ctx).Bar(data, chartOptions);

        // Set the barcolors
        for (let i=0; i<chart.datasets[0].bars.length; i++){
            chart.datasets[0].bars[i].fillColor = dataColors[i];
        }
        chart.update();
        charts.push(chart);
    }
    return charts;
};

exports.updateFallingEmotions = function (charts, data) {
    for (let chart of charts) {
        chart.datasets[0].data = data.datasets[0].data;
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
    ctx.fillRect(0, 0, transformOptions.width, transformOptions.height);
    ctx.restore();
}

/*
function initFallingEmotions(ctx, transformOptions, data){
    ctx.save();

    // Build the chart
    let chartOptions = {
        responsive: true
    };
    let chart = new Chart(ctx).Bar(data[data.length-1], chartOptions);
    // Set the barcolors
    let dataColors= ["blue","green","yellow","orange","red"];    // in getData unterbringen
    for (let i=0; i<chart.datasets[0].bars.length; i++){
        chart.datasets[0].bars[i].fillColor = dataColors[i];
    }
    chart.update();

    ctx.restore();
}


function drawDiagram1(channel, ctx, options){
    ctx.save();
    options.apply(ctx);
    let data = getEmotions(channel.name);

    // Building a new Canvas for the Diagramm
    let diagramCanvas = document.createElement("canvas");
    diagramCanvas.height = options.height;
    diagramCanvas.width = options.width;
    document.body.appendChild(diagramCanvas); // some DOM action for applying width and heigth
    let newCtx = diagramCanvas.getContext("2d");

    // Build the chart
    let chartOptions = {
        scaleShowGridLines: false,
        scaleShowLabels:false,
        scaleFontSize:0,
        animation: false,
        responsive: true
    };
    let chart = new Chart(newCtx).Bar(data, chartOptions);
    // Set the barcolors
    let dataColors= ["blue","green","yellow","orange","red"];    // in getData unterbringen
    for (let i=0; i<chart.datasets[0].bars.length; i++){
        chart.datasets[0].bars[i].fillColor = dataColors[i];
    }
    chart.update();

    // Draw the diagram and hide the diagram canvas
    ctx.drawImage(diagramCanvas, 0, 0, options.width, options.height);
    diagramCanvas.style.display = "none";
    ctx.restore();
}*/