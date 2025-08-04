// Check authentication
const user = JSON.parse(localStorage.getItem('user'));
if (!user) {
    window.location.href = 'login.html';
}

// Update welcome message
document.getElementById('welcome').innerText = `Welcome, ${user.name}`;

let posts = [];
let currentEditPostId = null;
let currentDeletePostId = null;

// Show/hide loading overlay
function showLoading() {
    document.getElementById('loading').classList.add('show');
}

function hideLoading() {
    document.getElementById('loading').classList.remove('show');
}

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

// Load posts
async function loadPosts() {
    try {
        const res = await fetch('http://localhost:5000/api/posts');
        posts = await res.json();
        
        const postsContainer = document.getElementById('posts');
        const postsCount = document.getElementById('postsCount');
        
        postsCount.textContent = posts.length;
        
        if (posts.length === 0) {
            postsContainer.innerHTML = `
                <div style="padding: 60px 30px; text-align: center; color: #718096;">
                    <i class="fas fa-newspaper" style="font-size: 3rem; margin-bottom: 20px; opacity: 0.5;"></i>
                    <h3 style="margin-bottom: 10px;">No posts yet</h3>
                    <p>Be the first to share something with the community!</p>
                </div>
            `;
            return;
        }
        
        // Show only recent posts (limit to 5)
        const recentPosts = posts.slice(0, 5);
        
        postsContainer.innerHTML = recentPosts.map(post => `
            <div class="post">
                <h4>${escapeHtml(post.title)}</h4>
                <p>${escapeHtml(post.content)}</p>
                <div class="post-meta">
                    <small>
                        By ${escapeHtml(post.author)} • ${formatDate(post.created_at || new Date())}
                    </small>
                    ${post.user_id === user.id ? `
                        <div class="post-actions">
                            <button class="btn btn-secondary btn-small" onclick="editPost(${post.id})">
                                <i class="fas fa-edit"></i>
                                Edit
                            </button>
                            <button class="btn btn-danger btn-small" onclick="deletePost(${post.id})">
                                <i class="fas fa-trash"></i>
                                Delete
                            </button>
                        </div>
                    ` : ''}
                </div>
            </div>
        `).join('');
        
    } catch (error) {
        console.error('Error loading posts:', error);
        document.getElementById('posts').innerHTML = `
            <div style="padding: 40px 30px; text-align: center; color: #f56565;">
                <i class="fas fa-exclamation-triangle" style="font-size: 2rem; margin-bottom: 16px;"></i>
                <p>Failed to load posts. Please try again later.</p>
            </div>
        `;
    }
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

// Add new post
document.getElementById('postForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const title = document.getElementById('title').value.trim();
    const content = document.getElementById('content').value.trim();
    
    if (!title || !content) {
        showNotification('Please fill in all fields', 'error');
        return;
    }
    
    if (title.length < 3) {
        showNotification('Title must be at least 3 characters long', 'error');
        return;
    }
    
    if (content.length < 10) {
        showNotification('Content must be at least 10 characters long', 'error');
        return;
    }
    
    const submitButton = e.target.querySelector('button[type="submit"]');
    const originalText = submitButton.innerHTML;
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Publishing...';
    submitButton.disabled = true;
    
    try {
        const res = await fetch('http://localhost:5000/api/posts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                user_id: user.id, 
                title, 
                content 
            })
        });
        
        if (res.ok) {
            showNotification('Post published successfully!', 'success');
            document.getElementById('title').value = '';
            document.getElementById('content').value = '';
            loadPosts();
        } else {
            const error = await res.json();
            showNotification(error.message || 'Failed to publish post', 'error');
        }
    } catch (error) {
        showNotification('Network error. Please try again.', 'error');
    } finally {
        submitButton.innerHTML = originalText;
        submitButton.disabled = false;
    }
});

// Edit post function
function editPost(postId) {
    const post = posts.find(p => p.id === postId);
    if (!post) {
        showNotification('Post not found', 'error');
        return;
    }
    
    if (post.user_id !== user.id) {
        showNotification('You can only edit your own posts', 'error');
        return;
    }
    
    currentEditPostId = postId;
    document.getElementById('editPostId').value = postId;
    document.getElementById('editTitle').value = post.title;
    document.getElementById('editContent').value = post.content;
    document.getElementById('editModal').classList.add('show');
}

// Close edit modal
function closeEditModal() {
    document.getElementById('editModal').classList.remove('show');
    currentEditPostId = null;
}

// Handle edit form submission
document.getElementById('editPostForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const title = document.getElementById('editTitle').value.trim();
    const content = document.getElementById('editContent').value.trim();
    
    if (!title || !content) {
        showNotification('Please fill in all fields', 'error');
        return;
    }
    
    if (title.length < 3) {
        showNotification('Title must be at least 3 characters long', 'error');
        return;
    }
    
    if (content.length < 10) {
        showNotification('Content must be at least 10 characters long', 'error');
        return;
    }
    
    showLoading();
    
    try {
        const res = await fetch(`http://localhost:5000/api/posts/${currentEditPostId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, content, user_id: user.id })
        });
        
        if (res.ok) {
            showNotification('Post updated successfully!', 'success');
            closeEditModal();
            loadPosts();
        } else {
            const error = await res.json();
            showNotification(error.message || 'Failed to update post', 'error');
        }
    } catch (error) {
        showNotification('Network error. Please try again.', 'error');
    } finally {
        hideLoading();
    }
});

// Delete post function
function deletePost(postId) {
    const post = posts.find(p => p.id === postId);
    if (!post) {
        showNotification('Post not found', 'error');
        return;
    }
    
    if (post.user_id !== user.id) {
        showNotification('You can only delete your own posts', 'error');
        return;
    }
    
    currentDeletePostId = postId;
    document.getElementById('deletePostTitle').textContent = post.title;
    document.getElementById('deletePostContent').textContent = post.content.substring(0, 100) + '...';
    document.getElementById('deleteModal').classList.add('show');
}

// Close delete modal
function closeDeleteModal() {
    document.getElementById('deleteModal').classList.remove('show');
    currentDeletePostId = null;
}

// Confirm delete
async function confirmDelete() {
    if (!currentDeletePostId) return;
    
    showLoading();
    
    try {
        const res = await fetch(`http://localhost:5000/api/posts/${currentDeletePostId}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: user.id })
        });
        
        if (res.ok) {
            showNotification('Post deleted successfully!', 'success');
            closeDeleteModal();
            loadPosts();
        } else {
            const error = await res.json();
            showNotification(error.message || 'Failed to delete post', 'error');
        }
    } catch (error) {
        showNotification('Network error. Please try again.', 'error');
    } finally {
        hideLoading();
    }
}

// Auto-resize textarea
document.getElementById('content').addEventListener('input', function() {
    this.style.height = 'auto';
    this.style.height = this.scrollHeight + 'px';
});

document.getElementById('editContent').addEventListener('input', function() {
    this.style.height = 'auto';
    this.style.height = this.scrollHeight + 'px';
});

// Close modals when clicking outside
window.addEventListener('click', function(event) {
    const editModal = document.getElementById('editModal');
    const deleteModal = document.getElementById('deleteModal');
    
    if (event.target === editModal) {
        closeEditModal();
    }
    if (event.target === deleteModal) {
        closeDeleteModal();
    }
});

// Load posts on page load
loadPosts();

// Refresh posts every 30 seconds
setInterval(loadPosts, 30000);

function logout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('user');
        showNotification('Logged out successfully', 'success');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1500);
    }
}