"""
Pytest configuration and fixtures for Blackjack API tests.
"""
import sys
from pathlib import Path

# Add the project root to the Python path
project_root = str(Path(__file__).parent)
sys.path.insert(0, project_root)

# Add the src directory to the Python path
src_path = str(Path(__file__).parent.parent / "src")
sys.path.insert(0, src_path)
