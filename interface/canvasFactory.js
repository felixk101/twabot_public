"use strict";

let Chart = require('chart.js');

exports.createThumbnail = function createThumbnail(canvas, channel){
    let ctx = canvas.getContext("2d");

    let transformOptionsPrototyp = {
        scaleX: 1,
        scaleY: 1,
        translateX: 0,
        translateY: 0,
        width: canvas.width,
        height: canvas.height,
        setScale: function(x,y){
            this.scaleX = x;
            this.scaleY = y;
        },
        /**
         * Translation is relative to the width and heigth.
         * Example: Width is 300, x is 2/3 => the drawing starts at 200
         * @param x
         * @param y
         */
        setTranslation: function(x,y){
            this.translateX = x;
            this.translateY = y;
        },
        apply: function(ctx){
            ctx.scale(this.scaleX, this.scaleY);
            ctx.translate(this.translateX * this.width / this.scaleX,
                this.translateY * this.height / this.scaleY);
        }
    };

    // Logo
    ctx.save();
    let options = Object.create(transformOptionsPrototyp);
    options.setScale(2/3, 2/3);
    drawChannelLogo(channel.logo, ctx, options);
    ctx.restore();

    // Fractal
    ctx.save();
    options = Object.create(transformOptionsPrototyp);
    options.setScale(1/3, 1/3); // The fractal is 1/3 of the complete canvas size
    options.setTranslation(2/3, 0); // Tho position relative to the size
    drawFractal(channel.name, ctx, options);
    ctx.restore();

    // Diagram1 // for calculation look at //Fractal
    ctx.save();
    options = Object.create(transformOptionsPrototyp);
    options.setScale(1/3, 1/3);
    options.setTranslation(2/3, 1/3);
    drawDiagram1(channel.name, ctx, options);
    ctx.restore();

    // Diagram2 // for calculation look at //Fractal
    ctx.save();
    options = Object.create(transformOptionsPrototyp);
    options.setScale(1/3, 1/3);
    options.setTranslation(0, 2/3);
    drawDiagram2(channel.name, ctx, options);
    ctx.restore();

    // Diagram3 // for calculation look at //Fractal
    ctx.save();
    options = Object.create(transformOptionsPrototyp);
    options.setScale(1/3, 1/3);
    options.setTranslation(1/3, 2/3);
    drawDiagram3(channel.name, ctx, options);
    ctx.restore();

    // Diagram4 // for calculation look at //Fractal
    ctx.save();
    options = Object.create(transformOptionsPrototyp);
    options.setScale(1/3,1/3);
    options.setTranslation(2/3, 2/3);
    drawDiagram4(channel.name, ctx, options);
    ctx.restore();
};


function drawChannelLogo(channelLogo, ctx, options){
    // Dummy
    let img = getThumbnail(channelLogo);
    img.addEventListener("load", function(){
        ctx.save();
        options.apply(ctx);
        ctx.drawImage(img, 0, 0, options.width, options.height);
        ctx.restore();
    },false);
}

function drawFractal(channelName, ctx, options){
    // Dummy
    ctx.save();
    options.apply(ctx);
    ctx.fillStyle = "red";
    ctx.fillRect(0,0,options.width, options.height);
    ctx.fillStyle = "rgb(0,0,0)";
    ctx.fillText(channelName,10,10);
    ctx.restore();
}

function drawDiagram1(channelName, ctx, options){
    ctx.save();
    options.apply(ctx);
    let data = getEmotions(channelName);
    
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

function drawDiagram2(channelName, ctx, options){
    ctx.save();
    options.apply(ctx);
    let data = getEmotions(channelName);

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

function drawDiagram3(channelName, ctx, options){
    // Dummy
    ctx.save();
    options.apply(ctx);
    ctx.fillStyle = "green";
    ctx.fillRect(0, 0, options.width, options.height);
    ctx.fillStyle = "rgb(0,0,0)";
    ctx.fillText(channelName,10,10);
    ctx.restore();
}

function drawDiagram4(channelName, ctx, options){
    // Dummy
    ctx.save();
    options.apply(ctx);
    ctx.fillStyle = "grey";
    ctx.fillRect(0, 0, options.width, options.height);
    ctx.fillStyle = "rgb(0,0,0)";
    ctx.fillText(channelName,10,10);
    ctx.restore();
}


function getThumbnail(channelLogo){
    let img = new Image();
    img.src = channelLogo;
    return img;
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