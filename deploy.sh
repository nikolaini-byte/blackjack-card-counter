#!/bin/bash

# Deployment script for Blackjack Card Counter
# This script builds and deploys the application

set -e  # Exit on error

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to display usage
usage() {
    echo "Usage: $0 [options]"
    echo "Options:"
    echo "  -h, --help      Show this help message"
    echo "  -p, --prod      Production deployment (minifies, optimizes, etc.)"
    echo "  -t, --test      Run tests before deployment"
    echo "  -c, --ci        Run in CI mode (non-interactive)"
    exit 1
}

# Parse command line arguments
PROD=false
TEST=false
CI_MODE=false

while [[ $# -gt 0 ]]; do
    key="$1"
    case $key in
        -p|--prod)
        PROD=true
        shift
        ;;
        -t|--test)
        TEST=true
        shift
        ;;
        -c|--ci)
        CI_MODE=true
        shift
        ;;
        -h|--help)
        usage
        ;;
        *)
        echo "Unknown option: $1"
        usage
        ;;
    esac
done

echo -e "${GREEN}🚀 Starting Blackjack Card Counter deployment${NC}"

# Check for required tools
check_requirements() {
    echo -e "${YELLOW}🔍 Checking system requirements...${NC}"
    
    # Check for Node.js and npm
    if ! command -v node &> /dev/null || ! command -v npm &> /dev/null; then
        echo -e "❌ Node.js and npm are required but not installed. Please install them first."
        exit 1
    fi
    
    # Check for Python
    if ! command -v python3 &> /dev/null; then
        echo -e "❌ Python 3 is required but not installed. Please install it first."
        exit 1
    fi
    
    # Check for pip
    if ! command -v pip3 &> /dev/null; then
        echo -e "❌ pip3 is required but not installed. Please install it first."
        exit 1
    fi
    
    echo -e "✅ All requirements are satisfied"
}

# Install Python dependencies
install_python_deps() {
    echo -e "\n${YELLOW}📦 Installing Python dependencies...${NC}"
    
    # Create and activate virtual environment
    if [ ! -d "venv" ]; then
        python3 -m venv venv
    fi
    
    # Activate virtual environment
    if [ "$CI_MODE" = false ]; then
        source venv/bin/activate
    else
        source venv/bin/activate
    fi
    
    # Upgrade pip and install requirements
    pip install --upgrade pip
    
    if [ "$PROD" = true ]; then
        pip install -r requirements.txt
    else
        pip install -r requirements-dev.txt
    fi
    
    echo -e "✅ Python dependencies installed"
}

# Install frontend dependencies
install_frontend_deps() {
    echo -e "\n${YELLOW}📦 Installing frontend dependencies...${NC}"
    cd frontend
    
    # Clean install of dependencies
    npm ci
    
    cd ..
    echo -e "✅ Frontend dependencies installed"
}

# Run tests
run_tests() {
    if [ "$TEST" = true ]; then
        echo -e "\n${YELLOW}🧪 Running tests...${NC}"
        
        # Run backend tests
        echo -e "\n${YELLOW}🔧 Running backend tests...${NC}"
        python -m pytest tests/ -v --cov=src --cov-report=xml
        
        # Run frontend tests
        echo -e "\n${YELLOW}🎨 Running frontend tests...${NC}"
        cd frontend
        npm test -- --coverage --watchAll=false
        cd ..
        
        echo -e "✅ All tests passed"
    fi
}

# Build frontend
build_frontend() {
    echo -e "\n${YELLOW}🏗️  Building frontend...${NC}"
    cd frontend
    
    # Set environment variables
    if [ "$PROD" = true ]; then
        export NODE_ENV=production
        echo -e "Building for production..."
    else
        export NODE_ENV=development
        echo -e "Building for development..."
    fi
    
    # Install dependencies and build
    npm run build
    
    cd ..
    echo -e "✅ Frontend built successfully"
}

# Build backend
build_backend() {
    echo -e "\n${YELLOW}🔧 Building backend...${NC}"
    
    # Create necessary directories
    mkdir -p dist
    
    # Copy backend files
    cp -r src dist/
    cp -r config dist/
    cp -r static dist/
    cp -r templates dist/
    cp *.py dist/
    cp requirements.txt dist/
    
    # Remove test and development files
    find dist -name "__pycache__" -exec rm -rf {} +
    find dist -name "*.pyc" -delete
    find dist -name "*.pyo" -delete
    find dist -name "*.pyd" -delete
    
    echo -e "✅ Backend built successfully"
}

# Package the application
package() {
    echo -e "\n${YELLOW}📦 Packaging application...${NC}"
    
    # Create distribution directory
    rm -rf dist_package
    mkdir -p dist_package
    
    # Copy frontend build
    cp -r frontend/build dist_package/static
    
    # Copy backend
    cp -r dist/* dist_package/
    
    # Copy configuration files
    cp README.md dist_package/
    cp CHANGELOG.md dist_package/
    cp LICENSE dist_package/
    
    # Create a simple run script
    cat > dist_package/run.sh << 'EOF'
#!/bin/bash
# Run the Blackjack Card Counter application

echo "Starting Blackjack Card Counter..."
python3 app.py
EOF
    
    chmod +x dist_package/run.sh
    
    # Create a simple start script for Windows
    cat > dist_package/start.bat << 'EOF'
@echo off
echo Starting Blackjack Card Counter...
python app.py
pause
EOF
    
    echo -e "✅ Application packaged successfully"
    echo -e "\n${GREEN}🎉 Deployment completed successfully!${NC}"
    echo -e "\nTo run the application:"
    echo -e "1. Navigate to the dist_package directory"
    echo -e "2. Run: ./run.sh (Linux/Mac) or start.bat (Windows)"
    echo -e "3. Open http://localhost:5000 in your browser"
}

# Main execution
main() {
    check_requirements
    install_python_deps
    install_frontend_deps
    run_tests
    build_frontend
    build_backend
    package
}

# Run the main function
main
