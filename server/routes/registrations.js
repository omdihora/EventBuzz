const express = require('express');
const QRCode = require('qrcode');
const path = require('path');
const fs = require('fs');
const db = require('../db/database');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// ── Register for Event (Student) ──────────────────────────────
router.post('/', authenticate, async (req, res) => {
    const client = await db.connect();
    try {
        const { eventId, phone } = req.body;
        const userId = req.user.id;

        if (!eventId || !phone) {
            return res.status(400).json({ error: 'Event ID and phone number are required.' });
        }

        // Check if already registered
        const existingRegResult = await client.query(
            'SELECT id FROM "Registrations" WHERE "userId" = $1 AND "eventId" = $2',
            [userId, eventId]
        );
        if (existingRegResult.rows.length > 0) {
            return res.status(400).json({ error: 'You are already registered for this event.' });
        }

        await client.query('BEGIN');

        // Check seat availability
        const eventResult = await client.query('SELECT * FROM "Events" WHERE id = $1', [eventId]);
        if (eventResult.rows.length === 0) throw new Error('Event not found.');
        const event = eventResult.rows[0];

        if (event.availableSeats <= 0) throw new Error('No seats available.');

        // Decrease available seats
        await client.query('UPDATE "Events" SET "availableSeats" = "availableSeats" - 1 WHERE id = $1', [eventId]);

        // Create registration
        const result = await client.query(`
        INSERT INTO "Registrations" ("userId", "eventId", phone, "paymentStatus", "createdAt")
        VALUES ($1, $2, $3, 'Success', NOW()) RETURNING id
      `, [userId, eventId, phone]);

        const registrationId = result.rows[0].id;

        // Generate QR code
        const qrData = JSON.stringify({ registrationId, eventId: parseInt(eventId) });
        const qrFilename = `qr-${registrationId}-${eventId}.png`;
        const qrPath = path.join(__dirname, '../uploads/qrcodes', qrFilename);

        QRCode.toFile(qrPath, qrData, { width: 300, margin: 2 }, (err) => {
            if (err) console.error('QR generation error:', err);
        });

        // Update registration with QR path
        await client.query('UPDATE "Registrations" SET "qrCodePath" = $1 WHERE id = $2', [
            `/qrcodes/${qrFilename}`,
            registrationId
        ]);

        await client.query('COMMIT');

        res.status(201).json({
            message: 'Registration successful! Payment confirmed.',
            registration: {
                id: registrationId,
                eventId: parseInt(eventId),
                paymentStatus: 'Success',
                qrCodePath: `/qrcodes/${qrFilename}`,
            },
        });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Registration error:', err.message);
        res.status(400).json({ error: err.message || 'Registration failed.' });
    } finally {
        client.release();
    }
});

// ── Get My Registrations ──────────────────────────────────────
router.get('/my', authenticate, async (req, res) => {
    try {
        const registrationsResult = await db.query(`
      SELECT "Registrations".*, 
             "Events".title as "eventTitle", "Events".date as "eventDate", 
             "Events"."startTime", "Events"."endTime", "Events".venue, "Events".fee,
             "Events"."bannerImagePath",
             "Clubs".name as "clubName"
      FROM "Registrations"
      JOIN "Events" ON "Registrations"."eventId" = "Events".id
      LEFT JOIN "Clubs" ON "Events"."organizerClubId" = "Clubs".id
      WHERE "Registrations"."userId" = $1
      ORDER BY "Registrations"."createdAt" DESC
    `, [req.user.id]);

        res.json({ registrations: registrationsResult.rows });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch registrations.' });
    }
});

// ── Get Registrations for Event (Admin) ───────────────────────
router.get('/event/:eventId', authenticate, authorize('Admin'), async (req, res) => {
    try {
        const registrationsResult = await db.query(`
      SELECT "Registrations".*, "Users".name as "userName", "Users".email as "userEmail"
      FROM "Registrations"
      JOIN "Users" ON "Registrations"."userId" = "Users".id
      WHERE "Registrations"."eventId" = $1
      ORDER BY "Registrations"."createdAt" DESC
    `, [req.params.eventId]);

        res.json({ registrations: registrationsResult.rows });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch registrations.' });
    }
});

module.exports = router;
