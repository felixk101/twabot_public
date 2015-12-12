"use strict";

let Vue = require("vue");
let canvasFactory = require("./canvasFactory");

new Vue({
    el: '#activeChannels',

    data: {
        activeChannels: [],
        emotionChannels: []
    },

    ready: function() {
        this.fetchChannels();
        this.$nextTick(this.drawThumbnails);
    },

    methods: {
        fetchChannels: function () {
            this.$set("activeChannels", require("./userMock.json").activeChannels);
            this.$set("emotionChannels", require("./userMock.json").emotionChannels);
        },

        drawThumbnails: function(){
            for (let channel of this.activeChannels) {
                let canvas = document.getElementById("thumbnail_active_"+channel.name);
                canvasFactory.createThumbnail(canvas, channel);
            }
            for (let channel of this.emotionChannels) {
                let canvas = document.getElementById("thumbnail_emotion_"+channel.name);
                canvasFactory.createThumbnail(canvas, channel);
            }
        }
    }
});