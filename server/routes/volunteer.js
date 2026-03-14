const express = require('express');
const db = require('../db/database');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// ── VOLUNTEER ROLES ────────────────────────────────────────────

// Get all volunteer roles (Public) - can filter by eventId via query ?eventId=1
router.get('/roles', async (req, res) => {
    try {
        let query = `
            SELECT VR.*, E.title as "eventTitle", E.date as "eventDate", E.venue as "eventVenue", "Clubs".name as "organizerClub" 
            FROM "VolunteerRoles" VR
            JOIN "Events" E ON VR."eventId" = E.id
            LEFT JOIN "Clubs" ON E."organizerClubId" = "Clubs".id
        `;
        const params = [];

        if (req.query.eventId) {
            params.push(req.query.eventId);
            query += ` WHERE VR."eventId" = $${params.length}`;
        }

        query += ` ORDER BY E.date ASC`;

        const result = await db.query(query, params);
        res.json({ roles: result.rows });
    } catch (err) {
        console.error('Get volunteer roles error:', err);
        res.status(500).json({ error: 'Failed to fetch volunteer roles.' });
    }
});

// Create a volunteer role (Admin only)
router.post('/roles', authenticate, authorize('Admin'), async (req, res) => {
    try {
        const { eventId, roleTitle, description, paymentAmount, positionsAvailable } = req.body;

        if (!eventId || !roleTitle || !description || paymentAmount === undefined || !positionsAvailable) {
            return res.status(400).json({ error: 'Missing required fields.' });
        }

        const result = await db.query(`
            INSERT INTO "VolunteerRoles" ("eventId", "roleTitle", description, "paymentAmount", "positionsAvailable", "createdBy")
            VALUES ($1, $2, $3, $4, $5, $6) RETURNING id
        `, [eventId, roleTitle, description, paymentAmount, positionsAvailable, req.user.id]);

        res.status(201).json({
            message: 'Volunteer role created successfully!',
            roleId: result.rows[0].id,
        });
    } catch (err) {
        console.error('Create volunteer role error:', err);
        res.status(500).json({ error: 'Failed to create volunteer role.' });
    }
});

// Delete a volunteer role (Admin only)
router.delete('/roles/:id', authenticate, authorize('Admin'), async (req, res) => {
    const client = await db.connect();
    try {
        const roleId = req.params.id;
        const existing = await client.query('SELECT id FROM "VolunteerRoles" WHERE id = $1', [roleId]);
        if (existing.rows.length === 0) {
            client.release();
            return res.status(404).json({ error: 'Volunteer role not found.' });
        }
        await client.query('BEGIN');
        await client.query('DELETE FROM "VolunteerPayments" WHERE "roleId" = $1', [roleId]);
        await client.query('DELETE FROM "VolunteerApplications" WHERE "roleId" = $1', [roleId]);
        await client.query('DELETE FROM "VolunteerRoles" WHERE id = $1', [roleId]);
        await client.query('COMMIT');
        res.json({ message: 'Volunteer role deleted successfully.' });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Delete volunteer role error:', err);
        res.status(500).json({ error: 'Failed to delete volunteer role.' });
    } finally {
        client.release();
    }
});

// ── VOLUNTEER APPLICATIONS ─────────────────────────────────────

// Apply for a volunteer role (Student)
router.post('/apply', authenticate, async (req, res) => {
    try {
        const { eventId, roleId, fullName, email, phone, department, year, skills, reason, availability } = req.body;

        if (!eventId || !roleId || !fullName || !email || !phone || !department || !year || !availability) {
            return res.status(400).json({ error: 'Missing required fields.' });
        }

        // Check if already applied
        const existingResult = await db.query(`SELECT id FROM "VolunteerApplications" WHERE "userId" = $1 AND "roleId" = $2`, [req.user.id, roleId]);
        if (existingResult.rows.length > 0) {
            return res.status(400).json({ error: 'You have already applied for this role.' });
        }

        const result = await db.query(`
            INSERT INTO "VolunteerApplications" ("userId", "eventId", "roleId", "fullName", email, phone, department, year, skills, reason, availability)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING id
        `, [req.user.id, eventId, roleId, fullName, email, phone, department, year, skills || '', reason || '', availability]);

        res.status(201).json({
            message: 'Application submitted successfully!',
            applicationId: result.rows[0].id,
        });
    } catch (err) {
        console.error('Apply volunteer error:', err);
        res.status(500).json({ error: 'Failed to submit application.' });
    }
});

// Get my volunteer applications (Student)
router.get('/applications/me', authenticate, async (req, res) => {
    try {
        const applicationsResult = await db.query(`
            SELECT VA.*, VR."roleTitle", VR."paymentAmount", E.title as "eventTitle", E.date as "eventDate"
            FROM "VolunteerApplications" VA
            JOIN "VolunteerRoles" VR ON VA."roleId" = VR.id
            JOIN "Events" E ON VA."eventId" = E.id
            WHERE VA."userId" = $1
            ORDER BY VA."appliedAt" DESC
        `, [req.user.id]);
        res.json({ applications: applicationsResult.rows });
    } catch (err) {
        console.error('Get my applications error:', err);
        res.status(500).json({ error: 'Failed to fetch applications.' });
    }
});

