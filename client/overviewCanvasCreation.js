"use strict";
/**
 * Created by Andreas Wundlechner
 *
 * This script handles the creation of the thumbnails for the overview page.
 *
 * The code corresponding to the fractal analysis isn't finished,
 * so for performance optimisation it is commented out.
 * The missing fractal is caused by too less time.
 */

const Chart = require('chart.js');
const TransformOptions = require('./TransformOptions');
const CanvasDrawing = require('./canvasDrawing');

/**
 * This function draws a thumbnail of the channel in the given canvas.
 * @param canvas The canvas, where to draw the thumbnail.
 * @param channel The channel object which contains all the needed information.
 */
exports.createThumbnail = function createThumbnail(canvas, channel){
    let ctx = canvas.getContext("2d");

    // Split the canvas into 4 positions, where the previews of the analysis is drawn.
    let positions = [
        new TransformOptions(canvas.width, canvas.height, 2/3, 1),
        new TransformOptions(canvas.width, canvas.height, 1/3, 1/3, 2/3, 0),
        new TransformOptions(canvas.width, canvas.height, 1/3, 1/3, 2/3, 1/3),
        new TransformOptions(canvas.width, canvas.height, 1/3, 1/3, 2/3, 2/3)
    ];

    // To the positions corresponding functions.
    let drawFunctions = [
        drawChannelLogo,
        drawFallingEmotions,
        drawMsgPerTime,
        drawFractal
    ];

    // Calling the drawFunction for all positions.
    for (let i=0; i<positions.length; i++){
        drawFunctions[i](channel, ctx, positions[i]);
    }

};

/**
 * This function draws the channel logo of the given channel to the canvas.
 * @param channel The channel as a source for the logo source.
 * @param ctx The context of the canvas to draw the logo.
 * @param options The TransformOptions for the canvas context.
 */
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

/**
 * This is a dummy implementation for the fractal. It draws only a blue rectangle.
 * (This function is still needed for the thumbnail)
 * @param channel The channel as a source for the fractal analysis.
 * @param ctx The context of the canvas to draw the fractal.
 * @param options The TransformOptions for the canvas context.
 */
function drawFractal(channel, ctx, options){
    ctx.save();
    options.apply(ctx);
    ctx.fillStyle = "blue";
    ctx.fillRect(0,0,options.width, options.height);
    ctx.restore();
}

/**
 * This function draws the falling emotions analysis of the given channel to the canvas.
 * @param channel The channel as a source for the analysis data.
 * @param ctx The context of the canvas to draw the chart.
 * @param options The TransformOptions for the canvas context.
 */
function drawFallingEmotions(channel, ctx, options){
    ctx.save();
    options.apply(ctx);
    
    // Building a new canvas for the diagram.
    let diagramCanvas = document.createElement("canvas");
    diagramCanvas.height = options.height;
    diagramCanvas.width = options.width;
    document.body.appendChild(diagramCanvas); // Some DOM action for applying width and height.

    // Build the chart.
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

    // Draw the diagram and hide the diagram canvas.
    ctx.drawImage(diagramCanvas, 0, 0, options.width, options.height);
    diagramCanvas.style.display = "none";
    ctx.restore();
}

/**
 * This function draws the messages per time analysis of the given channel to the canvas.
 * @param channel The channel as a source for the analysis data.
 * @param ctx The context of the canvas to draw the chart.
 * @param options The TransformOptions for the canvas context.
 */
function drawMsgPerTime(channel, ctx, options){
    ctx.save();
    options.apply(ctx);

    // Building a new canvas for the diagram.
    let diagramCanvas = document.createElement("canvas");
    diagramCanvas.height = options.height;
    diagramCanvas.width = options.width;
    document.body.appendChild(diagramCanvas);

    // Build the chart.
    let data = [];
    for (let msgData of channel.msgPerTime) {
        data.push(msgData.data);
    }
    let msgPerTimeChart = CanvasDrawing.initMsgPerTime(diagramCanvas);
    CanvasDrawing.updateMsgPerTime(msgPerTimeChart, data);

    // Draw the diagram and hide the diagram canvas.
    ctx.drawImage(diagramCanvas, 0, 0, options.width, options.height);
    diagramCanvas.style.display = "none";
    ctx.restore();
}
