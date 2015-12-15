"use strict";

const Chart = require('chart.js');
const TransformOptions = require('./TransformOptions');

exports.createThumbnail = function createThumbnail(canvas, channel){
    let ctx = canvas.getContext("2d");

    // Old positions
    let positions = [
        new TransformOptions(canvas.width, canvas.height, 2/3, 2/3),
        new TransformOptions(canvas.width, canvas.height, 1/3, 1/3, 2/3, 0),
        new TransformOptions(canvas.width, canvas.height, 1/3, 1/3, 2/3, 1/3),
        new TransformOptions(canvas.width, canvas.height, 1/3, 1/3, 0, 2/3),
        new TransformOptions(canvas.width, canvas.height, 1/3, 1/3, 1/3, 2/3),
        new TransformOptions(canvas.width, canvas.height, 1/3, 1/3, 2/3, 2/3)
    ];

    positions = [
        new TransformOptions(canvas.width, canvas.height, 2/3, 1),
        new TransformOptions(canvas.width, canvas.height, 1/3, 1/3, 2/3, 0),
        new TransformOptions(canvas.width, canvas.height, 1/3, 1/3, 2/3, 1/3),
        new TransformOptions(canvas.width, canvas.height, 1/3, 1/3, 2/3, 2/3)
    ];

    let drawFunctions = [
        drawChannelLogo,
        drawFractal,
        drawDiagram1,
        drawDiagram2//,
        //drawDiagram3,
        //drawDiagram4
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
    ctx.fillStyle = "red";
    ctx.fillRect(0,0,options.width, options.height);
    ctx.fillStyle = "rgb(0,0,0)";
    ctx.fillText(channel.name,10,10);
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
}

function drawDiagram2(channel, ctx, options){
    ctx.save();
    options.apply(ctx);
    let data = getEmotions(channel.name);

    // Building a new Canvas for the Diagramm
    let diagramCanvas = document.createElement("canvas");
    diagramCanvas.height = options.height;
    diagramCanvas.width = options.width;
    document.body.appendChild(diagramCanvas);
    let newCtx = diagramCanvas.getContext("2d");

    // Build the chart
    let chartOptions = {
        scaleShowLine: false,
        scaleShowLabels:false,
        scaleFontSize:0,
        animation: false,
        responsive: true
    };
    let chart = new Chart(newCtx).Radar(data, chartOptions);

    // Draw the diagram and hide the diagram canvas
    ctx.drawImage(diagramCanvas, 0, 0, options.width, options.height);
    diagramCanvas.style.display = "none";
    ctx.restore();
}

function drawDiagram3(channel, ctx, options){
    // Dummy
    ctx.save();
    options.apply(ctx);
    ctx.fillStyle = "green";
    ctx.fillRect(0, 0, options.width, options.height);
    ctx.fillStyle = "rgb(0,0,0)";
    ctx.fillText(channel.name,10,10);
    ctx.restore();
}

function drawDiagram4(channel, ctx, options){
    // Dummy
    ctx.save();
    options.apply(ctx);
    ctx.fillStyle = "grey";
    ctx.fillRect(0, 0, options.width, options.height);
    ctx.fillStyle = "rgb(0,0,0)";
    ctx.fillText(channel.name,10,10);
    ctx.restore();
}



function getEmotions(channelName){
    return {
        labels: ["emotion1", "emotion2", "emotion3", "emotion4", "emotion5"],
        datasets: [{
            fillColor: "rgba(220,220,220,0.5)",
            strokeColor: "rgba(220,220,220,0.8)",
            highlightFill: "rgba(220,220,220,0.75)",
            highlightStroke: "rgba(220,220,220,1)",
            data: [65, 10, 80, 31, 56],
            dataColors: ["blue","green","yellow","orange","red"]
        }
    ]
    };
}


/* saved for later:
 let animationProgress = function() {
 ctx.save();
 //ctx.scale(1/3,1/3);
 //ctx.translate(2/3*width*3,1/3*height*3);
 ctx.clearRect(0,0,width,height);
 ctx.drawImage(canvas, 0, 0, width,height);
 ctx.restore();
 };
 */