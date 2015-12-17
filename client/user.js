"use strict";

const Vue = require('vue');
Vue.use(require('vue-resource'));
const url = require('url');

let meinVue = new Vue({
    el: '#user',

    data: {
        activeChannels: [],
        emotionChannels: []
    },

    ready: function() {
        this.fetchDiagrammData();
    },

    methods: {
        fetchDiagrammData: function () {
            let socket = io();// + document.domain);
            socket.on('connect', function(){
                let path = url.parse(document.URL);
                let pathname = path.pathname.split('/');
                let index = pathname.indexOf('user');
                socket.emit('registerChannel', pathname[index+1])
            });



            /*this.$http.get('/overview/activeChannels/')
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
                });*/
        }
    }
});
