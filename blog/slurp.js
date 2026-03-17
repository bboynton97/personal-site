const API_BASE = 'https://api.braelyn.ai';

function slurp(eventType, eventData) {
    fetch(`${API_BASE}/slurp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event_type: eventType, event_data: eventData }),
    }).catch(() => {});
}

// Track page view with the slug derived from the URL
const slug = window.location.pathname.replace(/.*\/posts\//, '').replace('.html', '');
if (slug && slug !== '/' && slug !== '') {
    slurp('blog_post_read', slug);
}
