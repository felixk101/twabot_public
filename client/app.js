"use strict";

const Vue = require('vue');
Vue.use(require('vue-resource'));
//Vue.config.debug = true;
const canvasFactory = require('./canvasFactory');
const emotions = require('../listemotions.json');

let meinVue = new Vue({
    el: '#channelOverview',

    data: {
        activeChannels: [],
        emotions: emotions,
        emotionChannels: {}
    },

    ready: function() {
        this.fetchChannels();
    },

    methods: {
        fetchChannels: function () {
            this.$http.get('/overview/activeChannels/')
                .success(function(channels){
                    this.$set("activeChannels", channels);
                    this.$nextTick(this.drawThumbnailsActive);
                })
                .error(function(error){
                    this.$set("activeChannels", require("./userMock.json").activeChannels);
                    this.$nextTick(this.drawThumbnailsActive);
                });

            this.$http.get('/overview/emotionChannels/')
                .success(function(channels){
                    this.$set("emotionChannels", channels);
                    this.$nextTick(this.drawThumbnailsEmotion);
                })
                .error(function(error){
                });
        },

        drawThumbnailsActive: function(){
            for (let channel of this.activeChannels) {
                let canvas = document.getElementById("thumbnail_active_"+channel.name);
                canvasFactory.createThumbnail(canvas, channel);
            }
        },

        drawThumbnailsEmotion: function(){
            for (let emotion of this.emotions) {
                let channel = this.emotionChannels[emotion];
                if (channel) {
                    let canvas = document.getElementById("thumbnail_emotion_" + channel.name);
                    canvasFactory.createThumbnail(canvas, channel);
                }
            }
        }
    }
});
