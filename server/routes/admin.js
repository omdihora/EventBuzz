const express = require('express');
const db = require('../db/database');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate, authorize('Admin'));

// ── Dashboard Stats ───────────────────────────────────────────
router.get('/stats', async (req, res) => {
    try {
        const totalEvents = (await db.query('SELECT COUNT(*) as count FROM "Events"')).rows[0].count;
        const totalRegistrations = (await db.query('SELECT COUNT(*) as count FROM "Registrations"')).rows[0].count;
        const totalRevenue = (await db.query('SELECT COALESCE(SUM(amount), 0) as total FROM "Payments" WHERE status = \'Success\'')).rows[0].total;
        const totalSeats = (await db.query('SELECT COALESCE(SUM("availableSeats"), 0) as total FROM "Events"')).rows[0].total;
        const paidCount = (await db.query('SELECT COUNT(*) as count FROM "Payments" WHERE status = \'Success\'')).rows[0].count;
        const pendingCount = (await db.query('SELECT COUNT(*) as count FROM "Payments" WHERE status = \'Pending\'')).rows[0].count;

        res.json({
            stats: {
                totalEvents: parseInt(totalEvents),
                totalRegistrations: parseInt(totalRegistrations),
                totalRevenue: parseFloat(totalRevenue),
                availableSeats: parseInt(totalSeats),
                paidCount: parseInt(paidCount),
                pendingCount: parseInt(pendingCount),
            }
        });
    } catch (err) {
        console.error('Stats error:', err);
        res.status(500).json({ error: 'Failed to fetch stats.' });
    }
});

// ── All Registrations (with filters) ──────────────────────────
router.get('/registrations', async (req, res) => {
    try {
        const { eventId, paymentStatus, dateFrom, dateTo } = req.query;

        let query = `
            SELECT 
                "Registrations".id as "registrationId",
                "Users".name as "studentName",
                "Users".email as "studentEmail",
                "Events".title as "eventName",
                "Events".date as "eventDate",
                "Registrations"."paymentStatus",
                "Registrations"."qrCodePath",
                "Registrations"."createdAt" as "registrationDate",
                "Registrations".attended,
                "Registrations".phone,
                "Events".fee
            FROM "Registrations"
            JOIN "Users" ON "Registrations"."userId" = "Users".id
            JOIN "Events" ON "Registrations"."eventId" = "Events".id
            WHERE 1=1
        `;
        const params = [];

        if (eventId) {
            params.push(eventId);
            query += ` AND "Registrations"."eventId" = $${params.length}`;
        }
        if (paymentStatus) {
            params.push(paymentStatus);
            query += ` AND "Registrations"."paymentStatus" = $${params.length}`;
        }
        if (dateFrom) {
            params.push(dateFrom);
            query += ` AND "Registrations"."createdAt" >= $${params.length}`;
        }
        if (dateTo) {
            params.push(dateTo + ' 23:59:59');
            query += ` AND "Registrations"."createdAt" <= $${params.length}`;
        }

        query += ' ORDER BY "Registrations"."createdAt" DESC';

        const result = await db.query(query, params);
        res.json({ registrations: result.rows });
    } catch (err) {
        console.error('Get registrations error:', err);
        res.status(500).json({ error: 'Failed to fetch registrations.' });
    }
});

