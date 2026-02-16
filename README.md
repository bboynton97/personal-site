# braelyn.ai

An immersive 3D personal website designed to reflect who I am through the language of a virtual space. Inspired by Berghain and the alternative culture of Berlin, the site drops you into an interactive desk scene inside a post-industrial garage rave — complete with a real Linux terminal, spatial audio, custom GLSL shaders, and hidden easter eggs.

Read my full blog post: [The Making of Braelyn.ai](https://blog.braelyn.ai/posts/the-making-of-braelyn-ai)

## The Experience

The visitor should be able to develop a reasonable understanding of my identity within seconds. The entire 3D scene is built on [Three.js](https://threejs.org) with a perspective camera, orbit controls, volumetric fog, and shadow mapping. Assets are loaded with GLTFLoader using Meshopt compression for dramatically reduced file sizes.

A custom post-processing pipeline creates the distinctive visual style:
- **Pixelation** for a retro-digital feel
- **Bloom** for the rave lights
- **Custom CRT shader** — GLSL that applies barrel distortion, chromatic aberration, animated scanlines, film grain, and vignette

The techno doesn't just play from the speakers — it comes from *somewhere*. Three.js PositionalAudio places the music in 3D space underneath the desk, where the club is. A BiquadFilter creates a muffled "through the walls" effect that opens as the door opens. A ConvolverNode generates real-time reverb with a procedurally generated impulse response. The camera rumble syncs to 140 BPM using a sawtooth wave with exponential decay, shaking the scene to the beat.

## Architecture

```
personal-site/
├── frontend/    # Angular main website
├── desk/        # Three.js 3D interactive experience
├── blog/        # Static HTML blog
└── api/         # FastAPI backend
```

### Desk — 3D Interactive Experience

The heart of the project. A Three.js scene with raycasting interactions, dynamic canvas textures, custom GLSL shaders, spatial audio with reverb/filters, multiple light shows, and a backrooms easter egg.

**The Terminal** is real. Not a simulation — a full Linux shell:
- **xterm.js** renders a terminal emulator in the browser
- **E2B Sandbox** spins up isolated Linux containers on-demand
- **WebSocket PTY** provides real-time bidirectional communication with true pseudo-terminal support
- The xterm output is rendered to a canvas, which becomes a Three.js texture mapped onto the 3D monitor in real-time

Click the screen, get a sandboxed Linux session. Full shell access — command history, vim, python.

**The Notepad** fetches blog posts from the blog API, renders them onto a canvas texture with hand-drawn styling, ruled paper lines, and a cursive title font. UV raycasting enables interactive links on the paper surface.

**State Machine** — a central AppState object manages camera focus states, animation timestamps, audio states, object references, and horror game state (yes, there's a horror game easter egg). The animation loop runs at 60fps with easing functions for smooth transitions.

### Frontend — Angular Website

The main personal website built with Angular 18, featuring sidebar navigation, work history, blog integration, and interactive components.

### Blog — Static HTML

A minimal, SEO-optimized static blog built with vanilla HTML. Posts are managed via a `posts.json` file. No build process required.

### API — FastAPI Backend

Python backend handling:
- E2B terminal session management (starting/stopping sandboxed terminals)
- WebSocket routing for real-time terminal I/O
- Last.fm API integration for the "now playing" iPod feature
- Asset proxying from S3-compatible storage with aggressive caching
- Analytics event tracking

Deployed on Railway with PostgreSQL for session state and Alembic for database migrations.

## Tech Stack

| Project | Technologies |
|---------|-------------|
| Desk | Three.js, TypeScript, Vite, GLSL Shaders, xterm.js, Web Audio API |
| Frontend | Angular 18, TypeScript, RxJS |
| Blog | Vanilla HTML, CSS, JavaScript |
| API | FastAPI, PostgreSQL, Alembic, E2B, WebSockets |

## Performance

A 3D web experience needs to run on everything from gaming PCs to phones:
- **Meshopt compression** — models are 60-80% smaller than uncompressed glTF
- **Texture atlasing** — fewer draw calls by combining textures
- **Aggressive caching** — 1 year cache headers on static assets
- **Lazy loading** — terminal session only initializes on click

## Quick Start

```bash
# Start the API (required for terminal features)
cd api
uv sync
uv run python main.py &

# Start the desk experience
cd ../desk
bun install
bun dev

# Or start the Angular frontend
cd ../frontend
bun install
bun start
```

## License

MIT
