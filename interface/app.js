"use strict";

let Vue = require("vue");
Vue.use(require('vue-resource'));
let canvasFactory = require("./canvasFactory");

let meinVue = new Vue({
    el: '#channelOverview',

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

            this.$http.get('/overview/activeChannels/')
                .success(function(channels){
                    this.$set("activeChannels", channels);
                })
                .error(function(error){
                    this.$set("activeChannels", require("./userMock.json").activeChannels);
                });

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
