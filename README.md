# Blackjack Card Counter & Decision Engine

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python 3.8+](https://img.shields.io/badge/python-3.8+-blue.svg)](https://www.python.org/downloads/)
[![Windows](https://img.shields.io/badge/Windows-Supported-brightgreen)](https://www.microsoft.com/windows/)
[![Build Status](https://img.shields.io/github/actions/workflow/status/nikolaini-byte/blackjack-card-counter/build.yml?branch=main)](https://github.com/nikolaini-byte/blackjack-card-counter/actions)

An advanced, mathematically-driven Blackjack analysis tool featuring sophisticated card counting systems, Expected Value calculations, and optimal strategy recommendations. This application provides both a desktop interface and a web-based API for blackjack strategy analysis.

## 🚀 Features

### 🎯 Mathematical Decision Engine
- **Expected Value Calculations** - Computes EV for every possible action (Hit, Stand, Double, Split)
- **Monte Carlo Simulation** - 10,000+ simulation rounds per decision for statistical significance
- **Dynamic Strategy** - Adapts to hand value, dealer upcard, and true count
- **Confidence Scoring** - Provides confidence levels for each recommendation
- **Detailed Reasoning** - Explains the mathematical logic behind each decision

### 🃏 Advanced Card Counting
- **Multiple Systems** - Hi-Lo, KO, Omega II, Wong Halves, Zen Count
- **True Count Calculation** - Automatic deck penetration tracking
- **Real-time Analysis** - Live probability calculations
- **Visual Feedback** - Color-coded count displays with animations

### 📊 Professional Analytics
- **Bankroll Management** - Kelly Criterion betting optimization
- **Risk Analysis** - Risk of Ruin calculations
- **Probability Engine** - Advanced win/bust probability analysis
- **Performance Tracking** - Session analysis and statistics

### 🖥️ Cross-Platform Support
- **Windows Installer** - Easy installation with automatic updates
- **Portable Version** - No installation required
- **Web Interface** - Access from any device on your local network
- **REST API** - Integrate with other applications

## 🚀 Quick Start

### Prerequisites
- Windows 10/11 (64-bit)
- Python 3.8 or higher (for development)
- pip (Python package manager)

### Installation Options

#### Option 1: Windows Installer (Recommended)
1. Download the latest `BlackjackCardCounter_Setup.exe` from [Releases](https://github.com/nikolaini-byte/blackjack-card-counter/releases)
2. Run the installer and follow the on-screen instructions
3. Launch from Start Menu or Desktop shortcut

#### Option 2: Portable Version
1. Download `BlackjackCardCounter_Portable.zip` from [Releases](https://github.com/nikolaini-byte/blackjack-card-counter/releases)
2. Extract to a folder of your choice
3. Run `BlackjackCardCounter.exe`

#### Option 3: Build from Source
1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/blackjack-card-counter.git
   cd blackjack-card-counter
   ```
2. Run the build script:
   ```bash
   build.bat
   ```
3. Find the installer in the root directory or the portable version in `dist` folder

### Running the Application

- **Windows Installer/Portable**: Simply launch the application from Start Menu or Desktop shortcut
- **From Source**:
  ```bash
  # Install dependencies
  pip install -r requirements.txt
  
  # Start the application
  python start.py
  ```
  Access the web interface at [http://127.0.0.1:8000](http://127.0.0.1:8000)

## 🚀 Quick Start

### Prerequisites
- Python 3.8 or higher
- pip (Python package manager)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/blackjack-card-counter.git
   cd blackjack-card-counter
   ```

2. **Set up a virtual environment**
   ```bash
   # Create virtual environment
   python -m venv venv
   
   # Activate virtual environment
   # On Windows:
   .\venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

### Running the Application

Choose one of the following methods to start the application:

```bash
# Option 1: One-click deployment (Linux/macOS)
./deploy.sh

# Option 2: Manual start
python start.py

# Option 3: Development mode
python -m src.api.server
```

Access the application at: [http://127.0.0.1:8000](http://127.0.0.1:8000)

## 🏗️ Project Structure

```
blackjack-card-counter/
├── build/                    # Build output directory
├── dist/                     # Distribution files
├── installer/                # Installer build files
├── scripts/                  # Utility scripts
├── src/                      # Source code
│   ├── api/                  # FastAPI backend
│   │   ├── server.py         # Main application server
│   │   └── decision_engine.py # Game logic and strategy
│   ├── static/               # Frontend assets
│   │   ├── css/              # Stylesheets
│   │   └── js/               # JavaScript files
│   └── templates/            # HTML templates
├── blackjack.spec           # PyInstaller configuration
├── build.bat                # Windows build script
├── create_installer.py      # Installer creation script
├── create_portable.py       # Portable version creation script
├── requirements.txt         # Python dependencies
└── start.py                # Application entry point
```

## 🛠️ Development

### Prerequisites
- Python 3.8+
- pip
- Git

### Setting Up Development Environment

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/blackjack-card-counter.git
   cd blackjack-card-counter
   ```

2. Create and activate a virtual environment:
   ```bash
   # Windows
   python -m venv venv
   .\venv\Scripts\activate
   
   # macOS/Linux
   python3 -m venv venv
   source venv/bin/activate
   ```

3. Install development dependencies:
   ```bash
   pip install -r requirements.txt
   pip install pytest pytest-cov black flake8
   ```

### Building the Application

1. Run the build script:
   ```bash
   .\build.bat
   ```
   This will:
   - Install required packages
   - Create a standalone executable
   - Generate a Windows installer
   - Create a portable version

2. Find the outputs:
   - Installer: `BlackjackCardCounter_Setup.exe`
   - Portable: `dist/BlackjackCardCounter/`

### Running Tests

```bash
pytest tests/
```

### Code Style

This project uses:
- **Black** for code formatting
- **Flake8** for linting
- **isort** for import sorting

Run code style checks:
```bash
black .
flake8
isort .
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support, please open an issue on the [GitHub repository](https://github.com/yourusername/blackjack-card-counter/issues).

## 📚 Resources

- [Blackjack Strategy Charts](https://www.blackjackapprenticeship.com/blackjack-strategy-charts/)
- [Card Counting Systems](https://www.blackjackinfo.com/blackjack-card-counting-systems/)
- [Basic Strategy Trainer](https://www.blackjackinfo.com/blackjack-trainer/)

## 📊 Project Status

[![GitHub last commit](https://img.shields.io/github/last-commit/nikolaini-byte/blackjack-card-counter)](https://github.com/nikolaini-byte/blackjack-card-counter/commits/main)
[![GitHub issues](https://img.shields.io/github/issues/nikolaini-byte/blackjack-card-counter)](https://github.com/nikolaini-byte/blackjack-card-counter/issues)
[![GitHub stars](https://img.shields.io/github/stars/nikolaini-byte/blackjack-card-counter?style=social)](https://github.com/nikolaini-byte/blackjack-card-counter/stargazers)

## 🛠️ Usage Guide

### 1. Card Counting
1. Enter cards as they're dealt (e.g., `A, K, 5, 2`)
2. Monitor running and true counts in real-time
3. Use color-coded indicators for quick reference

### 2. Strategy Decisions
1. Input your hand (e.g., `K, 6`)
2. Input dealer's upcard (e.g., `10`)
3. Receive mathematically optimal recommendation
4. View detailed Expected Value breakdown

### 3. Advanced Analysis
- Click "Advanced Analysis" for detailed EV comparison
- Review confidence levels and reasoning
- Analyze bust probabilities and win chances

### 4. Bankroll Management
- Set your bankroll and risk tolerance
- Get Kelly Criterion betting recommendations
- Monitor Risk of Ruin calculations

## 📚 Counting Systems

| System | Accuracy | Difficulty | Card Values |
|--------|----------|------------|-------------|
| **Hi-Lo** | 97% | Beginner | 2-6: +1, 7-9: 0, 10-A: -1 |
| **KO** | 98% | Beginner | 2-7: +1, 8-9: 0, 10-A: -1 |
| **Omega II** | 92% | Advanced | Complex multi-level |
| **Wong Halves** | 99% | Expert | Fractional values |
| **Zen Count** | 96% | Advanced | Balanced system |

## 🔌 API Reference

### Strategy Analysis
```http
POST /strategy
Content-Type: application/json

{
  "player_hand": ["K", "6"],
  "dealer_card": "10",
  "true_count": 2.5,
  "decks_remaining": 3.0,
  "counting_system": "hiLo"
}
```

**Response:**
```json
{
  "action": "stand",
  "expected_value": -0.555,
  "all_expected_values": {
    "hit": -0.766,
    "stand": -0.555,
    "double": -1.120
  },
  "player_value": 16,
  "is_soft": false,
  "dealer_upcard_value": 10,
  "bust_probability": 0.610,
  "confidence": 0.211,
  "reasoning": "With hard 16 vs dealer 10, STAND has the highest EV...",
  "recommendation": {
    "action": "stand",
    "text_en": "Stand",
    "text_de": "Stehen bleiben",
    "confidence_level": "high"
  }
}
```

### Available Endpoints
- `POST /analyze` - Analyze card history
- `POST /bankroll` - Get bankroll management advice
- `GET /` - Web interface

## 🏗️ Architecture

### Code Structure
```
blackjack-card-counter/
├── src/
│   ├── api/
│   │   ├── server.py              # FastAPI server with integrated frontend
│   │   └── decision_engine.py     # Mathematical decision engine
│   ├── static/
│   │   ├── css/style.css          # Modern glassmorphism styles
│   │   └── js/script.js           # Enhanced frontend logic
│   └── templates/
│       └── index.html             # Main application template
├── config.py                      # Configuration settings
├── start.py                       # Unified startup script
├── blackjack.spec                # PyInstaller configuration
├── build.bat                     # Windows build script
├── deploy.sh                     # One-click deployment
└── requirements.txt              # Python dependencies
```

### Key Algorithms

1. **Expected Value Calculation**
   - Monte Carlo simulation with 10,000+ iterations
   - Considers remaining deck composition
   - Adjusts for true count advantage

2. **Action Evaluation**
   - **Hit**: Simulates drawing cards until optimal stopping point
   - **Stand**: Evaluates current hand vs dealer probabilities
   - **Double**: Calculates EV with doubled bet and one card
   - **Split**: Analyzes splitting pairs into separate hands

3. **Count Integration**
   - Positive counts favor aggressive play
   - Negative counts favor conservative strategy
   - Dynamic adjustment based on count magnitude

## 🧮 Mathematical Foundations

### Key Formulas

#### Expected Value (EV)
```
EV = Σ(Probability × Outcome)
```

#### Kelly Criterion (Optimal Bet Sizing)
```
f = (bp - q) / b
where:
- f = fraction of bankroll to bet
- b = odds received
- p = probability of winning
- q = probability of losing
```

#### True Count Calculation
```
True Count = Running Count / Decks Remaining
```

## ⚙️ Advanced Features

### Monte Carlo Simulation
- Simulates thousands of hands for each decision
- Accounts for deck composition changes
- Provides statistically significant results

### Confidence Scoring
- Measures certainty of optimal decision
- Based on EV difference between best options
- Helps identify marginal situations

### Dynamic Count Adjustment
- Modifies basic strategy based on count
- Increases aggression with positive counts
- Promotes conservative play with negative counts

## 🚀 Performance Optimizations

- **Vectorized Calculations**: NumPy for fast mathematical operations
- **Cached Results**: Memoization for repeated calculations
- **Async Processing**: Non-blocking API responses
- **Efficient Algorithms**: Optimized simulation loops

## 🎮 Modern UI Features

- **Glassmorphism Design**: Modern, professional appearance
- **Responsive Layout**: Works on desktop and mobile
- **Real-time Animations**: Smooth transitions and effects
- **Color-coded Feedback**: Intuitive visual indicators
- **Bilingual Support**: German/English interface

## ⚠️ Responsible Gaming

This tool is designed for:
- **Educational purposes**
- **Mathematical analysis**
- **Strategy learning**
- **Probability understanding**

> **Important**: Card counting is legal but may be prohibited by casinos. Use responsibly and within legal boundaries.

## 🤝 Contributing

We welcome contributions! Here's how to get started:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Mathematical foundations based on professional Blackjack literature
- UI inspired by luxury timepiece design
- Monte Carlo methods from statistical analysis research

---

**Built with ❤️ for mathematical precision and professional gaming analysis**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub stars](https://img.shields.io/github/stars/nikolaini-byte/blackjack-card-counter?style=social)](https://github.com/nikolaini-byte/blackjack-card-counter/stargazers)
[![GitHub issues](https://img.shields.io/github/issues/nikolaini-byte/blackjack-card-counter)](https://github.com/nikolaini-byte/blackjack-card-counter/issues)
