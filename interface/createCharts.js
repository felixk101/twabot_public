"use strict";

function draw() {

    //fs.readFile()

    let data = {
        labels: ["emotion1", "emotion2", "emotion3", "emotion4", "emotion5"],
        datasets: [{
            fillColor: "rgba(220,220,220,0.5)",
            strokeColor: "rgba(220,220,220,0.8)",
            highlightFill: "rgba(220,220,220,0.75)",
            highlightStroke: "rgba(220,220,220,1)",
            data: [65, 59, 80, 81, 56]}
        ]
    }

    let canvas = document.getElementById("barchart");
    if (canvas.getContext){
        let ctx = canvas.getContext('2d');
        new Chart(ctx).Line(data);
    } else {
        alert("Dein Browser unterstuetzt das <canvas> Element nicht")
    }

    canvas = document.getElementById("radarchart");
    if (canvas.getContext){
        let ctx = canvas.getContext('2d');
        new Chart(ctx).Radar(data);
    } else {
        alert("Dein Browser unterstuetzt das <canvas> Element nicht")
    }
}
