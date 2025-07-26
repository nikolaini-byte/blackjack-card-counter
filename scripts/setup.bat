@echo off
echo Setting up Python environment...

REM Create virtual environment
python -m venv venv

REM Activate venv using batch file
call venv\Scripts\activate.bat

REM Install required packages
python -m pip install --upgrade pip
pip install Pillow

REM Generate icons
python generate_icons.py

echo Setup complete!
pause