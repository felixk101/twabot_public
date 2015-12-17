"use strict";

const Vue = require('vue');
Vue.use(require('vue-resource'));
//Vue.config.debug = true;
const canvasFactory = require('./canvasFactory');

let meinVue = new Vue({
    el: '#channelOverview',

    data: {
        activeChannels: [],
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
            for (let emotion in this.emotionChannels) {
                let channel = this.emotionChannels[emotion];
                if (channel) {
                    let canvas = document.getElementById("thumbnail_emotion_" + emotion);
                    canvasFactory.createThumbnail(canvas, channel);
                }
            }
        }
    }
});
