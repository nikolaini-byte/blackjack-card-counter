#!/bin/bash

# Blackjack Card Counter - Deployment Script
# Automatisiert Setup und Start der Anwendung

set -e

echo "🃏 Blackjack Card Counter - Deployment"
echo "======================================"

# Prüfe Python Installation
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 ist nicht installiert!"
    exit 1
fi

echo "✅ Python3 gefunden: $(python3 --version)"

# Virtual Environment erstellen falls nicht vorhanden
if [ ! -d "venv" ]; then
    echo "📦 Erstelle Virtual Environment..."
    python3 -m venv venv
fi

# Virtual Environment aktivieren und Dependencies installieren
echo "📥 Installiere Dependencies..."
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt

# Anwendung starten
echo "🚀 Starte Anwendung..."
python3 start.py
