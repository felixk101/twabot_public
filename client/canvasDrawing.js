"use strict";
/**
 * Created by Andreas Wundlechner
 *
 * This script handles all the canvas operations (with chart.js)
 *
 * The code corresponding to the fractal analysis isn't finished,
 * so for performance optimisation it is commented out.
 * The missing fractal is caused by too less time.
 */

const Chart = require('chart.js');
const emotionColorMap = require('./emotionColorMap.json');
const TransformOptions = require('./TransformOptions');

// Global chart.js options
//Chart.defaults.global.animationSteps = 30;
//Chart.defaults.global.animation = false;

// Amount of messages per time measurements to display.
const msgPerTimeCount = 20;

//exports.updateFractal = function (data) {
//    let ctx = canvas.getContext('2d');
//    let transformOptions = new TransformOptions(canvas.width, canvas.height);
//    drawFractal(ctx, transformOptions, data);
//};

// The standard options for the messages per time charts.
const msgPerTimeChartOptions = {
    responsive: true,
    animation: false
};

/**
 * Initializes a chart.js object to display the messages per time analysis.
 * @param canvas The canvas, where the chart should be drawn.
 * @param chartOptions The options for the chart.
 * @returns {*} The chart.js object.
 */
exports.initMsgPerTime = function (canvas, chartOptions=msgPerTimeChartOptions) {
    // Create the necessary data structure for chart.js.
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

    // Add empty measurements for the right chart size.
    for (let i=0; i<msgPerTimeCount; i++) {
        msgPerTimeChartData.labels.push("");
        msgPerTimeChartData.datasets[0].data.push(0);
    }

    // Build the chart.
    let ctx = canvas.getContext('2d');
    let chart = new Chart(ctx).Line(msgPerTimeChartData, chartOptions);

    return chart;
};

/**
 * This function updates a given messages per time chart with the new dataset.
 * @param chart A messages per time chart.
 * @param dataset The new measurements to display (as a list).
 */
exports.updateMsgPerTime = function (chart, dataset) {
    // Update for every data bit.
    for (let data of dataset) {
        let chartLength = chart.datasets[0].points.length;
        for (let i = 0; i < chartLength - 1; i++) {
            chart.datasets[0].points[i].value = chart.datasets[0].points[i + 1].value;
        }
        chart.datasets[0].points[chartLength - 1].value = data;
    }
    // Update the chart appearance.
    chart.update();
};

// The standard options for the falling emotions charts.
const fallingEmtionsChartOptions = {
    responsive: true,
    animation: false,
    scaleOverride : true,
    scaleSteps : 4,
    scaleStepWidth : 250,
    scaleStartValue : 0
};

/**
 * Initializes a chart.js object to display the falling emotions analysis.
 * @param canvas The canvas, where the chart should be drawn.
 * @param chartOptions The options for the chart.
 * @returns {*} The chart.js object.
 */
exports.initFallingEmotions = function (canvas, chartOptions=fallingEmtionsChartOptions) {
    // Create the necessary data structure for chart.js.
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

    // Create the bars for the emotions.
    for (let emotion in emotionColorMap){
        fallingEmotionsChartData.labels.push(emotion);
        fallingEmotionsChartData.datasets[0].data.push(0);
    }

    // Build the chart.
    let ctx = canvas.getContext('2d');
    let chart = new Chart(ctx).Bar(fallingEmotionsChartData, chartOptions);

    // Set the bar colors to the color of the emotion.
    for (let i=0; i<chart.datasets[0].bars.length; i++){
        chart.datasets[0].bars[i].fillColor = emotionColorMap[chart.datasets[0].bars[i].label];
    }

    chart.update();
    return chart;
};

/**
 * This function updates a given falling emotions chart with the new data.
 * @param chart A falling emotions chart.
 * @param data The new measurement.
 */
exports.updateFallingEmotions = function (chart, data) {
    // Update the bars.
    for (let i=0; i<chart.datasets[0].bars.length; i++) {
        chart.datasets[0].bars[i].value = data[chart.datasets[0].bars[i].label];
    }
    // Update the appearance.
    chart.update();
};


//function drawFractal(ctx, transformOptions, data){
//    ctx.save();
//    transformOptions.apply(ctx);
//    ctx.clearRect(0,0,transformOptions.width,transformOptions.height);
//
//    // for emotions:
//    drawPath(ctx, transformOptions);
//    ctx.restore();
//}

//function drawPath(ctx, transformOptions){
//    ctx.moveTo(0,transformOptions.height/2);
//    ctx.beginPath();
//    ctx.lineTo(transformOptions.width, transformOptions.height/2);
//    ctx.closePath();
//}
