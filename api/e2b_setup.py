"""E2B sandbox setup and file population."""

from e2b_code_interpreter import Sandbox


def populate_example_files(sandbox: Sandbox) -> None:
    """Populate E2B sandbox with example files."""
    
    # nowplaying script
    sandbox.files.write(
        "/home/user/nowplaying",
        '''#!/bin/bash
# Fetch the last scrobbled song from Last.fm via braelyn.ai API

API_URL="https://braelyn.ai/api/lastfm/now-playing"

response=$(curl -s "$API_URL")

if echo "$response" | grep -q '"detail"'; then
    echo "Error fetching now playing data"
    exit 1
fi

artist=$(echo "$response" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['artist'])")
track=$(echo "$response" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['track'])")
album=$(echo "$response" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['album'])")
now_playing=$(echo "$response" | python3 -c "import sys,json; d=json.load(sys.stdin); print('🎵 NOW PLAYING' if d['now_playing'] else '🎧 LAST PLAYED')")

echo ""
echo "$now_playing"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎤 $artist"
echo "🎶 $track"
echo "💿 $album"
echo ""
'''
    )
    sandbox.commands.run("chmod +x /home/user/nowplaying")
    
    # README.md
    sandbox.files.write(
        "/home/user/README.md",
        """# Welcome to my terminal

This is a live terminal powered by E2B. You can do anything you want in here.

## Available Files
- `hello.py` - Simple Python script
- `data.json` - Sample JSON data
- `notes.txt` - Text notes

## Try These Commands
- `ls` - List files
- `cat README.md` - Display this file
- `python hello.py` - Run the Python script
- `cat data.json` - View JSON data
- `./nowplaying` - See what Braelyn is listening to on Last.fm!

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
