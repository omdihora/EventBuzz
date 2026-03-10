const express = require('express');
const multer = require('multer');
const path = require('path');
const db = require('../db/database');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// ── Multer for banner uploads ─────────────────────────────────
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, path.join(__dirname, '../uploads/banners')),
    filename: (req, file, cb) => {
        const uniqueName = Date.now() + '-' + file.originalname.replace(/\s+/g, '-');
        cb(null, uniqueName);
    },
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

// ── Get All Events ────────────────────────────────────────────
router.get('/', async (req, res) => {
    try {
        const eventsResult = await db.query(`
      SELECT "Events".*, "Clubs".name as "clubName" 
      FROM "Events" 
      LEFT JOIN "Clubs" ON "Events"."organizerClubId" = "Clubs".id
      ORDER BY "Events".date ASC
    `);
        res.json({ events: eventsResult.rows });
    } catch (err) {
        console.error('Get events error:', err);
        res.status(500).json({ error: 'Failed to fetch events.' });
    }
});

// ── Get Single Event ──────────────────────────────────────────
router.get('/:id', async (req, res) => {
    try {
        const eventResult = await db.query(`
      SELECT "Events".*, "Clubs".name as "clubName", "Clubs".description as "clubDescription"
      FROM "Events" 
      LEFT JOIN "Clubs" ON "Events"."organizerClubId" = "Clubs".id
      WHERE "Events".id = $1
    `, [req.params.id]);

        if (eventResult.rows.length === 0) {
            return res.status(404).json({ error: 'Event not found.' });
        }
        res.json({ event: eventResult.rows[0] });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch event.' });
    }
});

// ── Create Event (Admin only) ─────────────────────────────────
router.post('/', authenticate, authorize('Admin'), upload.single('banner'), async (req, res) => {
    try {
        const { title, description, organizerClubId, date, startTime, endTime, venue, totalSeats, fee } = req.body;

        if (!title || !date || !startTime || !endTime || !venue || !totalSeats) {
            return res.status(400).json({ error: 'Missing required fields.' });
        }

        const bannerImagePath = req.file ? `/banners/${req.file.filename}` : null;
        const seats = parseInt(totalSeats);
        const regFee = parseFloat(fee) || 0;

        const result = await db.query(`
      INSERT INTO "Events" (title, description, "organizerClubId", date, "startTime", "endTime", venue, "totalSeats", "availableSeats", fee, "bannerImagePath", "createdBy")
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING id
    `, [title, description, organizerClubId || null, date, startTime, endTime, venue, seats, seats, regFee, bannerImagePath, req.user.id]);

        res.status(201).json({
            message: 'Event created successfully!',
            eventId: result.rows[0].id,
        });
    } catch (err) {
        console.error('Create event error:', err);
        res.status(500).json({ error: 'Failed to create event.' });
    }
});

// ── Update Event (Admin only) ─────────────────────────────────
router.put('/:id', authenticate, authorize('Admin'), upload.single('banner'), async (req, res) => {
    try {
        const { title, description, organizerClubId, date, startTime, endTime, venue, totalSeats, fee } = req.body;
        const eventId = req.params.id;

        const existingResult = await db.query('SELECT * FROM "Events" WHERE id = $1', [eventId]);
        if (existingResult.rows.length === 0) {
            return res.status(404).json({ error: 'Event not found.' });
        }
        const existing = existingResult.rows[0];

        const bannerImagePath = req.file ? `/banners/${req.file.filename}` : existing.bannerImagePath;
        const seats = parseInt(totalSeats) || existing.totalSeats;
        const seatDiff = seats - existing.totalSeats;
        const newAvailable = Math.max(0, existing.availableSeats + seatDiff);

        await db.query(`
      UPDATE "Events" SET title = $1, description = $2, "organizerClubId" = $3, date = $4, "startTime" = $5, "endTime" = $6, 
      venue = $7, "totalSeats" = $8, "availableSeats" = $9, fee = $10, "bannerImagePath" = $11
      WHERE id = $12
    `, [
            title || existing.title,
            description || existing.description,
            organizerClubId || existing.organizerClubId,
            date || existing.date,
            startTime || existing.startTime,
            endTime || existing.endTime,
            venue || existing.venue,
            seats,
            newAvailable,
            parseFloat(fee) || existing.fee,
            bannerImagePath,
            eventId
        ]);

        res.json({ message: 'Event updated successfully!' });
    } catch (err) {
        console.error('Update event error:', err);
        res.status(500).json({ error: 'Failed to update event.' });
    }
});

// ── Delete Event (Admin only) — cascade delete registrations & payments
router.delete('/:id', authenticate, authorize('Admin'), async (req, res) => {
    const client = await db.connect();
    try {
        const eventId = req.params.id;
        const existingResult = await client.query('SELECT id FROM "Events" WHERE id = $1', [eventId]);
        if (existingResult.rows.length === 0) {
            client.release();
            return res.status(404).json({ error: 'Event not found.' });
        }

        await client.query('BEGIN');
        await client.query('DELETE FROM "Payments" WHERE "eventId" = $1', [eventId]);
        await client.query('DELETE FROM "Registrations" WHERE "eventId" = $1', [eventId]);
        await client.query('DELETE FROM "Events" WHERE id = $1', [eventId]);
        await client.query('COMMIT');

        res.json({ message: 'Event and related data deleted successfully!' });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Delete event error:', err);
        res.status(500).json({ error: 'Failed to delete event.' });
    } finally {
        client.release();
    }
});

module.exports = router;
