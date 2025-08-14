// Sidebar component loader
document.addEventListener('DOMContentLoaded', function() {
    // Find the sidebar container
    const sidebarContainer = document.querySelector('.sidebar');
    
    if (sidebarContainer) {
        // Fetch the sidebar content
        fetch('sidebar.html')
            .then(response => response.text())
            .then(html => {
                // Inject the sidebar content
                sidebarContainer.innerHTML = html;
                
                // Highlight the current page in navigation
                highlightCurrentPage();
            })
            .catch(error => {
                console.error('Error loading sidebar:', error);
                // Fallback: show a simple sidebar if fetch fails
                sidebarContainer.innerHTML = `
                    <div class="sidebar-content">
                        <div class="profile-section">
                            <img src="assets/me.jpeg" alt="Braelyn Boynton" class="profile-image">
                            <h1 class="profile-name">Braelyn Boynton</h1>
                        </div>
                        <ul class="nav-menu">
                            <li class="nav-item"><a href="index.html" class="nav-link">Home</a></li>
                            <li class="nav-item"><a href="blog.html" class="nav-link">Blog</a></li>
                            <li class="nav-item"><a href="personal.html" class="nav-link">Personal</a></li>
                            <li class="nav-item"><a href="work.html" class="nav-link">Work</a></li>
                        </ul>
                    </div>
                `;
                highlightCurrentPage();
            });
    }
});

// Function to highlight the current page in navigation
function highlightCurrentPage() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage) {
            link.classList.add('active');
        }
    });
}
