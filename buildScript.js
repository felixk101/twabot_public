"use strict";
/**
 * Created by Andreas Wundlechner
 *
 * This script packs and transpiles the scripts /client/overview.js
 * and /client/user.js for the usage by web browsers.
 *
 * Requirements to run this script:
 * npm install -g browserify
 * npm install -g babel-cli
 */

const exec = require('child_process').execSync;
const platform = require('os').platform();
const destinationFolder = "public";
const sourceFolder = "client";

function update_build() {
    if (platform == "win32") {
        // Pack and transpile overview.js
        exec("browserify -o " + destinationFolder + "/bundleOverview.js " + sourceFolder + "/overview.js");
        exec("babel -o " + destinationFolder + "/buildOverview.js " + destinationFolder + "/bundleOverview.js --presets es2015");
        exec("del " + destinationFolder + "\\bundleOverview.js");

        // Pack and transpile user.js
        exec("browserify -o " + destinationFolder + "/bundleUser.js " + sourceFolder + "/user.js");
        exec("babel -o " + destinationFolder + "/buildUser.js " + destinationFolder + "/bundleUser.js --presets es2015");
        exec("del " + destinationFolder + "\\bundleUser.js");
    }
    else {
        // Pack and transpile overview.js
        exec("browserify -o " + destinationFolder + "/bundleOverview.js " + sourceFolder + "/overview.js");
        exec("babel -o " + destinationFolder + "/buildOverview.js " + destinationFolder + "/bundleOverview.js --presets es2015");
        exec("rm " + destinationFolder + "/bundleOverview.js");

        // Pack and transpile user.js
        exec("browserify -o " + destinationFolder + "/bundleUser.js " + sourceFolder + "/user.js");
        exec("babel -o " + destinationFolder + "/buildUser.js " + destinationFolder + "/bundleUser.js --presets es2015");
        exec("rm " + destinationFolder + "/bundleUser.js");
    }
}

if (require.main === module) {
    update_build();
}
module.exports = update_build;