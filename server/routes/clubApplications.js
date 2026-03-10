const express = require('express');
const db = require('../db/database');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// Note: No disk file uploads on Vercel. Resume link is optional (URL string).

// ── Submit Application (Student) ──────────────────────────────
router.post('/', authenticate, async (req, res) => {
    try {
        const { clubId, fullName, enrollmentNumber, department, year, skills, reason, resumeUrl } = req.body;
        const userId = req.user.id;

        if (!clubId || !fullName || !enrollmentNumber || !department || !year) {
            return res.status(400).json({ error: 'Missing required fields.' });
        }

        // Check if already applied
        const existingResult = await db.query(
            'SELECT id FROM "ClubApplications" WHERE "userId" = $1 AND "clubId" = $2',
            [userId, clubId]
        );
        if (existingResult.rows.length > 0) {
            return res.status(400).json({ error: 'You have already applied to this club.' });
        }

        const resumePath = resumeUrl || null; // Optional URL link, no disk upload

        const result = await db.query(`
      INSERT INTO "ClubApplications" ("userId", "clubId", "fullName", "enrollmentNumber", department, year, skills, reason, "resumePath")
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id
    `, [userId, clubId, fullName, enrollmentNumber, department, year, skills || '', reason || '', resumePath]);

        res.status(201).json({
            message: 'Application submitted successfully!',
            applicationId: result.rows[0].id,
        });
    } catch (err) {
        console.error('Application error:', err);
        res.status(500).json({ error: 'Failed to submit application.' });
    }
});

// ── Get Applications for a Club (ClubAdmin / SuperAdmin) ──────
router.get('/club/:clubId', authenticate, authorize('ClubAdmin', 'SuperAdmin'), async (req, res) => {
    try {
        const applicationsResult = await db.query(`
      SELECT "ClubApplications".*, "Users".email as "userEmail"
      FROM "ClubApplications"
      JOIN "Users" ON "ClubApplications"."userId" = "Users".id
      WHERE "ClubApplications"."clubId" = $1
      ORDER BY "ClubApplications"."createdAt" DESC
    `, [req.params.clubId]);

        res.json({ applications: applicationsResult.rows });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch applications.' });
    }
});

// ── Get My Applications (Student) ─────────────────────────────
router.get('/my', authenticate, async (req, res) => {
    try {
        const applicationsResult = await db.query(`
      SELECT "ClubApplications".*, "Clubs".name as "clubName"
      FROM "ClubApplications"
      JOIN "Clubs" ON "ClubApplications"."clubId" = "Clubs".id
      WHERE "ClubApplications"."userId" = $1
      ORDER BY "ClubApplications"."createdAt" DESC
    `, [req.user.id]);

        res.json({ applications: applicationsResult.rows });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch applications.' });
    }
});

// ── Update Application Status (ClubAdmin / SuperAdmin) ────────
router.put('/:id', authenticate, authorize('ClubAdmin', 'SuperAdmin'), async (req, res) => {
    try {
        const { status, interviewDate } = req.body;
        const appId = req.params.id;

        const existingResult = await db.query('SELECT * FROM "ClubApplications" WHERE id = $1', [appId]);
        if (existingResult.rows.length === 0) {
            return res.status(404).json({ error: 'Application not found.' });
        }
        const existing = existingResult.rows[0];

        await db.query(`
      UPDATE "ClubApplications" SET status = $1, "interviewDate" = $2 WHERE id = $3
    `, [
            status || existing.status,
            interviewDate || existing.interviewDate,
            appId
        ]);

        res.json({ message: 'Application updated successfully!' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to update application.' });
    }
});

module.exports = router;
