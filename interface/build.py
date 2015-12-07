"""
This script only works on windows
"""
import os

# first npm install then run this script

folder = "public"

os.system("rmdir /S /Q "+folder)
os.system("mkdir "+folder)

os.system("mkdir "+folder+"\\node_modules\\bootstrap")
os.system("xcopy /E node_modules\\bootstrap "+folder+"\\node_modules\\bootstrap")

os.system("python update_build.py")