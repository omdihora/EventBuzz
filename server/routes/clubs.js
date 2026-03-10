const express = require('express');
const db = require('../db/database');

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

module.exports = router;
