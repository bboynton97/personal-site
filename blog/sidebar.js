// Dynamically generates a "similar posts" sidebar on blog post pages
(function () {
    const slug = window.location.pathname.replace(/.*\/posts\//, '').replace('.html', '');
    if (!slug) return;

    fetch('../posts.json')
        .then(r => r.json())
        .then(posts => {
            const current = posts.find(p => p.slug === slug);
            if (!current) return;

            const currentTags = new Set(current.tags.map(t => t.toLowerCase()));
            const others = posts.filter(p => p.slug !== slug);

            // Score by shared tags
            const scored = others.map(p => {
                const shared = p.tags.filter(t => currentTags.has(t.toLowerCase())).length;
                return { post: p, shared };
            });

            // Similar posts first, then most recent as fallback
            scored.sort((a, b) => b.shared - a.shared || new Date(b.post.date) - new Date(a.post.date));

            const toShow = scored.slice(0, 4);
            if (toShow.length === 0) return;

            const hasSimilar = toShow[0].shared > 0;

            const sidebar = document.createElement('aside');
            sidebar.className = 'post-sidebar';

            const heading = document.createElement('h4');
            heading.textContent = hasSimilar ? 'Similar Posts' : 'Recent Posts';
            sidebar.appendChild(heading);

            const list = document.createElement('ul');
            toShow.forEach(({ post }) => {
                const li = document.createElement('li');
                const a = document.createElement('a');
                a.href = `${post.slug}.html`;
                a.textContent = post.title;
                li.appendChild(a);

                const date = document.createElement('span');
                date.className = 'sidebar-date';
                date.textContent = new Date(post.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                });
                li.appendChild(date);

                list.appendChild(li);
            });

            sidebar.appendChild(list);
            document.body.appendChild(sidebar);
        })
        .catch(() => {});
})();
