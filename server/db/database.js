const { Pool } = require('pg');
require('dotenv').config();

const db = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false } // Required for Supabase external connections
});

db.on('connect', () => {
    // console.log('🟢 Connected to Supabase PostgreSQL Pool');
});

db.on('error', (err) => {
    console.error('🔴 Supabase Connection Error:', err);
});

module.exports = db;
