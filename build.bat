@echo off
echo ================================================
echo  Blackjack Card Counter - Build Script
echo ================================================

echo [1/4] Installing required packages...
pip install -r requirements.txt
pip install pyinstaller pywin32

if errorlevel 1 (
    echo Error: Failed to install required packages
    pause
    exit /b 1
)

echo [2/4] Creating build directories...
if not exist "build" mkdir build
if not exist "dist" mkdir dist
if not exist "installer" mkdir installer

cd build

echo [3/4] Building Blackjack Card Counter executable...
pyinstaller ..\blackjack.spec --noconfirm --clean

if errorlevel 1 (
    echo Error: Failed to build executable
    pause
    exit /b 1
)

cd ..

echo [4/4] Creating Windows Installer...
python create_installer.py

if errorlevel 1 (
    echo Error: Failed to create installer
    pause
    exit /b 1
)

echo.
echo ================================================
echo Build successful!
echo.
echo The following files were created:
echo - Executable folder: %cd%\dist\BlackjackCardCounter
echo - Installer: %cd%\BlackjackCardCounter_Setup.exe
echo.
echo You can now distribute the installer to other Windows users.
pause
