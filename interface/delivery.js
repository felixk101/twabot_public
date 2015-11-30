"use strict";

let express = require('express');
let app = express();
let fs = require('fs');

app.get('/user/:user/:diagramm?', function(req, res){
    res.send(req.params.user);
});

app.get('/about.html', function(req, res){
    let options = {};
    addBrowserOptions(req, options)
    res.render('about.ejs', options);
});

app.get('/:path?/:file', function(req, res){
    let data = req.params.path?req.params.path+'/'+req.params.file:req.params.file;
    fs.readFile(data, function(err, content){
        if(err){
            res.statusCode = 404;
            res.end('Page not found.');
        }
        res.send(content);
    });
});

app.get('*', function(req, res){
    let options = {};
    addBrowserOptions(req, options)
    res.render('Overview.ejs', options);
});

app.listen(80);

function addBrowserOptions(req, options){
    if (isBrowserFirefox(req))
        options['scriptlanguage'] = 'application/javascript;version=1.8';
    else
        options['scriptlanguage'] = 'application/ecmascript';
}

function isBrowserFirefox(req){
    return req.headers['user-agent'].indexOf('Firefox')>1?true:false;
}