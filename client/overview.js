"use strict";
/**
 * Created by Andreas Wundlechner
 *
 * This script will run, when the user connects to the server on the root directory
 */

const Vue = require('vue');
Vue.use(require('vue-resource'));
const canvasCreation = require('./overviewCanvasCreation');

let meinVue = new Vue({
    el: '#channelOverview',

    data: {
        activeChannels: [],
        emotionChannels: {}
    },

    /**
     * This function will be called, when the website is ready.
     */
    ready: function() {
        this.fetchChannels();
    },

    methods: {
        /**
         * Request all channels needed for the overview page.
         */
        fetchChannels: function () {
            // Request the most active channels
            this.$http.get('/overview/activeChannels/')
                .success(function(channels){
                    this.$set("activeChannels", channels);
                    this.$nextTick(this.drawThumbnailsActive);
                })
                .error(function(error){
                    console.log(error);
                });

            // Request the most emotional channels
            this.$http.get('/overview/emotionChannels/')
                .success(function(channels){
                    this.$set("emotionChannels", channels);
                    this.$nextTick(this.drawThumbnailsEmotion);
                })
                .error(function(error){
                    console.log(error);
                });
        },

        /**
         * This functoin is called, when the active channels arrive.
         * The corresponding canvases will be drawn.
         */
        drawThumbnailsActive: function(){
            for (let channel of this.activeChannels) {
                let canvas = document.getElementById("thumbnail_active_"+channel.name);
                canvasCreation.createThumbnail(canvas, channel);
            }
        },

        /**
         * This function is called, when the most emotional channels arrive.
         * The corresponding canvases will be drawn.
         */
        drawThumbnailsEmotion: function(){
            for (let emotion in this.emotionChannels) {
                let channel = this.emotionChannels[emotion];
                if (channel) {
                    let canvas = document.getElementById("thumbnail_emotion_" + emotion);
                    canvasCreation.createThumbnail(canvas, channel);
                }
            }
        }
    }
});
