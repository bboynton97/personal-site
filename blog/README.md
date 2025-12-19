# My Static Blog

A minimal, SEO-optimized static blog built with vanilla HTML.

## Features

- 📄 **Pure HTML** - No CSS frameworks, minimal JavaScript
- 🚀 **SEO Optimized** - Proper meta tags and semantic HTML
- 📱 **Responsive** - Works on all devices with native HTML
- ⚡ **Fast** - Minimal overhead, instant loading
- ♿ **Accessible** - Semantic HTML5 elements
- 📝 **JSON-Powered** - Easy post management via `posts.json`

## Structure

```
blog/
├── index.html           # Homepage (dynamically loads posts)
├── posts.json           # Blog post metadata
├── posts/              # Individual blog post HTML files
│   └── building-with-simplicity.html
└── README.md           # This file
```

## Getting Started

### View Locally

Use a local server (required for JSON loading):

```bash
# Using Python
python3 -m http.server 8000

# Using Node.js
npx serve

# Using PHP
php -S localhost:8000
```

Then visit `http://localhost:8000`

**Note:** Opening `index.html` directly in the browser won't work due to CORS restrictions when loading `posts.json`. You need to use a local server.

### Deployment

Deploy anywhere that serves static files:

- **GitHub Pages**: Push to GitHub and enable Pages
- **Netlify**: Drag and drop the folder
- **Vercel**: Connect and deploy
- **Any host**: Upload via FTP/SFTP

## Adding New Posts

### 1. Create the HTML file

Copy `posts/building-with-simplicity.html` as a template:

```bash
cp posts/building-with-simplicity.html posts/my-new-post.html
```

Edit the file:
- Update the `<head>` meta tags
- Update the title and content
- Keep the slug in the filename (e.g., `my-new-post`)

### 2. Add to posts.json

Edit `posts.json` and add your new post:

```json
{
  "title": "My New Post Title",
  "slug": "my-new-post",
  "date": "2025-12-19",
  "readTime": "5 min read",
  "description": "A brief description of your post.",
  "tags": ["Tag1", "Tag2"]
}
```

**Important:** The `slug` must match your HTML filename (without `.html`)

That's it! The homepage will automatically display your new post.

## posts.json Format

Each post object in the JSON array has:

- `title` (string) - The post title
- `slug` (string) - URL-friendly identifier (matches the HTML filename)
- `date` (string) - ISO date format (YYYY-MM-DD)
- `readTime` (string) - Estimated reading time
- `description` (string) - Brief summary for the homepage
- `tags` (array) - List of tag strings

Posts are displayed in the order they appear in the JSON file.

## SEO Optimized

Each page includes:
- ✅ Semantic HTML5 elements
- ✅ Proper heading hierarchy (single h1, h2, h3)
- ✅ Meta descriptions
- ✅ Keywords
- ✅ Viewport meta tag
- ✅ Time elements with datetime attributes

## Why This Approach?

- **No build process** - Just edit JSON and HTML
- **No dependencies** - Pure HTML + minimal JS
- **Easy to maintain** - All post metadata in one file
- **Works forever** - No breaking changes
- **Fast** - Minimal overhead
- **Flexible** - Easy to customize

---

Built with pure HTML and a touch of JavaScript
