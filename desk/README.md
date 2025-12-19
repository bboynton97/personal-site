# Desk - Interactive 3D Portfolio Experience

An immersive 3D desk environment built with Three.js, featuring interactive objects, post-processing effects, and a working terminal connected to a real backend.

![Three.js](https://img.shields.io/badge/Three.js-black?style=flat&logo=three.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite&logoColor=white)

## Features

### 🖥️ Interactive Terminal
Click on the computer screen to focus the terminal. Type commands that execute in a real sandboxed environment via E2B (requires the API backend to be running).

### 📓 Blog Notepad
A 3D notepad that dynamically fetches and displays blog posts. Click on post titles to open them in a new tab.

### 🎛️ Post-Processing Pipeline
- **CRT Shader** - Screen curvature, chromatic aberration, scanlines, and film grain
- **Bloom** - Glow effects for rave lights
- **Pixelation** - Retro pixel effect with animated transitions

### 🎵 Spatial Audio
Muffled club music with reverb, simulating sound coming from below. Audio starts on first click.

### 🚨 Emergency Button
Triggers a dramatic sequence:
1. Rave lights turn off
2. Camera zooms out
3. Full blackout
4. Environment swaps to the "Backrooms"

### 💡 Dynamic Lighting
Multiple light show modes with rave lights that animate and pulse.

## Getting Started

### Prerequisites
- [Bun](https://bun.sh/) (recommended) or Node.js

### Installation

```bash
# Install dependencies
bun install

# Start development server
bun dev
```

### Environment Variables

Create a `.env` file based on `.env.example`:

```env
VITE_BLOG_API_URL=https://your-blog-api-url
```

## Project Structure

```
desk/
├── public/              # Static assets (3D models, textures, audio)
│   ├── computer/        # Computer model
│   ├── metal_desk/      # Desk model
│   ├── Notepad/         # Notepad model
│   └── ...
├── src/
│   ├── main.ts          # Entry point - scene setup
│   ├── state.ts         # Global application state
│   ├── input.ts         # Keyboard input handling
│   ├── interaction.ts   # Mouse interactions & raycasting
│   ├── animate.ts       # Animation loop
│   ├── terminalSession.ts # E2B terminal session management
│   ├── meshes/          # Dynamic texture classes
│   │   ├── Terminal.ts  # Terminal canvas rendering
│   │   ├── Notepad.ts   # Blog notepad rendering
│   │   └── Oscilloscope.ts
│   ├── objects/         # 3D object loaders
│   ├── animations/      # Animation utilities
│   ├── shaders/         # Custom GLSL shaders
│   │   ├── CRTShader.ts
│   │   └── WhiteOutShader.ts
│   ├── setup/           # Scene setup utilities
│   └── utils/           # Helper functions
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.js
```

## Controls

| Key | Action |
|-----|--------|
| `P` | Toggle pixelation effect |
| `C` | Toggle CRT shader |
| `B` | Toggle bloom effect |
| `U` | Toggle camera lock (enable orbit controls) |
| `Escape` | Exit focused view |

## Tech Stack

- **[Three.js](https://threejs.org/)** - 3D graphics library
- **[Vite](https://vitejs.dev/)** - Build tool and dev server
- **[TypeScript](https://www.typescriptlang.org/)** - Type safety
- **[three-stdlib](https://github.com/pmndrs/three-stdlib)** - Three.js utilities

## 3D Models

Models are sourced from various creators (see `public/*/license.txt` for attributions):
- Metal desk
- Office chair
- Computer
- Notepad
- Robotic arm
- Speakers
- And more...

## Development

```bash
# Development with hot reload
bun dev

# Production build
bun run build

# Preview production build
bun run preview
```

## Related

This is part of a larger personal site project:
- `/api` - FastAPI backend with E2B terminal sessions
- `/frontend` - Angular main site
- `/blog` - Static blog

## License

MIT
