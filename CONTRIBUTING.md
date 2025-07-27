# 👋 Welcome Contributors!

🎉 **Thank you for your interest in contributing to the Blackjack Card Counter project!** 🎉

We're thrilled you're here and excited to have you join our community. Whether you're a seasoned developer or just starting out, there are many ways to contribute, from writing code to improving documentation, reporting bugs, or suggesting new features.

### 💬 Get in Touch
- **Contact**: Feel free to PM me (nightwing09) with any questions
- **Issues**: Check out our [open issues](https://github.com/nikolaini-byte/blackjack-card-counter/issues)
- **Discussion**: Start a [discussion](https://github.com/nikolaini-byte/blackjack-card-counter/discussions)

### 🌟 First Time Contributors
New to open source? We've got you covered! Look for issues labeled `good first issue` to get started. These are perfect for your first contribution.

### 🏆 Recognition
All contributions are valued and recognized. Your name will be added to our contributors list, and you'll receive credit for your work in our release notes.

## 📋 Table of Contents
1. [Welcome!](#-welcome-contributors)
2. [Code of Conduct](#code-of-conduct)
3. [Getting Started](#-getting-started)
4. [Development Workflow](#-development-workflow)
5. [Pull Request Process](#-pull-request-process)
6. [Code Style](#-code-style)
7. [Testing](#-testing)
8. [Documentation](#-documentation)
9. [Reporting Issues](#-reporting-issues)
10. [Feature Requests](#-feature-requests)
11. [Code Review Process](#-code-review-process)
12. [Community & Support](#-community--support)

## 📜 Code of Conduct

This project and everyone participating in it is governed by our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ and npm 7+
- Python 3.10+
- Git

### Setup
1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/your-username/blackjack-card-counter.git
   cd blackjack-card-counter
   ```
3. Set up the development environment:
   ```bash
   # Install Python dependencies
   pip install -r requirements.txt
   
   # Install Node.js dependencies
   npm install
   ```
4. Start the development servers:
   ```bash
   # Backend
   python start.py
   
   # Frontend (in a new terminal)
   cd frontend
   npm start
   ```

## 🔄 Development Workflow

### Branch Strategy
We use a simplified Git Flow approach:
- `main` - Stable, production-ready code
- `develop` - Integration branch for features
- `feature/*` - New features (e.g., `feature/card-counting`)
- `bugfix/*` - Bug fixes (e.g., `bugfix/count-calculation`)
- `docs/*` - Documentation improvements

### Commit Messages
Follow [Conventional Commits](https://www.conventionalcommits.org/):
```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**Types**:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code changes that neither fixes a bug nor adds a feature
- `test`: Adding missing tests or correcting existing tests
- `chore`: Changes to the build process or auxiliary tools

## 🔄 Pull Request Process

1. **Create a Feature Branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```

2. **Make Your Changes**
   - Follow the code style
   - Add/update tests
   - Update documentation

3. **Run Tests**
   ```bash
   # Run all tests
   npm test
   
   # Run specific test
   npm test -- TestName
   ```

4. **Commit Your Changes**
   ```bash
   git add .
   git commit -m "feat(counter): implement basic card counting"
   ```

5. **Push to Your Fork**
   ```bash
   git push origin feature/amazing-feature
   ```

6. **Open a Pull Request**
   - Target the `develop` branch
   - Fill out the PR template
   - Reference any related issues

## 🎨 Code Style

### Frontend (React/TypeScript)
- Follow [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript)
- Use TypeScript for all new code
- Prefer functional components with hooks
- Use Tailwind CSS for styling

### Backend (Python/Flask)
- Follow [PEP 8](https://www.python.org/dev/peps/pep-0008/)
- Use type hints for all new code
- Keep functions small and focused

## 🧪 Testing

### Frontend Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run coverage
npm run test:coverage
```

### Backend Tests
```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=src tests/
```

## 📚 Documentation

- Update documentation when adding new features
- Keep code comments clear and concise
- Document complex algorithms
- Update README.md for significant changes

## 🐛 Reporting Issues

1. Check if the issue already exists
2. Use the issue template
3. Include:
   - Clear title and description
   - Steps to reproduce
   - Expected vs. actual behavior
   - Screenshots if applicable
   - Browser/OS version

## ✨ Feature Requests

1. Check if the feature was already requested
2. Use the feature request template
3. Explain:
   - The problem you're trying to solve
   - Proposed solution
   - Alternatives considered
   - Additional context

## 👀 Code Review Process

1. **Automated Checks**: CI runs tests and linters
2. **Initial Review**: At least one maintainer will review your PR
3. **Feedback**: You'll receive constructive feedback
4. **Iterate**: Make necessary changes based on feedback
5. **Approval**: Once approved, a maintainer will merge your PR

We aim to review all PRs within 3 business days. If it's been longer, feel free to ping us!

## 💖 Community & Support

### Get in Touch
- **PM**: You can reach out to me (nightwing09) directly via PM
- **Issues**: Use GitHub issues for technical discussions
- **Contributions**: All contributions are welcome and appreciated!

### Need Help?
- Check our [FAQ](FAQ.md)
- Search existing [issues](https://github.com/nikolaini-byte/blackjack-card-counter/issues)
- Start a new [discussion](https://github.com/nikolaini-byte/blackjack-card-counter/discussions)
- Send me a PM (nightwing09)

## 🙏 Thank You!

Your contributions help make this project better for everyone. Whether you're fixing typos, implementing features, or helping other contributors, we appreciate your time and effort! 🎉

---
*Last updated: July 28, 2025*

---
*Last updated: July 28, 2025*
