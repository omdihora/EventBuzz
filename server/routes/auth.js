const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db/database');
const { authenticate, JWT_SECRET } = require('../middleware/auth');

const router = express.Router();

// ── Register (Student only) ───────────────────────────────────
router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ error: 'Name, email, and password are required.' });
        }

        const existing = await db.query('SELECT id FROM "Users" WHERE email = $1', [email]);
        if (existing.rows.length > 0) {
            return res.status(400).json({ error: 'Email already registered.' });
        }

        const hashedPassword = bcrypt.hashSync(password, 10);
        // Always register as Student — Admin accounts are created manually
        const result = await db.query(
            'INSERT INTO "Users" (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id',
            [name, email, hashedPassword, 'Student']
        );

        const newUserId = result.rows[0].id;

        const token = jwt.sign(
            { id: newUserId, name, email, role: 'Student' },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(201).json({
            message: 'Registration successful!',
            token,
            user: { id: newUserId, name, email, role: 'Student' },
        });
    } catch (err) {
        console.error('Register error:', err);
        res.status(500).json({ error: 'Server error during registration.' });
    }
});

// ── Student Login ─────────────────────────────────────────────
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required.' });
        }

        const userResult = await db.query('SELECT * FROM "Users" WHERE email = $1', [email]);
        if (userResult.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid email or password.' });
        }
        const user = userResult.rows[0];

        const isMatch = bcrypt.compareSync(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid email or password.' });
        }

        const token = jwt.sign(
            { id: user.id, name: user.name, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            message: 'Login successful!',
            token,
            user: { id: user.id, name: user.name, email: user.email, role: user.role },
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Server error during login.' });
    }
});

// ── Admin Login ───────────────────────────────────────────────
router.post('/admin-login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required.' });
        }

        const userResult = await db.query('SELECT * FROM "Users" WHERE email = $1', [email]);
        if (userResult.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid email or password.' });
        }
        const user = userResult.rows[0];

        const isMatch = bcrypt.compareSync(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid email or password.' });
        }

        // ── Role check: only Admin users can use this endpoint ──
        if (user.role !== 'Admin') {
            return res.status(403).json({ error: 'Unauthorized Access. Only Admin accounts can access this portal.' });
        }

        const token = jwt.sign(
            { id: user.id, name: user.name, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            message: 'Admin login successful!',
            token,
            user: { id: user.id, name: user.name, email: user.email, role: user.role },
        });
    } catch (err) {
        console.error('Admin login error:', err);
        res.status(500).json({ error: 'Server error during login.' });
    }
});

// ── Get Current User ──────────────────────────────────────────
router.get('/me', authenticate, async (req, res) => {
    try {
        const userResult = await db.query('SELECT id, name, email, role FROM "Users" WHERE id = $1', [req.user.id]);
        if (userResult.rows.length === 0) {
            return res.status(404).json({ error: 'User not found.' });
        }
        res.json({ user: userResult.rows[0] });
    } catch (err) {
        res.status(500).json({ error: 'Server error.' });
    }
});

module.exports = router;
