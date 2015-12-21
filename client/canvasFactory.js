"use strict";

const Chart = require('chart.js');
const TransformOptions = require('./TransformOptions');
const CanvasDrawing = require('./canvasDrawing');

exports.createThumbnail = function createThumbnail(canvas, channel){
    let ctx = canvas.getContext("2d");

    let positions = [
        new TransformOptions(canvas.width, canvas.height, 2/3, 1),
        new TransformOptions(canvas.width, canvas.height, 1/3, 1/3, 2/3, 0),
        new TransformOptions(canvas.width, canvas.height, 1/3, 1/3, 2/3, 1/3),
        new TransformOptions(canvas.width, canvas.height, 1/3, 1/3, 2/3, 2/3)
    ];

    let drawFunctions = [
        drawChannelLogo,
        drawFallingEmotions,
        drawMsgPerTime,
        drawFractal
    ];

    for (let i=0; i<positions.length; i++){
        drawFunctions[i](channel, ctx, positions[i]);
    }

};


function drawChannelLogo(channel, ctx, options){
    let img = new Image();
    img.addEventListener("load", function(){
        ctx.save();
        options.apply(ctx);
        ctx.drawImage(img, 0, 0, options.width, options.height);
        ctx.restore();
    },false);
    img.src = channel.logo;
}

function drawFractal(channel, ctx, options){
    // Dummy
    ctx.save();
    options.apply(ctx);
    ctx.fillStyle = "blue";
    ctx.fillRect(0,0,options.width, options.height);
    ctx.restore();
}

function drawFallingEmotions(channel, ctx, options){
    ctx.save();
    options.apply(ctx);
    
    // Building a new Canvas for the Diagramm
    let diagramCanvas = document.createElement("canvas");
    diagramCanvas.height = options.height;
    diagramCanvas.width = options.width;
    document.body.appendChild(diagramCanvas); // some DOM action for applying width and heigth

    // Build the chart
    let chartOptions = {
        scaleOverride : true,
        scaleSteps : 4,
        scaleStepWidth : 250,
        scaleStartValue : 0,
        scaleShowLabels:false,
        scaleFontSize:0,
        animation: false,
        responsive: true
    };

    let data = channel.fallingEmotions.data;
    let fallingEmotionsChart = CanvasDrawing.initFallingEmotions(diagramCanvas, chartOptions);
    CanvasDrawing.updateFallingEmotions(fallingEmotionsChart, data);

    // Draw the diagram and hide the diagram canvas
    ctx.drawImage(diagramCanvas, 0, 0, options.width, options.height);
    diagramCanvas.style.display = "none";
    ctx.restore();
}

function drawMsgPerTime(channel, ctx, options){
    ctx.save();
    options.apply(ctx);

    // Building a new Canvas for the Diagramm
    let diagramCanvas = document.createElement("canvas");
    diagramCanvas.height = options.height;
    diagramCanvas.width = options.width;
    document.body.appendChild(diagramCanvas);
    let newCtx = diagramCanvas.getContext("2d");

    let data = [];
    for (let msgData of channel.msgPerTime) {
        data.push(msgData.data);
    }
    let msgPerTimeChart = CanvasDrawing.initMsgPerTime(diagramCanvas);
    CanvasDrawing.updateMsgPerTime(msgPerTimeChart, data);

    // Draw the diagram and hide the diagram canvas
    ctx.drawImage(diagramCanvas, 0, 0, options.width, options.height);
    diagramCanvas.style.display = "none";
    ctx.restore();
}
