# Braelyn's Personal Site

A multi-faceted personal website featuring an Angular frontend, an interactive 3D desk experience, a static blog, and a FastAPI backend.

## 🏗️ Architecture

```
personal-site/
├── frontend/    # Angular main website
├── desk/        # Three.js 3D interactive experience
├── blog/        # Static HTML blog
└── api/         # FastAPI backend
```

## 🚀 Projects

### [Frontend](/frontend) - Angular Website
The main personal website built with Angular 18. Features a sidebar navigation, work history, blog integration, and various interactive components.

```bash
cd frontend
bun install
bun start
```

### [Desk](/desk) - 3D Interactive Experience
An immersive Three.js scene featuring an interactive desk in a garage/rave setting. Includes:
- Working terminal connected to a sandboxed backend
- Blog notepad with dynamic content
- Post-processing effects (CRT, bloom, pixelation)
- Spatial audio with club music
- Easter eggs and hidden interactions

```bash
cd desk
bun install
bun dev
```

### [Blog](/blog) - Static Blog
A minimal, SEO-optimized static blog built with vanilla HTML. Posts are managed via a simple `posts.json` file.

```bash
cd blog
python3 -m http.server 8000
```

### [API](/api) - FastAPI Backend
Python backend providing:
- E2B terminal session management
- PostgreSQL database with Alembic migrations
- Health checks and API endpoints

```bash
cd api
uv sync
uv run python main.py
```

## 🛠️ Tech Stack

| Project | Technologies |
|---------|-------------|
| Frontend | Angular 18, TypeScript, RxJS |
| Desk | Three.js, TypeScript, Vite, GLSL Shaders |
| Blog | Vanilla HTML, CSS, JavaScript |
| API | FastAPI, PostgreSQL, Alembic, E2B |

## 🚢 Deployment

All projects are configured for Railway deployment:
- Each project has its own `railway.toml` and `Procfile`
- Frontend and Blog can also deploy to GitHub Pages, Netlify, or Vercel
- API requires PostgreSQL and E2B API key

## 📁 Project Details

### Frontend Components
- Home page with personal info
- Work history timeline
- Blog integration
- Terminal emulator
- Background animations
- Slack-style notifications

### Desk Features
- Raycasting interactions
- Dynamic canvas textures
- Custom GLSL shaders
- Audio with reverb/filters
- Multiple "light shows"
- Backrooms easter egg

### Blog Features
- JSON-powered post management
- SEO-optimized HTML
- Responsive design
- No build process required

### API Endpoints
- `POST /api/terminal/session/start` - Start E2B session
- `POST /api/terminal/session/execute` - Execute command
- `DELETE /api/terminal/session/end` - End session
- `GET /health` - Health check

## 🏃 Quick Start

```bash
# Clone the repo
git clone https://github.com/yourusername/personal-site.git
cd personal-site

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

## 📄 License

MIT
