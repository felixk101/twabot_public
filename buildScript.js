"use strict";

//This script only works on windows

const exec = require('child_process').execSync;
const platform = require('os').platform();
const destinationFolder = "public";
const sourceFolder = "client";

function update_build() {
    if (platform == "win32") {
        exec("browserify -o " + destinationFolder + "/bundle.js " + sourceFolder + "/app.js");
        exec("babel -o " + destinationFolder + "/build.js " + destinationFolder + "/bundle.js --presets es2015");
        exec("del " + destinationFolder + "\\bundle.js");
    }
    else {
        exec("browserify -o " + destinationFolder + "/bundle.js " + sourceFolder + "/app.js");
        exec("babel -o " + destinationFolder + "/build.js " + destinationFolder + "/bundle.js --presets es2015");
        exec("rm " + destinationFolder + "/bundle.js");
    }
};

if (require.main === module) {
    update_build();
}
module.exports = update_build;