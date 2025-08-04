const express = require('express');
const router = express.Router();
const db = require('../db');

// Get all users with their post counts
router.get('/', async (req, res) => {
    try {
        const result = await db.query(`
            SELECT 
                users.id,
                users.name,
                users.email,
                users.created_at,
                users.last_login,
                COUNT(posts.id) as post_count
            FROM users 
            LEFT JOIN posts ON users.id = posts.user_id 
            GROUP BY users.id, users.name, users.email, users.created_at, users.last_login
            ORDER BY users.created_at DESC
        `);

        res.json(result.rows);
    } catch (err) {
        console.error('Get users error:', err);
        res.status(500).json({ error: err.message });
    }
});

// Get user by ID with their posts
router.get('/:id', async (req, res) => {
    try {
        const userId = req.params.id;

        // Get user info
        const userResult = await db.query(`
            SELECT 
                id, name, email, created_at, last_login
            FROM users 
            WHERE id = $1
        `, [userId]);

        if (userResult.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Get user's posts
        const postsResult = await db.query(`
            SELECT 
                id, title, content, created_at, updated_at
            FROM posts 
            WHERE user_id = $1 
            ORDER BY created_at DESC
        `, [userId]);

        // Get user stats
        const statsResult = await db.query(`
            SELECT 
                COUNT(*) as total_posts,
                MAX(created_at) as last_post_date
            FROM posts 
            WHERE user_id = $1
        `, [userId]);

        const user = userResult.rows[0];
        const posts = postsResult.rows;
        const stats = statsResult.rows[0];

        res.json({
            user: {
                ...user,
                total_posts: parseInt(stats.total_posts),
                last_post_date: stats.last_post_date
            },
            posts
        });

    } catch (err) {
        console.error('Get user by ID error:', err);
        res.status(500).json({ error: err.message });
    }
});

// Get user statistics
router.get('/:id/stats', async (req, res) => {
    try {
        const userId = req.params.id;

        // Check if user exists
        const userCheck = await db.query('SELECT id FROM users WHERE id = $1', [userId]);
        if (userCheck.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Get comprehensive stats
        const statsResult = await db.query(`
            SELECT 
                COUNT(*) as total_posts,
                COUNT(CASE WHEN created_at >= NOW() - INTERVAL '7 days' THEN 1 END) as posts_this_week,
                COUNT(CASE WHEN created_at >= NOW() - INTERVAL '30 days' THEN 1 END) as posts_this_month,
                MAX(created_at) as last_post_date,
                MIN(created_at) as first_post_date,
                AVG(LENGTH(content)) as avg_content_length
            FROM posts 
            WHERE user_id = $1
        `, [userId]);

        const stats = statsResult.rows[0];

        res.json({
            user_id: parseInt(userId),
            total_posts: parseInt(stats.total_posts),
            posts_this_week: parseInt(stats.posts_this_week),
            posts_this_month: parseInt(stats.posts_this_month),
            last_post_date: stats.last_post_date,
            first_post_date: stats.first_post_date,
            avg_content_length: stats.avg_content_length ? Math.round(parseFloat(stats.avg_content_length)) : 0
        });

    } catch (err) {
        console.error('Get user stats error:', err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;