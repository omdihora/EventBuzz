const express = require('express');
const db = require('../db/database');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// ── Get All Clubs ─────────────────────────────────────────────
router.get('/', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM "Clubs" ORDER BY type, name');
        res.json({ clubs: result.rows });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch clubs.' });
    }
});

// ── Get Club by ID (with upcoming events) ─────────────────────
router.get('/:id', async (req, res) => {
    try {
        const clubResult = await db.query('SELECT * FROM "Clubs" WHERE id = $1', [req.params.id]);
        if (clubResult.rows.length === 0) {
            return res.status(404).json({ error: 'Club not found.' });
        }

        const eventsResult = await db.query(
            'SELECT * FROM "Events" WHERE "organizerClubId" = $1 AND date >= CURRENT_DATE::text ORDER BY date ASC',
            [req.params.id]
        );

        res.json({ club: clubResult.rows[0], events: eventsResult.rows });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch club.' });
    }
});

// ── Create Club (Admin only) ───────────────────────────────────
router.post('/', authenticate, authorize('Admin'), async (req, res) => {
    try {
        const { name, type, description } = req.body;
        if (!name || !type) {
            return res.status(400).json({ error: 'Name and type are required.' });
        }
        const result = await db.query(
            'INSERT INTO "Clubs" (name, type, description) VALUES ($1, $2, $3) RETURNING *',
            [name, type, description || '']
        );
        res.status(201).json({ message: 'Club created successfully!', club: result.rows[0] });
    } catch (err) {
        console.error('Create club error:', err);
        res.status(500).json({ error: 'Failed to create club.' });
    }
});

// ── Delete Club (Admin only) ───────────────────────────────────
router.delete('/:id', authenticate, authorize('Admin'), async (req, res) => {
    try {
        const clubId = req.params.id;
        const existing = await db.query('SELECT id FROM "Clubs" WHERE id = $1', [clubId]);
        if (existing.rows.length === 0) {
            return res.status(404).json({ error: 'Club not found.' });
        }
        await db.query('DELETE FROM "Clubs" WHERE id = $1', [clubId]);
        res.json({ message: 'Club deleted successfully.' });
    } catch (err) {
        console.error('Delete club error:', err);
        res.status(500).json({ error: 'Failed to delete club.' });
    }
});

module.exports = router;

