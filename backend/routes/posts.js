const express = require('express');
const router = express.Router();
const db = require('../db');

// Get all posts
router.get('/', async (req, res) => {
    try {
        const result = await db.query(`
      SELECT posts.*, users.name as author 
      FROM posts 
      JOIN users ON posts.user_id = users.id 
      ORDER BY posts.created_at DESC
    `);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Add a post
router.post('/', async (req, res) => {
    try {
        const { user_id, title, content } = req.body;
        await db.query(
            'INSERT INTO posts (user_id, title, content) VALUES ($1, $2, $3)',
            [user_id, title, content]
        );
        res.json({ message: 'Post added successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// Update a post
router.put('/:id', async (req, res) => {
    try {
        const postId = req.params.id;
        const { title, content } = req.body;

        // Validation
        if (!title || !content) {
            return res.status(400).json({ message: 'Title and content are required' });
        }

        if (title.length < 3) {
            return res.status(400).json({ message: 'Title must be at least 3 characters long' });
        }

        if (content.length < 10) {
            return res.status(400).json({ message: 'Content must be at least 10 characters long' });
        }

        // Update post
        const result = await db.query(
            'UPDATE posts SET title = $1, content = $2, updated_at = NOW() WHERE id = $3 RETURNING *',
            [title, content, postId]
        );

        // Get updated post with author info
        const postResult = await db.query(`
            SELECT 
                posts.id,
                posts.title,
                posts.content,
                posts.created_at,
                posts.updated_at,
                posts.user_id,
                users.name as author
            FROM posts 
            JOIN users ON posts.user_id = users.id 
            WHERE posts.id = $1
        `, [postId]);

        res.json({
            message: 'Post updated successfully',
            post: postResult.rows[0]
        });

    } catch (err) {
        console.error('Update post error:', err);
        res.status(500).json({ error: err.message });
    }
});

// Delete a post
router.delete('/:id',  async (req, res) => {
    try {
        const postId = req.params.id;

        // Delete post
        const result = await db.query('DELETE FROM posts WHERE id = $1 RETURNING *', [postId]);

        res.json({
            message: 'Post deleted successfully',
            deletedPost: result.rows[0]
        });

    } catch (err) {
        console.error('Delete post error:', err);
        res.status(500).json({ error: err.message });
    }
});


module.exports = router;
