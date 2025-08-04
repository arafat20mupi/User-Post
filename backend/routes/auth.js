const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../db');



// Register
router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        console.log(req.body);
        const hashed = await bcrypt.hash(password, 10); 
        console.log("Hashed password:", hashed);         

        const result = await db.query(
            'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id',
            [name, email, hashed]                   
        );

        console.log(result);

        res.json({ message: 'User registered successfully', id: result.rows[0].id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        if (result.rows.length === 0) return res.status(401).json({ error: 'Invalid email or password' });

        const match = await bcrypt.compare(password, result.rows[0].password);
        if (!match) return res.status(401).json({ error: 'Invalid email or password' });

        res.json({ message: 'Login successful', user: { id: result.rows[0].id, name: result.rows[0].name } });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
