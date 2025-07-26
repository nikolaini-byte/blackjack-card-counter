#!/usr/bin/env python3
"""
Blackjack Card Counter - Hauptstartscript
Startet den API-Server mit integriertem Frontend
"""
import subprocess
import sys
import time
import signal
import os
from config import API_PORT, SERVER_HOST

def get_python_executable():
    """Ermittelt den Python-Interpreter (venv falls vorhanden)"""
    venv_python = os.path.join(os.getcwd(), 'venv', 'bin', 'python')
    if os.path.exists(venv_python):
        return venv_python
    return sys.executable

def start_server():
    """Startet den API-Server mit integriertem Frontend"""
    python_exe = get_python_executable()
    
    try:
        print("Starting Blackjack Card Counter...")
        print(f"Using Python: {python_exe}")
        
        # API Server mit integriertem Frontend starten
        print(f"Server running on http://{SERVER_HOST}:{API_PORT}")
        api_process = subprocess.Popen([
            python_exe, "src/api/server.py"
        ], cwd=os.getcwd())
        
        print("\nServer started!")
        print("Open http://{SERVER_HOST}:{API_PORT} in your browser")
        print("API Documentation: http://{SERVER_HOST}:{API_PORT}/docs")
        print("\nPress Ctrl+C to exit\n")
        
        # Warten auf Benutzerinteraktion
        while True:
            time.sleep(1)
            
    except KeyboardInterrupt:
        print("\nStopping server...")
        api_process.terminate()
        api_process.wait()
        print("Server stopped")
        sys.exit(0)
        
    except Exception as e:
        print(f"Error starting server: {e}")
        api_process.terminate()
        sys.exit(1)

if __name__ == "__main__":
    start_server()
