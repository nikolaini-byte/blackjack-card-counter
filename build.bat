@echo off
setlocal enabledelayedexpansion

echo ================================================
echo  Blackjack Card Counter - Build Script
echo ================================================

REM Check if NSIS is installed
where /q makensis
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ⚠️  NSIS (Nullsoft Scriptable Install System) is not installed or not in PATH.
    echo.
    echo Please install NSIS from: https://nsis.sourceforge.io/Download
    echo.
    echo After installation, make sure to add NSIS to your system PATH or
    echo restart your command prompt/terminal before running this script again.
    echo.
    pause
    exit /b 1
)

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
python -m PyInstaller ..\blackjack.spec --noconfirm --clean

if errorlevel 1 (
    echo Error: Failed to build executable
    pause
    exit /b 1
)

cd ..

echo [4/4] Creating Windows Installer...
echo.
echo 🛠️  Creating Windows Installer using NSIS...
python create_installer.py

if errorlevel 1 (
    echo.
    echo ❌ Failed to create Windows Installer.
    echo.
    echo This might be because:
    echo 1. NSIS is not installed or not in PATH
    echo 2. The build directory structure is not as expected
    echo 3. There was an error in the installer script
    echo.
    echo Please check the error messages above and ensure NSIS is properly installed.
    echo You can download NSIS from: https://nsis.sourceforge.io/Download
    pause
    exit /b 1
)

if errorlevel 1 (
    echo Error: Failed to create installer
    pause
    exit /b 1
)

echo.
echo ================================================
echo ✅ Build successful!
echo ================================================
echo.
echo 🎉 The following files were created:
echo.
echo 📂 Executable folder:
echo    %cd%\dist\BlackjackCardCounter
echo.
echo 💿 Windows Installer:
echo    %cd%\BlackjackCardCounter_Setup.exe
echo.
echo 📝 Next steps:
echo 1. Run 'BlackjackCardCounter_Setup.exe' to install the application
echo 2. Launch from Start Menu or Desktop shortcut
echo 3. Enjoy using Blackjack Card Counter!
echo.
echo ⚡ Tip: Share your feedback by opening an issue on GitHub:
echo https://github.com/nikolaini-byte/blackjack-card-counter/issues
echo.

pause
