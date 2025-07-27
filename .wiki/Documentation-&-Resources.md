# Documentation & Resources

## 📚 Official Documentation

### Core Documents

- [Project Overview](Project-Overview) - Introduction to the project
- [Installation Guide](#installation) - Setup instructions
- [User Guide](#user-guide) - How to use the application
- [Developer Documentation](#developer-documentation) - Technical details for developers
- [API Reference](Architecture-&-Technology#api-reference) - Detailed API documentation

### Project Management

- [Roadmap](Roadmap) - Planned features and milestones
- [Current Status](Current-Status) - Current development progress
- [Contributing](Contributing-&-Community) - Guide for contributors
- [Code of Conduct](https://github.com/nikolaini-byte/blackjack-card-counter/blob/main/CODE_OF_CONDUCT.md) - Our community guidelines

## 🛠️ Installation

### Prerequisites

- Node.js 16 or higher
- Python 3.10 or higher
- Git
- npm or yarn

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/nikolaini-byte/blackjack-card-counter.git
   cd blackjack-card-counter
   ```

2. **Setup Backend**
   ```bash
   cd src
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

3. **Setup Frontend**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Run the Application**
   ```bash
   # In one terminal (backend)
   cd src
   uvicorn main:app --reload
   
   # In another terminal (frontend)
   cd frontend
   npm run dev
   ```

5. **Access the Application**
   Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📖 User Guide

### Getting Started

1. **Create an Account**
   - Click "Sign Up" and fill in your details
   - Verify your email address
   - Log in to your account

2. **Start a New Game**
   - Select a counting system (Hi-Lo, KO, Omega II)
   - Choose number of decks
   - Click "Start Game"

3. **Game Interface**
   - **Card Table**: Shows the current game state
   - **Controls**: Hit, Stand, Double Down, etc.
   - **Count Display**: Shows current running and true counts
   - **Statistics**: Tracks your performance

### Advanced Features

- **Strategy Trainer**: Practice basic strategy
- **Custom Rules**: Adjust game rules
- **Session Analysis**: Review your performance

## 🧑‍💻 Developer Documentation

### Project Structure

```
blackjack-card-counter/
├── frontend/          # Frontend (React)
├── src/               # Backend (Python/FastAPI)
├── tests/             # Test suites
├── docs/              # Documentation
└── scripts/           # Utility scripts
```

### API Documentation

Once the backend is running, access the interactive API documentation at:
- Swagger UI: [http://localhost:8000/docs](http://localhost:8000/docs)
- ReDoc: [http://localhost:8000/redoc](http://localhost:8000/redoc)

### Testing

Run the test suite:

```bash
# Backend tests
cd src
pytest

# Frontend tests
cd ../frontend
npm test
```

## 📚 Additional Resources

### Blackjack Resources

- [Blackjack Rules](https://bicyclecards.com/how-to-play/blackjack/)
- [Basic Strategy Chart](https://www.blackjackapprenticeship.com/blackjack-strategy-charts/)
- [Card Counting Guide](https://www.blackjackapprenticeship.com/card-counting/)

### Technology Stack

- [React Documentation](https://reactjs.org/docs/getting-started.html)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## 📚 Learning Resources

### For Beginners

- [Learn React](https://reactjs.org/tutorial/tutorial.html)
- [Python for Beginners](https://www.python.org/about/gettingstarted/)
- [GitHub Guides](https://guides.github.com/)

### Advanced Topics

- [Advanced React Patterns](https://kentcdodds.com/blog/advanced-react-patterns)
- [Clean Code in Python](https://realpython.com/python-clean-code/)
- [System Design Primer](https://github.com/donnemartin/system-design-primer)

## 🛠️ Tools & Extensions

### Recommended Development Tools

- **Code Editor**: [VS Code](https://code.visualstudio.com/)
- **Terminal**: [iTerm2](https://iterm2.com/) (macOS), [Windows Terminal](https://aka.ms/terminal)
- **Version Control**: [GitHub Desktop](https://desktop.github.com/)
- **API Testing**: [Postman](https://www.postman.com/)

### VS Code Extensions

- **Python**: For Python development
- **ESLint**: JavaScript/TypeScript linting
- **Prettier**: Code formatting
- **GitLens**: Git supercharged
- **Docker**: For containerization

## 📝 Documentation Maintenance

This documentation is maintained as part of the project. To update the documentation:

1. Edit the appropriate `.md` files in the `.wiki` directory
2. Test your changes locally
3. Submit a pull request with your updates

## 🤝 Acknowledgments

Special thanks to all contributors and the open-source community for their valuable input and support.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](https://github.com/nikolaini-byte/blackjack-card-counter/blob/main/LICENSE) file for details.

## 📬 Contact

For questions or support, please PM me (nightwing09) or open an issue on GitHub.
