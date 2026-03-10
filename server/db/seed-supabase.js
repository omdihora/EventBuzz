const db = require('./database');
const bcrypt = require('bcryptjs');

async function seed() {
    try {
        console.log('🌱 Generating Supabase Seed Data...');

        // 1. Seed Clubs
        const clubs = [
            { name: 'E-Cell', type: 'Entrepreneurship', description: 'The Entrepreneurship Cell fosters innovation and startup culture on campus.' },
            { name: 'Coding Club', type: 'Technical', description: 'A community of passionate programmers who love solving problems.' },
            { name: 'Robotics Club', type: 'Technical', description: 'Build, program, and compete!' },
            { name: 'AI Club', type: 'Technical', description: 'Exploring the frontiers of AI and Machine Learning.' },
            { name: 'Dance Club', type: 'Cultural', description: 'Express yourself through movement!' },
            { name: 'Music Club', type: 'Cultural', description: 'Uniting musicians across genres.' },
            { name: 'Drama Club', type: 'Cultural', description: 'The stage is our canvas.' },
        ];

        const existingClubs = await db.query('SELECT COUNT(*) as count FROM "Clubs"');
        if (parseInt(existingClubs.rows[0].count) === 0) {
            for (const club of clubs) {
                await db.query('INSERT INTO "Clubs" (name, type, description) VALUES ($1, $2, $3)', [club.name, club.type, club.description]);
            }
            console.log('✅ Seeded 7 clubs');
        }

        // 2. Seed Admin User
        const existingAdmin = await db.query('SELECT COUNT(*) as count FROM "Users" WHERE role = $1', ['Admin']);
        if (parseInt(existingAdmin.rows[0].count) === 0) {
            const hashedPassword = bcrypt.hashSync('admin123', 10);
            await db.query('INSERT INTO "Users" (name, email, password, role) VALUES ($1, $2, $3, $4)',
                ['Admin User', 'admin@eventbuzz.com', hashedPassword, 'Admin']);
            console.log('✅ Seeded Admin: admin@eventbuzz.com / admin123');
        }

        // 3. Seed Events
        const events = [
            { title: 'Tech Hackathon', description: 'A 24-hour coding marathon where teams build innovative solutions.', organizerClubId: 2, date: '2026-03-15', startTime: '09:00 AM', endTime: '09:00 AM (Next Day)', venue: 'Main Auditorium & Labs', totalSeats: 200, fee: 150, bannerImagePath: '/banners/hackathon.jpg' },
            { title: 'Startup Pitch Competition', description: 'Pitch your startup idea to investors and experts.', organizerClubId: 1, date: '2026-03-22', startTime: '10:00 AM', endTime: '04:00 PM', venue: 'Seminar Hall A', totalSeats: 100, fee: 100, bannerImagePath: '/banners/pitch.jpg' },
            { title: 'AI Workshop', description: 'Hands-on workshop on building AI applications.', organizerClubId: 4, date: '2026-04-05', startTime: '10:00 AM', endTime: '01:00 PM', venue: 'Computer Lab 3', totalSeats: 60, fee: 200, bannerImagePath: '/banners/ai-workshop.jpg' },
            { title: 'Cultural Fest Night', description: 'Live music, dance performances, drama acts, and DJ night.', organizerClubId: 5, date: '2026-04-12', startTime: '05:00 PM', endTime: '11:00 PM', venue: 'Open Air Theatre', totalSeats: 500, fee: 250, bannerImagePath: '/banners/cultural-fest.jpg' },
            { title: 'Garba Night', description: 'Celebrate Navratri with a vibrant Garba Night!', organizerClubId: 5, date: '2026-04-18', startTime: '07:00 PM', endTime: '11:30 PM', venue: 'Central Ground', totalSeats: 800, fee: 300, bannerImagePath: '/banners/garba.jpg' },
            { title: 'Coding Marathon', description: '6-hour coding challenge with competitive leaderboard.', organizerClubId: 2, date: '2026-05-03', startTime: '10:00 AM', endTime: '04:00 PM', venue: 'Computer Lab 1 & 2', totalSeats: 150, fee: 50, bannerImagePath: '/banners/coding-marathon.jpg' },
            { title: 'Photography Contest', description: 'Submit your best photographs across categories.', organizerClubId: 6, date: '2026-05-10', startTime: '09:00 AM', endTime: '06:00 PM', venue: 'Art Gallery', totalSeats: 80, fee: 75, bannerImagePath: '/banners/photography.jpg' },
            { title: 'Business Quiz', description: 'Fast-paced business quiz competition.', organizerClubId: 1, date: '2026-05-17', startTime: '02:00 PM', endTime: '05:00 PM', venue: 'Seminar Hall B', totalSeats: 120, fee: 50, bannerImagePath: '/banners/business-quiz.jpg' },
        ];

        const existingEvents = await db.query('SELECT COUNT(*) as count FROM "Events"');
        if (parseInt(existingEvents.rows[0].count) === 0) {
            for (const e of events) {
                await db.query(`
                    INSERT INTO "Events" (title, description, "organizerClubId", date, "startTime", "endTime", venue, "totalSeats", "availableSeats", fee, "bannerImagePath", "createdBy") 
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 1)
                `, [e.title, e.description, e.organizerClubId, e.date, e.startTime, e.endTime, e.venue, e.totalSeats, e.totalSeats, e.fee, e.bannerImagePath]);
            }
            console.log('✅ Seeded 8 events');
        }

        // 4. Seed Volunteer Roles
        const volunteerRoles = [
            { eventId: 1, roleTitle: 'Event Coordinator', description: 'Help manage check-ins, guide participants, and ensure the event runs smoothly.', paymentAmount: 500, positionsAvailable: 5, positionsFilled: 2, createdBy: 1 },
            { eventId: 1, roleTitle: 'Tech Support', description: 'Assist with technical issues, Wi-Fi connectivity, and projector setup during the hackathon.', paymentAmount: 800, positionsAvailable: 3, positionsFilled: 3, createdBy: 1 },
            { eventId: 2, roleTitle: 'Stage Manager', description: 'Coordinate with speakers, manage microphones, and keep the event on schedule.', paymentAmount: 600, positionsAvailable: 2, positionsFilled: 0, createdBy: 1 },
            { eventId: 3, roleTitle: 'Workshop Assistant', description: 'Help attendees with setup and answer basic questions during the AI Workshop.', paymentAmount: 400, positionsAvailable: 4, positionsFilled: 1, createdBy: 1 },
            { eventId: 4, roleTitle: 'Crowd Controller', description: 'Manage the entry gates and ensure discipline during the Cultural Fest Night.', paymentAmount: 700, positionsAvailable: 10, positionsFilled: 4, createdBy: 1 },
            { eventId: 5, roleTitle: 'Decoration Lead', description: 'Lead the team responsible for decorating the venue for Garba Night.', paymentAmount: 1000, positionsAvailable: 2, positionsFilled: 1, createdBy: 1 },
        ];

        const existingVRoles = await db.query('SELECT COUNT(*) as count FROM "VolunteerRoles"');
        if (parseInt(existingVRoles.rows[0].count) === 0) {
            for (const role of volunteerRoles) {
                await db.query(`
                    INSERT INTO "VolunteerRoles" ("eventId", "roleTitle", description, "paymentAmount", "positionsAvailable", "positionsFilled", "createdBy") 
                    VALUES ($1, $2, $3, $4, $5, $6, $7)
                `, [role.eventId, role.roleTitle, role.description, role.paymentAmount, role.positionsAvailable, role.positionsFilled, role.createdBy]);
            }
            console.log('✅ Seeded 6 volunteer roles');
        }

        console.log('🎉 Supabase Seeding Complete!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Seeding Error:', err);
        process.exit(1);
    }
}

seed();
