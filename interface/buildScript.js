"use strict";

//This script only works on windows

// first npm install then run this script
let exec = require('child_process').execSync;
let platform = require('os').platform();
let update = require('./updateBuildScript.js');
let folder = "public";

function build() {
    if (platform == "win32") {
        console.log('Try to delete existing "' + folder + '" folder.');
        try {
            exec("rmdir /S /Q " + folder);
        } catch (err) {}
        exec("mkdir " + folder);

        exec("mkdir " + folder + "\\node_modules\\bootstrap");
        exec("xcopy /E node_modules\\bootstrap " + folder + "\\node_modules\\bootstrap");

        exec("copy favicon.ico " + folder + "\\favicon.ico");
        exec("copy about.html " + folder + "\\about.html");
    }
    else{
        console.log('Try to delete existing "' + folder + '" folder.');
        try {
            exec("rm -r " + folder);
        } catch (err) {}
        exec("mkdir " + folder);

        exec("mkdir " + folder + "/node_modules");
        exec("mkdir " + folder + "/node_modules/bootstrap");
        exec("cp -r node_modules/bootstrap " + folder + "/node_modules/bootstrap");

        exec("cp favicon.ico " + folder + "/favicon.ico");
        exec("cp about.html " + folder + "/about.html");
    }

    update();
}
build();
