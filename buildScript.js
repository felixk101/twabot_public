"use strict";

//This script only works on windows

const exec = require('child_process').execSync;
const platform = require('os').platform();
const destinationFolder = "public";
const sourceFolder = "client";

function update_build() {
    if (platform == "win32") {
        exec("browserify -o " + destinationFolder + "/bundleOverview.js " + sourceFolder + "/overview.js");
        exec("babel -o " + destinationFolder + "/buildOverview.js " + destinationFolder + "/bundleOverview.js --presets es2015");
        exec("del " + destinationFolder + "\\bundleOverview.js");
    }
    else {
        exec("browserify -o " + destinationFolder + "/bundleOverview.js " + sourceFolder + "/overview.js");
        exec("babel -o " + destinationFolder + "/buildOverview.js " + destinationFolder + "/bundleOverview.js --presets es2015");
        exec("rm " + destinationFolder + "/bundleOverview.js");
    }
};

if (require.main === module) {
    update_build();
}
module.exports = update_build;