// Get all volunteer applications (Admin)
router.get('/applications', authenticate, authorize('Admin'), async (req, res) => {
    try {
        const applicationsResult = await db.query(`
            SELECT VA.*, VR."roleTitle", E.title as "eventTitle"
            FROM "VolunteerApplications" VA
            JOIN "VolunteerRoles" VR ON VA."roleId" = VR.id
            JOIN "Events" E ON VA."eventId" = E.id
            ORDER BY VA."appliedAt" DESC
        `);
        res.json({ applications: applicationsResult.rows });
    } catch (err) {
        console.error('Get all applications error:', err);
        res.status(500).json({ error: 'Failed to fetch applications.' });
    }
});

// Update application status (Admin)
router.put('/applications/:id/status', authenticate, authorize('Admin'), async (req, res) => {
    const client = await db.connect();
    try {
        const { status } = req.body;
        const applicationId = req.params.id;

        if (!['Pending', 'Approved', 'Rejected'].includes(status)) {
            client.release();
            return res.status(400).json({ error: 'Invalid status.' });
        }

        const appResult = await client.query(`SELECT * FROM "VolunteerApplications" WHERE id = $1`, [applicationId]);
        if (appResult.rows.length === 0) {
            client.release();
            return res.status(404).json({ error: 'Application not found.' });
        }
        const app = appResult.rows[0];

        await client.query('BEGIN');

        // Update status
        await client.query(`UPDATE "VolunteerApplications" SET status = $1 WHERE id = $2`, [status, applicationId]);

        // If newly approved, increment positionsFilled. If changing from approved to something else, decrement.
        if (status === 'Approved' && app.status !== 'Approved') {
            await client.query(`UPDATE "VolunteerRoles" SET "positionsFilled" = "positionsFilled" + 1 WHERE id = $1`, [app.roleId]);
        } else if (app.status === 'Approved' && status !== 'Approved') {
            await client.query(`UPDATE "VolunteerRoles" SET "positionsFilled" = "positionsFilled" - 1 WHERE id = $1`, [app.roleId]);
        }

        await client.query('COMMIT');

        res.json({ message: `Application ${status.toLowerCase()} successfully.` });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Update application status error:', err);
        res.status(500).json({ error: 'Failed to update status.' });
    } finally {
        if (client) client.release();
    }
});

// ── VOLUNTEER PAYMENTS ─────────────────────────────────────────

// Mark role as completed and create payment record (Admin)
router.post('/completed', authenticate, authorize('Admin'), async (req, res) => {
    try {
        const { userId, eventId, roleId, amount } = req.body;

        if (!userId || !eventId || !roleId || amount === undefined) {
            return res.status(400).json({ error: 'Missing required fields.' });
        }

        // Check if payment record already exists
        const existingResult = await db.query(`SELECT id FROM "VolunteerPayments" WHERE "userId" = $1 AND "roleId" = $2`, [userId, roleId]);
        if (existingResult.rows.length > 0) {
            return res.status(400).json({ error: 'Completion record already exists for this user and role.' });
        }

        const result = await db.query(`
            INSERT INTO "VolunteerPayments"("userId", "eventId", "roleId", amount)
            VALUES($1, $2, $3, $4) RETURNING id
        `, [userId, eventId, roleId, amount]);

        res.status(201).json({
            message: 'Volunteer marked as completed. Payment record created.',
            paymentId: result.rows[0].id,
        });
    } catch (err) {
        console.error('Mark volunteer completed error:', err);
        res.status(500).json({ error: 'Failed to record completion.' });
    }
});

// Get my payments (Student)
router.get('/payments/me', authenticate, async (req, res) => {
    try {
        const paymentsResult = await db.query(`
            SELECT VP.*, VR."roleTitle", E.title as "eventTitle", E.date as "eventDate"
            FROM "VolunteerPayments" VP
            JOIN "VolunteerRoles" VR ON VP."roleId" = VR.id
            JOIN "Events" E ON VP."eventId" = E.id
            WHERE VP."userId" = $1
            ORDER BY VP."completedAt" DESC
        `, [req.user.id]);
        res.json({ payments: paymentsResult.rows });
    } catch (err) {
        console.error('Get my payments error:', err);
        res.status(500).json({ error: 'Failed to fetch payments.' });
    }
});

// Get all payments (Admin)
router.get('/payments', authenticate, authorize('Admin'), async (req, res) => {
    try {
        const paymentsResult = await db.query(`
            SELECT VP.*, VR."roleTitle", E.title as "eventTitle", U.name as "userName", U.email as "userEmail"
            FROM "VolunteerPayments" VP
            JOIN "VolunteerRoles" VR ON VP."roleId" = VR.id
            JOIN "Events" E ON VP."eventId" = E.id
            JOIN "Users" U ON VP."userId" = U.id
            ORDER BY VP."completedAt" DESC
        `);
        res.json({ payments: paymentsResult.rows });
    } catch (err) {
        console.error('Get all payments error:', err);
        res.status(500).json({ error: 'Failed to fetch payments.' });
    }
});

// Update payment status (Admin)
router.put('/payments/:id/status', authenticate, authorize('Admin'), async (req, res) => {
    try {
        const { status } = req.body;
        const paymentId = req.params.id;

        if (!['Pending', 'Paid'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status.' });
        }

        await db.query(`UPDATE "VolunteerPayments" SET status = $1 WHERE id = $2`, [status, paymentId]);
        res.json({ message: `Payment marked as ${status}.` });
    } catch (err) {
        console.error('Update payment status error:', err);
        res.status(500).json({ error: 'Failed to update payment status.' });
    }
});

module.exports = router;