// ── Export Registrations as CSV ─────────────────────────────
// NOTE: This MUST be defined BEFORE /registrations/:id/attendance
// so Express doesn't match 'export' as an :id value.
router.get('/registrations/export', async (req, res) => {
    try {
        const { eventId, paymentStatus } = req.query;

        let query = `
            SELECT 
                "Registrations".id as "Registration ID",
                "Users".name as "Student Name",
                "Users".email as "Email",
                "Events".title as "Event Name",
                "Registrations".phone as "Phone",
                "Registrations"."paymentStatus" as "Payment Status",
                "Registrations".attended as "Attended",
                "Registrations"."createdAt" as "Registration Date"
            FROM "Registrations"
            JOIN "Users" ON "Registrations"."userId" = "Users".id
            JOIN "Events" ON "Registrations"."eventId" = "Events".id
            WHERE 1=1
        `;
        const params = [];

        if (eventId) {
            params.push(eventId);
            query += ` AND "Registrations"."eventId" = $${params.length}`;
        }
        if (paymentStatus) {
            params.push(paymentStatus);
            query += ` AND "Registrations"."paymentStatus" = $${params.length}`;
        }

        query += ' ORDER BY "Registrations"."createdAt" DESC';

        const result = await db.query(query, params);
        const rows = result.rows;

        if (rows.length === 0) {
            return res.status(404).json({ error: 'No registrations found.' });
        }

        const headers = Object.keys(rows[0]);
        const csvLines = [headers.join(',')];
        for (const row of rows) {
            const values = headers.map(h => {
                const val = String(row[h] ?? '').replace(/"/g, '""');
                return `"${val}"`;
            });
            csvLines.push(values.join(','));
        }

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=registrations.csv');
        res.send(csvLines.join('\n'));
    } catch (err) {
        console.error('Export error:', err);
        res.status(500).json({ error: 'Failed to export registrations.' });
    }
});

// ── Toggle Attendance ─────────────────────────────────────────
router.put('/registrations/:id/attendance', async (req, res) => {
    try {
        const regResult = await db.query('SELECT * FROM "Registrations" WHERE id = $1', [req.params.id]);
        if (regResult.rows.length === 0) {
            return res.status(404).json({ error: 'Registration not found.' });
        }
        const reg = regResult.rows[0];

        const newAttended = reg.attended ? 0 : 1;
        await db.query('UPDATE "Registrations" SET attended = $1 WHERE id = $2', [newAttended, req.params.id]);

        res.json({ message: 'Attendance updated.', attended: newAttended });
    } catch (err) {
        console.error('Toggle attendance error:', err);
        res.status(500).json({ error: 'Failed to update attendance.' });
    }
});

// ── Revenue Dashboard ─────────────────────────────────────────
router.get('/revenue', async (req, res) => {
    try {
        // Overall stats
        const totalRevenue = (await db.query("SELECT COALESCE(SUM(amount), 0) as total FROM \"Payments\" WHERE status = 'Success'")).rows[0].total;
        const totalRegistrations = (await db.query('SELECT COUNT(*) as count FROM "Registrations"')).rows[0].count;
        const paidCount = (await db.query("SELECT COUNT(*) as count FROM \"Payments\" WHERE status = 'Success'")).rows[0].count;
        const pendingCount = (await db.query("SELECT COUNT(*) as count FROM \"Payments\" WHERE status = 'Pending'")).rows[0].count;

        // Per-event revenue
        const perEventResult = await db.query(`
            SELECT 
                "Events".id as "eventId",
                "Events".title as "eventName",
                "Events".fee,
                "Events"."totalSeats",
                "Events"."availableSeats",
                COUNT("Registrations".id) as "registrationCount",
                COALESCE(SUM(CASE WHEN "Payments".status = 'Success' THEN "Payments".amount ELSE 0 END), 0) as revenue,
                COUNT(CASE WHEN "Payments".status = 'Success' THEN 1 END) as "paidCount",
                COUNT(CASE WHEN "Payments".status = 'Pending' THEN 1 END) as "pendingCount"
            FROM "Events"
            LEFT JOIN "Registrations" ON "Events".id = "Registrations"."eventId"
            LEFT JOIN "Payments" ON "Registrations".id = "Payments"."registrationId"
            GROUP BY "Events".id
            ORDER BY revenue DESC
        `);

        res.json({
            revenue: {
                totalRevenue: parseFloat(totalRevenue),
                totalRegistrations: parseInt(totalRegistrations),
                paidCount: parseInt(paidCount),
                pendingCount: parseInt(pendingCount),
                perEvent: perEventResult.rows.map(row => ({
                    ...row,
                    fee: parseFloat(row.fee),
                    totalSeats: parseInt(row.totalSeats),
                    availableSeats: parseInt(row.availableSeats),
                    registrationCount: parseInt(row.registrationCount),
                    revenue: parseFloat(row.revenue),
                    paidCount: parseInt(row.paidCount),
                    pendingCount: parseInt(row.pendingCount)
                })),
            }
        });
    } catch (err) {
        console.error('Revenue error:', err);
        res.status(500).json({ error: 'Failed to fetch revenue data.' });
    }
});

module.exports = router;
