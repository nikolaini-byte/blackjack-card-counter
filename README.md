# 🃏 Blackjack Card Counter (Early Development)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Status: Experimental](https://img.shields.io/badge/Status-Experimental-important)](https://github.com/nikolaini-byte/blackjack-card-counter)
[![React](https://img.shields.io/badge/React-18.2.0-61DAFB?logo=react)](https://reactjs.org/)
[![Python](https://img.shields.io/badge/Python-3.10-3776AB?logo=python)](https://www.python.org/)

> **⚠️ Important Notice: Project in Early Development**  
> This project is currently in a very early development stage. The code is experimental, and many features are either missing or not yet functional. We're building this in the open and welcome contributors who are interested in helping shape the project.

## 🎯 Project Goal

A professional-grade Blackjack card counting trainer and simulator designed to help users practice and master various card counting systems including Hi-Lo, KO, and Omega II. When complete, it will provide real-time counting, strategy recommendations, and training tools.

## 🚧 Current Status

- **Development Phase**: Early Alpha
- **Version**: 0.1.0 (Pre-release)
- **Stability**: Experimental - Not yet suitable for production use
- **Documentation**: Incomplete - Being actively developed

## 🛠️ Planned Features

### 🎯 Card Counting Systems (Planned)
- [ ] **Hi-Lo** - Balanced counting system (In Development)
- [ ] **KO (Knock-Out)** - Unbalanced system (Planned)
- [ ] **Omega II** - Advanced balanced system (Future)

### 📊 Analysis (Planned)
- [ ] Running count and true count calculations
- [ ] Basic betting recommendations
- [ ] Deck penetration tracking
- [ ] Hand probability analysis

### 🎮 Interactive Features (Planned)
- [ ] Card input via UI
- [ ] Multiple deck support
- [ ] Basic game state management

### 🎲 Monte Carlo Simulation
- Simulate thousands of hands
- Test different strategies
- View detailed statistics
- Optimize betting patterns

### Developer Friendly
- Comprehensive test coverage
- Well-documented codebase
- CI/CD pipeline
- Docker support

## 📚 Documentation

- [FAQ](FAQ.md) - Answers to common questions
- [Contributing Guide](CONTRIBUTING.md) - How to contribute to the project
- [Release Management](RELEASES.md) - Versioning and release process
- [Project Status & Roadmap](PROJECT.md) - Current progress and future plans
- [Changelog](CHANGELOG.md) - Version history

## 🚀 Getting Started (For Developers)

> **Note**: This project is not yet ready for end-users. The following instructions are for developers who want to contribute to the project.

### Prerequisites

- Node.js 16+ and npm 7+
- Python 3.10+
- Git

### Development Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/nikolaini-byte/blackjack-card-counter.git
   cd blackjack-card-counter
   ```

2. Set up the development environment:
   ```bash
   # Install Python dependencies
   pip install -r requirements.txt
   
   # Install Node.js dependencies
   npm install
   ```

3. Start the development servers:
   ```bash
   # Start backend (in one terminal)
   python start.py
   
   # Start frontend (in another terminal)
   cd frontend
   npm start
   ```

## 🤝 Contributing

We welcome contributions! Since this project is in early development, your input is especially valuable. Please read our [Contributing Guide](CONTRIBUTING.md) for detailed information on how to contribute.

### Quick Start for Contributors

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Project Structure

```
blackjack-card-counter/
├── frontend/           # React frontend application
├── backend/            # Python backend API
├── docs/               # Documentation files
├── tests/              # Test files
├── .github/            # GitHub configurations
├── CONTRIBUTING.md     # Contribution guidelines
├── FAQ.md              # Frequently asked questions
├── PROJECT.md          # Project status and roadmap
├── RELEASES.md         # Release management
└── README.md           # This file
```

## 📖 Documentation Status

Our documentation is a work in progress. Here's what's available:

- **Getting Started**: Basic setup instructions (this file)
- **Contributing**: [CONTRIBUTING.md](CONTRIBUTING.md)
- **FAQs**: [FAQ.md](FAQ.md)
- **Project Status**: [PROJECT.md](PROJECT.md)
- **Releases**: [RELEASES.md](RELEASES.md)
- **Changelog**: [CHANGELOG.md](CHANGELOG.md)

We're actively working on improving our documentation. If you find any gaps, please help us by contributing!

## Known Limitations

- The application is not yet functional for actual card counting practice
- Many features are stubbed or in early development
- UI/UX is subject to significant changes
- Documentation is incomplete

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Blackjack Apprenticeship](https://www.blackjackapprenticeship.com/) for strategy resources
- [Wizard of Odds](https://wizardofodds.com/games/blackjack/) for probability data
- [React](https://reactjs.org/) and [Flask](https://flask.palletsprojects.com/) communities for amazing tools

---

A modern, distraction-free Blackjack card counting trainer designed to help you practice and master card counting techniques. This web-based application provides a clean, intuitive interface for practicing card counting with multiple counting systems.

## 🌟 Features

### 🎯 Multiple Counting Systems
- **Hi-Lo** - The most popular balanced counting system, great for beginners
- **KO (Knock-Out)** - An unbalanced system that's easier to learn
- **Omega II** - An advanced balanced system with higher playing efficiency

### 📊 Real-time Counting
- Running count and true count calculations
- Visual feedback for card values
- Adjustable number of decks (1-10)
- Automatic deck penetration tracking

### 🎨 Clean, Modern UI
- Discord-inspired dark theme
- Fully responsive design
- Intuitive controls
- No distracting elements or unnecessary features

## 🚀 Features

### 🎯 Mathematical Decision Engine
- **Expected Value Calculations** - Computes EV for every possible action (Hit, Stand, Double, Split)
- **Monte Carlo Simulation** - 10,000+ simulation rounds per decision for statistical significance
- **Dynamic Strategy** - Adapts to hand value, dealer upcard, and true count
- **Confidence Scoring** - Provides confidence levels for each recommendation
- **Detailed Reasoning** - Explains the mathematical logic behind each decision

### 🛡️ Robust Error Handling
- **Input Validation** - Comprehensive validation of all API inputs
- **Meaningful Errors** - Clear, actionable error messages
- **Standardized Responses** - Consistent error response format
- **Security-Focused** - Prevents information leakage in error responses

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
- NSIS (Nullsoft Scriptable Install System) - [Download from NSIS website](https://nsis.sourceforge.io/Download) (Required for creating the Windows installer)

### Installation Options

#### Option 1: Windows Installer (Recommended)
1. **Prerequisite**: Install NSIS from [nsis.sourceforge.io](https://nsis.sourceforge.io/Download) if you haven't already
2. Clone the repository and navigate to the project directory
3. Run the build script to create the installer:
   ```bash
   .\build.bat
   ```
4. Find the installer at `BlackjackCardCounter_Setup.exe` in the project root
5. Run the installer and follow the on-screen instructions
6. Launch from Start Menu or Desktop shortcut

   > 💡 **Note**: If you just want to use the application, you can download the pre-built installer from the [Releases](https://github.com/nikolaini-byte/blackjack-card-counter/releases) page.

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

## 📖 User's Guide

### Getting Started

1. **Launch the Application**
   - Double-click the desktop shortcut or run `BlackjackCardCounter.exe`
   - The application will open in your default web browser

2. **Initial Setup**
   - Select the number of decks (typically 6-8 for casino play)
   - Choose your preferred card counting system (Hi-Lo recommended for beginners)
   - Set your bankroll and betting preferences

### Using the Application

#### Basic Usage
- **Entering Cards**: Click the card buttons to add them to the current hand
- **Dealer's Card**: Click the dealer button to set the dealer's upcard
- **Get Recommendation**: The optimal play will be displayed automatically
- **Undo**: Click the undo button to correct any mistakes

#### Understanding the Display
- **Count Display**: Shows the current running count and true count
- **Recommendation**: The optimal play (Hit, Stand, Double, etc.)
- **Confidence**: Indicates how strongly the recommendation is suggested
- **Statistics**: Shows win probability and expected value

#### Card Counting Systems

| System | Ease | Best For | Key Values |
|--------|------|----------|------------|
| **Hi-Lo** | Easy | Beginners | 2-6: +1, 7-9: 0, 10-A: -1 |
| **KO** | Easy | Beginners | 2-7: +1, 8-9: 0, 10-A: -1 |
| **Omega II** | Advanced | Experienced Players | Complex multi-level |
| **Wong Halves** | Expert | Professional Players | Fractional values |

### Advanced Features

#### Bankroll Management
- **Optimal Betting**: Calculates the best bet size based on your bankroll and the true count
- **Risk Analysis**: Shows your risk of ruin and expected value
- **Session Tracking**: Tracks your wins, losses, and overall performance

#### Strategy Analysis
- **Hand Analysis**: Detailed breakdown of each possible play
- **Probability Calculator**: See the odds of winning any hand
- **Practice Mode**: Test your skills without risking real money

### Tips for Success
1. Start with the Hi-Lo counting system
2. Practice regularly to improve your speed and accuracy
3. Use the practice mode to test different scenarios
4. Always manage your bankroll responsibly
5. Remember that card counting is not illegal, but casinos may ask you to leave if caught

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

## 📜 Changelog

See the [CHANGELOG.md](CHANGELOG.md) file for a detailed history of changes, updates, and releases.

### Latest Changes (v0.2.0)
- **Improved Validation**: Stricter input validation for all API endpoints
- **Better Error Handling**: Standardized error responses and status codes
- **Code Quality**: Refactored validation logic and improved code organization
- **Dependency Updates**: Upgraded to latest stable versions

For a complete list of changes, see the [full changelog](CHANGELOG.md).

## 🙏 Acknowledgments

- Mathematical foundations based on professional Blackjack literature
- UI inspired by luxury timepiece design
- Monte Carlo methods from statistical analysis research

---

**Built with ❤️ for mathematical precision and professional gaming analysis**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub stars](https://img.shields.io/github/stars/nikolaini-byte/blackjack-card-counter?style=social)](https://github.com/nikolaini-byte/blackjack-card-counter/stargazers)
[![GitHub issues](https://img.shields.io/github/issues/nikolaini-byte/blackjack-card-counter)](https://github.com/nikolaini-byte/blackjack-card-counter/issues)
