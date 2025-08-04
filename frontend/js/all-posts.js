// Check authentication
const user = JSON.parse(localStorage.getItem('user'));
if (!user) {
    window.location.href = 'login.html';
}

// Update welcome message
document.getElementById('welcome').innerText = `Welcome, ${user.name}`;

let allPosts = [];
let filteredPosts = [];


// Show notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
        <span>${message}</span>
    `;
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#48bb78' : type === 'error' ? '#f56565' : '#667eea'};
        color: white;
        padding: 16px 20px;
        border-radius: 12px;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        z-index: 1001;
        display: flex;
        align-items: center;
        gap: 12px;
        font-weight: 500;
        transform: translateX(400px);
        transition: transform 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    setTimeout(() => {
        notification.style.transform = 'translateX(400px)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 4000);
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
}

// Load all posts
async function loadAllPosts() {
    try {
        const res = await fetch('http://localhost:5000/api/posts');
        allPosts = await res.json();
        filteredPosts = [...allPosts];
        console.log(allPosts);
        updateStats();
        displayPosts();
        
    } catch (error) {
        console.error('Error loading posts:', error);
        document.getElementById('postsGrid').innerHTML = `
            <div style="padding: 60px 30px; text-align: center; color: #f56565; grid-column: 1 / -1;">
                <i class="fas fa-exclamation-triangle" style="font-size: 3rem; margin-bottom: 20px;"></i>
                <h3 style="margin-bottom: 10px;">Failed to load posts</h3>
                <p>Please try again later.</p>
            </div>
        `;
    }
}

// Update statistics
function updateStats() {
    const totalPosts = allPosts.length;
    const uniqueAuthors = [...new Set(allPosts.map(post => post.author))].length;
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const recentPosts = allPosts.filter(post => new Date(post.created_at) > oneWeekAgo).length;
    
    document.getElementById('totalPosts').textContent = totalPosts;
    document.getElementById('totalAuthors').textContent = uniqueAuthors;
    document.getElementById('recentPosts').textContent = recentPosts;
}

// Display posts (WITHOUT edit/delete buttons)
function displayPosts() {
    const postsGrid = document.getElementById('postsGrid');
    
    if (filteredPosts.length === 0) {
        postsGrid.innerHTML = `
            <div style="padding: 60px 30px; text-align: center; color: #718096; grid-column: 1 / -1;">
                <i class="fas fa-search" style="font-size: 3rem; margin-bottom: 20px; opacity: 0.5;"></i>
                <h3 style="margin-bottom: 10px;">No posts found</h3>
                <p>Try adjusting your search or filter criteria.</p>
            </div>
        `;
        return;
    }
    
    postsGrid.innerHTML = filteredPosts.map(post => `
        <div class="post-card">
            <div class="post-card-header">
                <h3 class="post-card-title">${escapeHtml(post.title)}</h3>
                <div class="post-card-meta">
                    <span>👤 ${escapeHtml(post.author)}</span>
                    <span>📅 ${formatDate(post.created_at || new Date())}</span>
                </div>
            </div>
            <div class="post-card-body">
                <p class="post-card-content">${escapeHtml(post.content)}</p>
                <div class="post-card-footer">
                    <small style="color: #718096; font-style: italic;">
                        ${post.user_id === user.id ? '✍️ Your post' : '📖 Community post'}
                    </small>
                </div>
            </div>
        </div>
    `).join('');
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, function(m) { return map[m]; });
}

// Search functionality
document.getElementById('searchInput').addEventListener('input', function(e) {
    const searchTerm = e.target.value.toLowerCase().trim();
    
    if (searchTerm === '') {
        filteredPosts = [...allPosts];
    } else {
        filteredPosts = allPosts.filter(post => 
            post.title.toLowerCase().includes(searchTerm) ||
            post.content.toLowerCase().includes(searchTerm) ||
            post.author.toLowerCase().includes(searchTerm)
        );
    }
    
    applySorting();
    displayPosts();
});

// Sort functionality
document.getElementById('sortFilter').addEventListener('change', function(e) {
    applySorting();
    displayPosts();
});

function applySorting() {
    const sortBy = document.getElementById('sortFilter').value;
    
    switch (sortBy) {
        case 'newest':
            filteredPosts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            break;
        case 'oldest':
            filteredPosts.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
            break;
        case 'author':
            filteredPosts.sort((a, b) => a.author.localeCompare(b.author));
            break;
    }
}

// Load posts on page load
loadAllPosts();
// Refresh posts every 30 seconds
setInterval(loadAllPosts, 30000);

function logout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('user');
        showNotification('Logged out successfully', 'success');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1500);
    }
}