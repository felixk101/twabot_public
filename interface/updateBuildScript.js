"use strict";

//This script only works on windows

let exec = require('child_process').execSync;
let platform = require('os').platform();
let folder = "public";

function update_build() {
    if (platform == "win32") {
        exec("copy index.html " + folder + "\\index.html");

        exec("browserify -o " + folder + "/bundle.js app.js");
        exec("babel -o " + folder + "/build.js " + folder + "/bundle.js --presets es2015");
        exec("del " + folder + "\\bundle.js");
    }
    else {
        exec("cp index.html " + folder + "/index.html");

        exec("browserify -o " + folder + "/bundle.js app.js");
        exec("babel -o " + folder + "/build.js " + folder + "/bundle.js --presets es2015");
        exec("rm " + folder + "/bundle.js");
    }
};

if (require.main === module) {
    update_build();
}
module.exports = update_build;