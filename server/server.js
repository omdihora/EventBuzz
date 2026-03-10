const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 5000;

// ── Middleware ─────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Note: File uploads are not supported on Vercel serverless (read-only filesystem)
// Use cloud storage (Supabase Storage / Cloudinary) for production file hosting

// ── API Routes ────────────────────────────────────────────────
app.use('/api/auth', require('./routes/auth'));
app.use('/api/events', require('./routes/events'));
app.use('/api/registrations', require('./routes/registrations'));
app.use('/api/clubs', require('./routes/clubs'));
app.use('/api/club-applications', require('./routes/clubApplications'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/volunteer', require('./routes/volunteer'));
app.use('/api/payments', require('./routes/payments'));

// ── Health Check ──────────────────────────────────────────────
app.get('/', (req, res) => {
    res.send(`
        <div style="font-family: system-ui, sans-serif; text-align: center; padding: 50px;">
            <h1>🚀 EventBuzz Backend API</h1>
            <p>The backend server is running successfully!</p>
            <p style="color: #666;">This is just the API. To view the actual website, please go to the frontend development server.</p>
            <a href="http://localhost:5173" style="display: inline-block; background: #e8725c; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 20px;">Open Website (Frontend)</a>
        </div>
    `);
});

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'EventBuzz API is running!' });
});

// ── Start Server ──────────────────────────────────────────────
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log(`\n🚀 EventBuzz Server running on http://localhost:${PORT}`);
        console.log(`📦 API available at http://localhost:${PORT}/api\n`);
    });
}
module.exports = app;
