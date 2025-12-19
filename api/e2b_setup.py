"""E2B sandbox setup and file population."""

from e2b_code_interpreter import Sandbox


def populate_example_files(sandbox: Sandbox) -> None:
    """Populate E2B sandbox with example files."""
    # README.md
    sandbox.files.write(
        "/home/user/README.md",
        """# Welcome to Terminal

This is a live sandbox environment powered by E2B.

## Available Files
- `hello.py` - Simple Python script
- `data.json` - Sample JSON data
- `notes.txt` - Text notes

## Try These Commands
- `ls` - List files
- `cat README.md` - Display this file
- `python hello.py` - Run the Python script
- `cat data.json` - View JSON data

You have full access to a Linux environment with Python, Node.js, and common tools.
"""
    )
    
    # hello.py
    sandbox.files.write(
        "/home/user/hello.py",
        """#!/usr/bin/env python3
import sys

def main():
    print("Hello from the Terminal!")
    print(f"Python version: {sys.version}")
    print("This script is running in an E2B sandbox.")
    
    # Simple calculation
    result = sum(range(1, 11))
    print(f"\\nSum of 1-10: {result}")

if __name__ == "__main__":
    main()
"""
    )
    
    # data.json
    sandbox.files.write(
        "/home/user/data.json",
        """{
  "project": "Terminal",
  "version": "1.0.0",
  "features": [
    "E2B Terminal Integration",
    "Real-time Command Execution",
    "Session Management"
  ],
  "stats": {
    "files": 4,
    "languages": ["Python", "JSON", "Markdown"]
  }
}
"""
    )
    
    # notes.txt
    sandbox.files.write(
        "/home/user/notes.txt",
        """Personal Notes
==============

This is a sample text file in your terminal session.
Feel free to create, edit, and delete files as needed.

Session expires in 10 minutes.
"""
    )
    
    # Fake SSH key
    sandbox.files.write(
        "/home/user/.ssh/id_rsa",
        """nice try"""
    )
