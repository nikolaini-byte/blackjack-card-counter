@echo off
cd "%~dp0"
echo Installing Pillow...
python -m pip install --upgrade pip
pip install Pillow
echo Generating icons...
python generate_icons.py
echo Done!
pause