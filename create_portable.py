#!/usr/bin/env python3
"""
Create a portable version of Blackjack Card Counter
"""
import os
import shutil
import sys
import subprocess
from pathlib import Path

def create_portable():
    print("Creating portable version of Blackjack Card Counter...")
    
    # Clean previous builds
    dist_dir = Path("dist/BlackjackCardCounter")
    if dist_dir.exists():
        print(f"Removing existing distribution directory: {dist_dir}")
        shutil.rmtree(dist_dir)
    
    # Ensure dist directory exists
    dist_dir.mkdir(parents=True, exist_ok=True)
    
    # Copy the built files
    print("Copying application files...")
    shutil.copytree("dist/BlackjackCardCounter", dist_dir / "app")
    
    # Create a batch file to start the application
    print("Creating launcher...")
    with open(dist_dir / "BlackjackCardCounter.bat", "w") as f:
        f.write("""@echo off
setlocal
cd /d "%~dp0app"
start "" BlackjackCardCounter.exe
""")
    
    # Create a README file
    with open(dist_dir / "README.txt", "w") as f:
        f.write("""Blackjack Card Counter - Portable Version
======================================

To start the application, run 'BlackjackCardCounter.bat'.

This is a portable version that doesn't require installation.

System Requirements:
- Windows 10 or later
- No additional software required

For support, please visit the project's GitHub page.
""")
    
    # Create a ZIP archive of the portable version
    print("Creating portable ZIP archive...")
    shutil.make_archive("BlackjackCardCounter_Portable", 'zip', "dist", "BlackjackCardCounter")
    
    print("\nPortable version created successfully!")
    print(f"Location: {os.path.abspath('BlackjackCardCounter_Portable.zip')}")

if __name__ == "__main__":
    create_portable()
