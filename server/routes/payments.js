const express = require('express');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const db = require('../db/database');
const { authenticate } = require('../middleware/auth');
require('dotenv').config();

const router = express.Router();

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_dummy',
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'dummy_secret',
});

// ── Create Razorpay Order ───────────────────────────────────────
router.post('/create-order', authenticate, async (req, res) => {
    const client = await db.connect();
    try {
        const { eventId, phone } = req.body;
        const userId = req.user.id;

        if (!eventId || !phone) {
            return res.status(400).json({ error: 'Event ID and phone number are required.' });
        }

        const eventResult = await client.query('SELECT * FROM "Events" WHERE id = $1', [eventId]);
        if (eventResult.rows.length === 0) {
            return res.status(404).json({ error: 'Event not found.' });
        }
        const event = eventResult.rows[0];
        if (event.availableSeats <= 0) {
            return res.status(400).json({ error: 'No seats available.' });
        }

        const existingRegResult = await client.query('SELECT id FROM "Registrations" WHERE "userId" = $1 AND "eventId" = $2', [userId, eventId]);
        if (existingRegResult.rows.length > 0) {
            return res.status(400).json({ error: 'You are already registered for this event.' });
        }

        // Create a 'Pending' registration
        const insertRegResult = await client.query(`
            INSERT INTO "Registrations" ("userId", "eventId", phone, "paymentStatus", "createdAt")
            VALUES ($1, $2, $3, 'Pending', NOW()) RETURNING id
        `, [userId, eventId, phone]);

        const registrationId = insertRegResult.rows[0].id;

        // If the event is free, skip Razorpay entirely
        if (event.fee === 0) {
            await client.query('BEGIN');

            await client.query("UPDATE \"Registrations\" SET \"paymentStatus\" = 'Success' WHERE id = $1", [registrationId]);
            await client.query('UPDATE "Events" SET "availableSeats" = "availableSeats" - 1 WHERE id = $1', [eventId]);

            // Store QR data as a plain string (no disk write needed)
            const qrData = JSON.stringify({ registrationId, eventId, type: 'Event_Ticket' });
            await client.query('UPDATE "Registrations" SET "qrCodePath" = $1 WHERE id = $2', [qrData, registrationId]);

            await client.query('COMMIT');

            return res.json({ skipPayment: true, registrationId, qrCodePath: qrData });
        }

        // Create Razorpay Order
        const options = {
            amount: event.fee * 100, // Amount in paise
            currency: 'INR',
            receipt: `receipt_${registrationId}`,
        };

        let order;
        if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_ID !== 'rzp_test_dummy') {
            order = await razorpay.orders.create(options);
        } else {
            // Mock order for testing without Razorpay keys
            order = { id: `order_mock_${Date.now()}`, amount: options.amount, currency: 'INR' };
            console.log('⚠️ Using mock Razorpay order for testing. Add real keys to .env to enable actual payments.');
        }

        res.json({ order, registrationId, keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_dummy' });
    } catch (err) {
        console.error('Create Order Error:', err);
        res.status(500).json({ error: 'Failed to create payment order.' });
    } finally {
        if (client) client.release();
    }
});

// ── Verify Payment Signature ──────────────────────────────────────
router.post('/verify', authenticate, async (req, res) => {
    const client = await db.connect();
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, registrationId, eventId } = req.body;
        const userId = req.user.id;

        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'dummy_secret')
            .update(body.toString())
            .digest('hex');

        if (expectedSignature !== razorpay_signature) {
            await client.query("UPDATE \"Registrations\" SET \"paymentStatus\" = 'Failed' WHERE id = $1", [registrationId]);
            return res.status(400).json({ error: 'Invalid payment signature.' });
        }

        await client.query('BEGIN');

        // Check seat availability one last time
        const eventResult = await client.query('SELECT fee, "availableSeats" FROM "Events" WHERE id = $1', [eventId]);
        if (eventResult.rows.length === 0 || eventResult.rows[0].availableSeats <= 0) {
            throw new Error('No seats available for finalizing transaction.');
        }
        const event = eventResult.rows[0];

        // Decrease available seats
        await client.query('UPDATE "Events" SET "availableSeats" = "availableSeats" - 1 WHERE id = $1', [eventId]);

        // Mark registration as success
        await client.query("UPDATE \"Registrations\" SET \"paymentStatus\" = 'Success' WHERE id = $1", [registrationId]);

        // Record the payment
        await client.query(`
            INSERT INTO "Payments" ("registrationId", "userId", "eventId", amount, status, "transactionId", "paymentMethod")
            VALUES ($1, $2, $3, $4, 'Success', $5, 'Razorpay')
        `, [registrationId, userId, eventId, event.fee, razorpay_payment_id]);

        // Store QR data as a plain string (no disk write on Vercel)
        const qrData = JSON.stringify({ registrationId, eventId, type: 'Event_Ticket' });
        await client.query('UPDATE "Registrations" SET "qrCodePath" = $1 WHERE id = $2', [qrData, registrationId]);

        await client.query('COMMIT');

        res.json({
            message: 'Payment verified successfully. Ticket generated.',
            qrCodePath: qrData
        });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Verification Error:', err.message);
        res.status(500).json({ error: err.message || 'Payment verification failed.' });
    } finally {
        if (client) client.release();
    }
});

module.exports = router;
