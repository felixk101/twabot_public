"use strict";

function draw() {
    let canvases = [
        "canvasActiveChannel1",
        "canvasActiveChannel2",
        "canvasActiveChannel3",
        "canvasActiveChannel4",
        "canvasActiveChannel5",
        "canvasActiveChannel6",
        "canvasEmotionChannel1",
        "canvasEmotionChannel2",
        "canvasEmotionChannel3",
        "canvasEmotionChannel4",
        "canvasEmotionChannel5",
        "canvasEmotionChannel6",
        "canvasOverall"
    ];

    canvases.forEach(canvas => createThumbnail(canvas, "channelName"));
}

function createThumbnail(canvas, channel){
    let can = document.getElementById(canvas);
    let ctx = can.getContext("2d");
    let height = can.height;
    let width = can.width;

    // Thumbnail
    ctx.save();
    ctx.scale(2/3,2/3);
    drawChannelThumb(channel, ctx, width, height);
    ctx.restore();

    // Fractal
    ctx.save();
    ctx.scale(1/3,1/3); // The fractal is 1/3 of the complete canvas size
    ctx.translate(2/3*width*3,0); // position *  width * scalefactor
    drawFractal(channel, ctx, width, height);
    ctx.restore();

    // Diagram1 // for calculation look at //Fractal
    ctx.save();
    ctx.scale(1/3,1/3);
    ctx.translate(2/3*width*3,1/3*height*3);
    drawDiagram1(channel, ctx, width, height);
    ctx.restore();

    // Diagram2 // for calculation look at //Fractal
    ctx.save();
    ctx.scale(1/3,1/3);
    ctx.translate(0,2/3*height*3);
    drawDiagram2(channel, ctx, width, height);
    ctx.restore();

    // Diagram3 // for calculation look at //Fractal
    ctx.save();
    ctx.scale(1/3,1/3);
    ctx.translate(1/3*width*3,2/3*height*3);
    drawDiagram3(channel, ctx, width, height);
    ctx.restore();

    // Diagram4 // for calculation look at //Fractal
    ctx.save();
    ctx.scale(1/3,1/3);
    ctx.translate(2/3*width*3,2/3*height*3);
    drawDiagram4(channel, ctx, width, height);
    ctx.restore();
}


function drawChannelThumb(channelName, ctx, width, height){
    // Dummy
    let img = getThumbnail(channelName);
    img.addEventListener("load", function(){
        ctx.save();
        ctx.scale(2/3,2/3);
        ctx.drawImage(img, 0,0,width,height);
        ctx.restore();
    },false);
}

function drawFractal(channelName, ctx, width, height){
    // Dummy
    ctx.fillStyle = "red";
    ctx.fillRect(0,0,width, height);
    ctx.fillStyle = "rgb(0,0,0)";
    ctx.fillText(channelName,10,10);
}

function drawDiagram1(channelName, ctx, width, height){
    let data = getEmotions(channelName);
    
    // Building a new Canvas for the Diagramm
    let diagramCanvas = document.createElement("canvas");
    diagramCanvas.height = height;
    diagramCanvas.width = width;
    document.body.appendChild(diagramCanvas);
    let newCtx = diagramCanvas.getContext("2d");

    // Build the chart
    let options = {
        scaleShowGridLines: false,
        scaleShowLabels:false,
        scaleFontSize:0,
        animation: false,
        responsive: true
    };
    let chart = new Chart(newCtx).Bar(data, options);
    // Set the barcolors
    let dataColors= ["blue","green","yellow","orange","red"]; // in getData unterbringen
    for (let i=0; i<chart.datasets[0].bars.length; i++){
        chart.datasets[0].bars[i].fillColor = dataColors[i];
    }
    chart.update();

    // Draw the diagram and hide the diagram canvas
    ctx.drawImage(diagramCanvas, 0, 0, width,height);
    diagramCanvas.style.display = "none";
}

function drawDiagram2(channelName, ctx, width, height){
    let data = getEmotions(channelName);

    // Building a new Canvas for the Diagramm
    let diagramCanvas = document.createElement("canvas");
    diagramCanvas.height = height;
    diagramCanvas.width = width;
    document.body.appendChild(diagramCanvas);
    let newCtx = diagramCanvas.getContext("2d");

    // Build the chart
    let options = {
        scaleShowLine: false,
        scaleShowLabels:false,
        scaleFontSize:0,
        animation: false,
        responsive: true
    };
    let chart = new Chart(newCtx).Radar(data, options);

    // Draw the diagram and hide the diagram canvas
    ctx.drawImage(diagramCanvas, 0, 0, width,height);
    diagramCanvas.style.display = "none";
}

function drawDiagram3(channelName, ctx, width, height){
    // Dummy
    ctx.fillStyle = "green";
    ctx.fillRect(0,0,width, height);
    ctx.fillStyle = "rgb(0,0,0)";
    ctx.fillText(channelName,10,10);
}

function drawDiagram4(channelName, ctx, width, height){
    // Dummy
    ctx.fillStyle = "grey";
    ctx.fillRect(0,0,width, height);
    ctx.fillStyle = "rgb(0,0,0)";
    ctx.fillText(channelName,10,10);
}


function getThumbnail(channelName){
    let img = new Image();
    img.src = 'http://static-cdn.jtvnw.net/jtv_user_pictures/reninsane-profile_image-c515f7b046929d1b-300x300.png';
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