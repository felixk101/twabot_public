"""
This script only works on windows
"""
import os

folder = "public"

os.system("copy index.html "+folder+"\\index.html")

os.system("browserify -o "+folder+"/bundle.js app.js")
os.system("babel -o "+folder+"/build.js "+folder+"/bundle.js --presets es2015")
os.system("del "+folder+"\\bundle.js")