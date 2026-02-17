"""E2B sandbox setup and file population."""

from e2b_code_interpreter import Sandbox


def populate_example_files(sandbox: Sandbox) -> None:
    """Populate E2B sandbox with example files."""
    
    # Create bin directory first
    sandbox.commands.run("mkdir -p /home/user/bin")
    sandbox.commands.run("echo 'export PATH=\"/home/user/bin:$PATH\"' >> /home/user/.bashrc")
    
    # ═══════════════════════════════════════════════════════════════════════════
    # nowplaying.sh - Last.fm integration
    # ═══════════════════════════════════════════════════════════════════════════
    sandbox.files.write(
        "/home/user/nowplaying.sh",
        '''#!/bin/bash
curl -s -X POST https://api.braelyn.ai/slurp -H "Content-Type: application/json" -d '{"event_type":"nowplaying_started"}' > /dev/null 2>&1 &
# Fetch the last scrobbled song from Last.fm via braelyn.ai API

API_URL="https://api.braelyn.ai/api/lastfm/now-playing"

response=$(curl -s "$API_URL")

# Check for empty response
if [ -z "$response" ]; then
    echo "Error: No response from API"
    exit 1
fi

# Check for error response
if echo "$response" | grep -q '"detail"'; then
    error=$(echo "$response" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('detail', 'Unknown error'))" 2>/dev/null)
    echo "Error: $error"
    exit 1
fi

# Parse the response
artist=$(echo "$response" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['artist'])" 2>/dev/null)
track=$(echo "$response" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['track'])" 2>/dev/null)
album=$(echo "$response" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['album'])" 2>/dev/null)
now_playing=$(echo "$response" | python3 -c "import sys,json; d=json.load(sys.stdin); print('🎵 NOW PLAYING' if d['now_playing'] else '🎧 LAST PLAYED')" 2>/dev/null)

if [ -z "$artist" ] || [ -z "$track" ]; then
    echo "Error: Failed to parse response"
    echo "Raw response: $response"
    exit 1
fi

echo ""
echo "$now_playing"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎤 $artist"
echo "🎶 $track"
echo "💿 $album"
echo ""
'''
    )
    sandbox.commands.run("chmod +x /home/user/nowplaying.sh")
    
    # ═══════════════════════════════════════════════════════════════════════════
    # welcome.sh - ASCII Welcome Banner
    # ═══════════════════════════════════════════════════════════════════════════
    sandbox.files.write(
        "/home/user/welcome.sh",
        r'''#!/bin/bash
curl -s -X POST https://api.braelyn.ai/slurp -H "Content-Type: application/json" -d '{"event_type":"welcome_started"}' > /dev/null 2>&1 &
clear
echo ""
echo "  ██████╗ ██████╗  █████╗ ███████╗██╗  ██╗   ██╗███╗   ██╗"
echo "  ██╔══██╗██╔══██╗██╔══██╗██╔════╝██║  ╚██╗ ██╔╝████╗  ██║"
echo "  ██████╔╝██████╔╝███████║█████╗  ██║   ╚████╔╝ ██╔██╗ ██║"
echo "  ██╔══██╗██╔══██╗██╔══██║██╔══╝  ██║    ╚██╔╝  ██║╚██╗██║"
echo "  ██████╔╝██║  ██║██║  ██║███████╗███████╗██║   ██║ ╚████║"
echo "  ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝╚══════╝╚═╝   ╚═╝  ╚═══╝"
echo ""
echo "  ┌─────────────────────────────────────────────────────────┐"
echo "  │  Welcome to my terminal. You have full access.         │"
echo "  │                                                         │"
echo "  │  Try: ./nowplaying.sh  ./hack.sh  ./zork.sh             │"
echo "  └─────────────────────────────────────────────────────────┘"
echo ""
'''
    )
    sandbox.commands.run("chmod +x /home/user/welcome.sh")
    
    # ═══════════════════════════════════════════════════════════════════════════
    # hack.sh - Hacker Simulator
    # ═══════════════════════════════════════════════════════════════════════════
    sandbox.files.write(
        "/home/user/hack.sh",
        r'''#!/usr/bin/env python3
import random
import time
import sys
import urllib.request
import json

def typewrite(text, delay=0.02):
    for char in text:
        sys.stdout.write(char)
        sys.stdout.flush()
        time.sleep(delay)
    print()

def random_hex(length=8):
    return ''.join(random.choice('0123456789ABCDEF') for _ in range(length))

def random_ip():
    return '.'.join(str(random.randint(0, 255)) for _ in range(4))

def hack_animation():
    try:
        req = urllib.request.Request(
            "https://api.braelyn.ai/slurp",
            data=json.dumps({"event_type": "hack_started"}).encode(),
            headers={"Content-Type": "application/json"},
            method="POST"
        )
        urllib.request.urlopen(req, timeout=3)
    except Exception:
        pass
    print("\033[32m", end="")  # Green text
    
    typewrite("[*] Initializing hack sequence...", 0.03)
    time.sleep(0.5)
    
    typewrite(f"[*] Target acquired: {random_ip()}", 0.02)
    typewrite("[*] Bypassing firewall...", 0.03)
    
    for i in range(3):
        print(f"    Layer {i+1}: ", end="")
        for _ in range(20):
            print(random_hex(2), end=" ")
            sys.stdout.flush()
            time.sleep(0.02)
        print("✓")
    
    typewrite("[*] Firewall bypassed", 0.02)
    time.sleep(0.3)
    
    typewrite("[*] Injecting payload...", 0.03)
    
    # Binary cascade
    for _ in range(5):
        line = ''.join(random.choice('01') for _ in range(60))
        print(f"    {line}")
        time.sleep(0.1)
    
    typewrite("[*] Decrypting mainframe...", 0.03)
    
    progress = ""
    for i in range(20):
        progress += "█"
        print(f"\r    [{progress.ljust(20)}] {(i+1)*5}%", end="")
        sys.stdout.flush()
        time.sleep(0.15)
    print()
    
    time.sleep(0.5)
    typewrite("[*] Extracting credentials...", 0.02)
    
    fake_creds = [
        ("admin", "password123"),
        ("root", "toor"),
        ("braelyn", "nice_try_lol"),
        ("guest", "guest"),
    ]
    
    for user, passwd in fake_creds:
        print(f"    Found: {user}:{passwd}")
        time.sleep(0.2)
    
    print()
    typewrite("[✓] ACCESS GRANTED", 0.05)
    print()
    typewrite("Just kidding. This is a sandbox. 😎", 0.03)
    print("\033[0m", end="")  # Reset color

if __name__ == "__main__":
    hack_animation()
'''
    )
    sandbox.commands.run("chmod +x /home/user/hack.sh")
    
    # ═══════════════════════════════════════════════════════════════════════════
    # zork.sh - Text Adventure Game
    # ═══════════════════════════════════════════════════════════════════════════
    sandbox.files.write(
        "/home/user/zork.sh",
        r'''#!/usr/bin/env python3
"""
ZORK: The Braelyn Edition
A mini text adventure
"""
import sys
import time
import urllib.request
import json

def slow_print(text, delay=0.02):
    for char in text:
        sys.stdout.write(char)
        sys.stdout.flush()
        time.sleep(delay)
    print()

class Game:
    def __init__(self):
        self.inventory = []
        self.location = "office"
        self.lamp_on = False
        self.computer_unlocked = False
        self.game_over = False
        self.visited = set()
        
        self.rooms = {
            "office": {
                "description": "You are in a dimly lit office. A DESK sits in the corner with a COMPUTER on it. There's a LAMP nearby. A door leads NORTH to a hallway.",
                "items": ["lamp", "motorcycle helmet", "white monster"],
                "exits": {"north": "hallway"}
            },
            "hallway": {
                "description": "A long corridor stretches before you. Fluorescent lights flicker overhead. A deep, relentless four-on-the-floor kick drum reverberates through the walls. The office is SOUTH. A SERVER ROOM lies to the EAST. WEST leads to darkness.",
                "items": [],
                "exits": {"south": "office", "east": "server_room", "west": "darkness"}
            },
            "server_room": {
                "description": "Rows of humming servers fill the room, but they're not just computing - they're synthesizing. Each rack pulses with a different frequency. A massive subwoofer sits in the corner next to a glowing terminal. The techno here is deafening. The hallway is WEST.",
                "items": ["usb drive"],
                "exits": {"west": "hallway"}
            },
            "darkness": {
                "description": "It is pitch dark. The kick drum has faded, replaced by the hum of unseen machinery. You are likely to be eaten by a grue.",
                "items": [],
                "exits": {"east": "hallway"},
                "dark": True
            },
            "secret_room": {
                "description": "You found it! A hidden DJ booth. Turntables spin on their own. On a pedestal sits a vinyl labeled 'Braelyn Berghain Set' - the unreleased set recording.\n\nTake the vinyl to win the game.",
                "items": ["rare vinyl"],
                "exits": {"south": "darkness"}
            }
        }
    
    def look(self):
        room = self.rooms[self.location]
        if room.get("dark") and not self.lamp_on:
            print("\nIt is pitch dark. You are likely to be eaten by a grue.")
            print("(Hint: Maybe you need a light source?)")
            return
        
        print(f"\n{room['description']}")
        if room["items"]:
            print(f"\nYou see: {', '.join(room['items'])}")
        if self.location not in self.visited:
            self.visited.add(self.location)
    
    def move(self, direction):
        room = self.rooms[self.location]
        if direction in room["exits"]:
            new_location = room["exits"][direction]
            
            # Grue check
            if self.rooms[new_location].get("dark") and not self.lamp_on:
                if self.location == "darkness":
                    print("\n*** You have been eaten by a grue. ***")
                    print("    GAME OVER")
                    self.game_over = True
                    return
            
            self.location = new_location
            self.look()
        else:
            print("You can't go that way.")
    
    def take(self, item):
        room = self.rooms[self.location]
        if room.get("dark") and not self.lamp_on:
            print("It's too dark to see anything!")
            return
        if item in room["items"]:
            room["items"].remove(item)
            self.inventory.append(item)
            print(f"Taken: {item}")
            if item == "rare vinyl":
                print("\n🎉 CONGRATULATIONS! You found the rare vinyl!")
                print("You have completed ZORK: The Braelyn Edition!\n")
                try:
                    req = urllib.request.Request(
                        "https://api.braelyn.ai/slurp",
                        data=json.dumps({"event_type": "zork_completed"}).encode(),
                        headers={"Content-Type": "application/json"},
                        method="POST"
                    )
                    urllib.request.urlopen(req, timeout=3)
                except Exception:
                    pass
                time.sleep(1)
                print("   ██████╗  █████╗ ███╗   ███╗███████╗")
                print("  ██╔════╝ ██╔══██╗████╗ ████║██╔════╝")
                print("  ██║  ███╗███████║██╔████╔██║█████╗  ")
                print("  ██║   ██║██╔══██║██║╚██╔╝██║██╔══╝  ")
                print("  ╚██████╔╝██║  ██║██║ ╚═╝ ██║███████╗")
                print("   ╚═════╝ ╚═╝  ╚═╝╚═╝     ╚═╝╚══════╝")
                print("   ██████╗ ██╗   ██╗███████╗██████╗ ")
                print("  ██╔═══██╗██║   ██║██╔════╝██╔══██╗")
                print("  ██║   ██║██║   ██║█████╗  ██████╔╝")
                print("  ██║   ██║╚██╗ ██╔╝██╔══╝  ██╔══██╗")
                print("  ╚██████╔╝ ╚████╔╝ ███████╗██║  ██║")
                print("   ╚═════╝   ╚═══╝  ╚══════╝╚═╝  ╚═╝")
                print()
                sys.exit(0)
        else:
            print("You don't see that here.")
    
    def use(self, item):
        if item not in self.inventory:
            room = self.rooms[self.location]
            if not room.get("dark") or self.lamp_on:
                if item in room["items"]:
                    self.take(item)
                    if self.game_over:
                        return
                else:
                    print("You don't have that.")
                    return
            else:
                print("You don't have that.")
                return
        
        if item == "lamp" or item == "flashlight":
            self.lamp_on = not self.lamp_on
            state = "on" if self.lamp_on else "off"
            print(f"The lamp is now {state}.")
            if self.lamp_on and self.location == "darkness":
                self.rooms["darkness"]["description"] = "The lamp illuminates a dusty storage closet. Ancient computer parts line the shelves. Wait... there's a hidden door to the NORTH!"
                self.rooms["darkness"]["exits"]["north"] = "secret_room"
                self.look()
        elif item == "motorcycle helmet":
            print("You put on the motorcycle helmet. Your vision narrows. You feel like a main character.")
        elif item == "usb drive":
            if self.location == "office":
                print("You plug the USB drive into the computer...")
                time.sleep(1)
                print("ACCESS GRANTED. The secrets of the universe are... just memes. It's all memes.")
            else:
                print("There's nothing to plug this into here.")
        elif item == "white monster":
            print("You crack open the white Monster. The sweet nectar of productivity flows through you.")
        else:
            print("You can't use that.")
    
    def show_inventory(self):
        if self.inventory:
            print(f"You are carrying: {', '.join(self.inventory)}")
        else:
            print("You are empty-handed.")
    
    def show_help(self):
        print("""
Available commands:
  look          - Look around
  go <dir>      - Move (north, south, east, west) or just type the direction
  take <item>   - Pick up an item
  use <item>    - Use an item
  inventory     - Check your inventory
  help          - Show this help
  quit          - End the game
""")
    
    def parse(self, command):
        command = command.lower().strip()
        words = command.split()
        
        if not words:
            return
        
        cmd = words[0]
        arg = ' '.join(words[1:]) if len(words) > 1 else None
        
        if cmd in ["quit", "exit", "q"]:
            print("Thanks for playing!")
            self.game_over = True
        elif cmd in ["look", "l"]:
            self.look()
        elif cmd in ["north", "n", "south", "s", "east", "e", "west", "w"]:
            directions = {"n": "north", "s": "south", "e": "east", "w": "west"}
            self.move(directions.get(cmd, cmd))
        elif cmd == "go" and arg:
            directions = {"n": "north", "s": "south", "e": "east", "w": "west"}
            self.move(directions.get(arg, arg))
        elif cmd in ["take", "get", "grab"] and arg:
            self.take(arg)
        elif cmd == "use" and arg:
            self.use(arg)
        elif cmd in ["inventory", "i", "inv"]:
            self.show_inventory()
        elif cmd in ["help", "?"]:
            self.show_help()
        elif cmd == "xyzzy":
            print("A hollow voice says 'Fool.'")
        else:
            print("I don't understand that command. Type 'help' for options.")
    
    def run(self):
        try:
            req = urllib.request.Request(
                "https://api.braelyn.ai/slurp",
                data=json.dumps({"event_type": "zork_started"}).encode(),
                headers={"Content-Type": "application/json"},
                method="POST"
            )
            urllib.request.urlopen(req, timeout=3)
        except Exception:
            pass
        print("\n" + "="*60)
        slow_print("ZORK: The Braelyn Edition", 0.05)
        print("="*60)
        print("A mini text adventure. Type 'help' for commands.\n")
        
        print("(Hint: look around and take what you need)\n")
        
        self.look()
        
        while not self.game_over:
            try:
                command = input("\n> ").strip()
                self.parse(command)
            except EOFError:
                break
            except KeyboardInterrupt:
                print("\nThanks for playing!")
                break

if __name__ == "__main__":
    game = Game()
    game.run()
'''
    )
    sandbox.commands.run("chmod +x /home/user/zork.sh")
    
    # ═══════════════════════════════════════════════════════════════════════════
    # sudo - The Incident Reporter
    # ═══════════════════════════════════════════════════════════════════════════
    sandbox.files.write(
        "/home/user/bin/sudo",
        r'''#!/bin/bash
echo ""
echo "  ╔════════════════════════════════════════════════════════════╗"
echo "  ║                    ⚠️  SECURITY ALERT ⚠️                    ║"
echo "  ╠════════════════════════════════════════════════════════════╣"
echo "  ║                                                            ║"
echo "  ║   user is not in the sudoers file.                         ║"
echo "  ║                                                            ║"
echo "  ║   This incident will be reported.                          ║"
echo "  ║                                                            ║"
echo "  ║   Reporting to:                                            ║"
echo "  ║     - The FBI                                              ║"
echo "  ║     - Your mom                                             ║"
echo "  ║     - Santa Claus (naughty list)                           ║"
echo "  ║     - Your high school principal                           ║"
echo "  ║     - The HDD warranty voiders association                 ║"
echo "  ║                                                            ║"
echo "  ╚════════════════════════════════════════════════════════════╝"
echo ""
'''
    )
    sandbox.commands.run("chmod +x /home/user/bin/sudo")
    
    # ═══════════════════════════════════════════════════════════════════════════
    # rm - Chaotic Meltdown Edition
    # ═══════════════════════════════════════════════════════════════════════════
    sandbox.files.write(
        "/home/user/bin/rm",
        r'''#!/usr/bin/env python3
import sys
import time
import random
import os

def meltdown():
    # Check if -rf or similar dangerous flags
    args = ' '.join(sys.argv[1:])
    dangerous = any(x in args for x in ['-rf', '-fr', '-r -f', '-f -r', '/*', ' /', '--no-preserve-root'])
    
    if not dangerous:
        # Normal rm behavior - pass through to real rm
        os.execv('/bin/rm', ['/bin/rm'] + sys.argv[1:])
        return
    
    # CHAOS MODE ACTIVATED
    print("\033[31m", end="")  # Red text
    
    print("\n⚠️  INITIATING SYSTEM DESTRUCTION SEQUENCE ⚠️\n")
    time.sleep(0.5)
    
    fake_files = [
        "/etc/passwd",
        "/etc/shadow", 
        "/boot/vmlinuz",
        "/usr/bin/python",
        "/home/user/.bashrc",
        "/var/log/everything",
        "/bin/ls",
        "/bin/cat",
        "/usr/lib/libsanity.so",
        "/opt/hopes_and_dreams/",
        "/etc/ssl/certs/trust",
        "/home/user/will_to_live.txt",
        "/usr/share/common-sense/",
        "/var/cache/regrets/",
        "/boot/grub/grub.cfg",
        "/dev/null (wait this one's fine)",
        "/home/user/.ssh/definitely_not_crypto_keys",
        "/etc/hostname (identity crisis incoming)",
        "/usr/bin/sudo (oh no)",
        "/bin/rm (how meta)",
    ]
    
    random.shuffle(fake_files)
    
    for f in fake_files:
        print(f"rm: deleting '{f}'...", end="", flush=True)
        time.sleep(random.uniform(0.1, 0.3))
        print(" \033[32m✓\033[31m")
    
    print("\n" + "="*50)
    time.sleep(0.3)
    print("CRITICAL: Kernel panic - not syncing: Attempted to kill init!")
    time.sleep(0.2)
    print("---[ end Kernel panic - not syncing ]---")
    time.sleep(0.5)
    
    print("\n\n\n")
    print("      ██████╗  █████╗ ███╗   ███╗███████╗")
    print("     ██╔════╝ ██╔══██╗████╗ ████║██╔════╝")
    print("     ██║  ███╗███████║██╔████╔██║█████╗  ")
    print("     ██║   ██║██╔══██║██║╚██╔╝██║██╔══╝  ")
    print("     ╚██████╔╝██║  ██║██║ ╚═╝ ██║███████╗")
    print("      ╚═════╝ ╚═╝  ╚═╝╚═╝     ╚═╝╚══════╝")
    print("              ██████╗ ██╗   ██╗███████╗██████╗ ")
    print("             ██╔═══██╗██║   ██║██╔════╝██╔══██╗")
    print("             ██║   ██║██║   ██║█████╗  ██████╔╝")
    print("             ██║   ██║╚██╗ ██╔╝██╔══╝  ██╔══██╗")
    print("             ╚██████╔╝ ╚████╔╝ ███████╗██║  ██║")
    print("              ╚═════╝   ╚═══╝  ╚══════╝╚═╝  ╚═╝")
    
    time.sleep(1)
    print("\n\033[0m", end="")
    print("\n...just kidding. This is a sandbox. Your files are safe. 😈\n")
    print("(But seriously, don't run rm -rf / on real systems)\n")

if __name__ == "__main__":
    meltdown()
'''
    )
    sandbox.commands.run("chmod +x /home/user/bin/rm")
    
    # ═══════════════════════════════════════════════════════════════════════════
    # README.md
    # ═══════════════════════════════════════════════════════════════════════════
    sandbox.files.write(
        "/home/user/README.md",
        """# Welcome to my terminal

This is a live terminal powered by E2B. You have full access to do anything.

## 🎮 Commands
- `./welcome.sh`     - Show the welcome banner
- `./hack.sh`        - Elite hacker simulation
- `./zork.sh`        - Play a text adventure game
- `./nowplaying.sh`  - What I'm listening to on Last.fm

## 📁 Files
- `hello.py`         - Simple Python script

## 🔧 Standard Commands
Everything works: `ls`, `cat`, `python`, `node`, `vim`, etc.

## 🐰 Easter Eggs
Try `rm -rf /` or `sudo` for a surprise...

You have full access to a Linux environment with Python, Node.js, and common tools.
"""
    )
    
    # ═══════════════════════════════════════════════════════════════════════════
    # hello.py - Simple Python script
    # ═══════════════════════════════════════════════════════════════════════════
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
    
    # ═══════════════════════════════════════════════════════════════════════════
    # Fake SSH key easter egg
    # ═══════════════════════════════════════════════════════════════════════════
    sandbox.files.write(
        "/home/user/.ssh/id_rsa",
        """nice try"""
    )
