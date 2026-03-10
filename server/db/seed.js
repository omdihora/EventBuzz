const db = require('./database');
const bcrypt = require('bcryptjs');

// ── Create Tables ──────────────────────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS Users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'Student'
  );

  CREATE TABLE IF NOT EXISTS Clubs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    description TEXT
  );

  CREATE TABLE IF NOT EXISTS Events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    organizerClubId INTEGER,
    date TEXT NOT NULL,
    startTime TEXT NOT NULL,
    endTime TEXT NOT NULL,
    venue TEXT NOT NULL,
    totalSeats INTEGER NOT NULL,
    availableSeats INTEGER NOT NULL,
    fee REAL NOT NULL DEFAULT 0,
    bannerImagePath TEXT,
    createdBy INTEGER,
    FOREIGN KEY (organizerClubId) REFERENCES Clubs(id),
    FOREIGN KEY (createdBy) REFERENCES Users(id)
  );

  CREATE TABLE IF NOT EXISTS Registrations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    eventId INTEGER NOT NULL,
    phone TEXT,
    paymentStatus TEXT NOT NULL DEFAULT 'Pending',
    qrCodePath TEXT,
    attended INTEGER NOT NULL DEFAULT 0,
    createdAt TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (userId) REFERENCES Users(id),
    FOREIGN KEY (eventId) REFERENCES Events(id)
  );

  CREATE TABLE IF NOT EXISTS Payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    registrationId INTEGER NOT NULL,
    userId INTEGER NOT NULL,
    eventId INTEGER NOT NULL,
    amount REAL NOT NULL,
    status TEXT NOT NULL DEFAULT 'Pending',
    paymentMethod TEXT DEFAULT 'Direct',
    transactionId TEXT,
    createdAt TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (registrationId) REFERENCES Registrations(id),
    FOREIGN KEY (userId) REFERENCES Users(id),
    FOREIGN KEY (eventId) REFERENCES Events(id)
  );

  CREATE TABLE IF NOT EXISTS ClubApplications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    clubId INTEGER NOT NULL,
    fullName TEXT NOT NULL,
    enrollmentNumber TEXT NOT NULL,
    department TEXT NOT NULL,
    year TEXT NOT NULL,
    skills TEXT,
    reason TEXT,
    resumePath TEXT,
    status TEXT NOT NULL DEFAULT 'Pending' CHECK(status IN ('Pending', 'Interview', 'Selected', 'Rejected')),
    interviewDate TEXT,
    createdAt TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (userId) REFERENCES Users(id),
    FOREIGN KEY (clubId) REFERENCES Clubs(id)
  );

  CREATE TABLE IF NOT EXISTS VolunteerRoles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    eventId INTEGER NOT NULL,
    roleTitle TEXT NOT NULL,
    description TEXT NOT NULL,
    paymentAmount REAL NOT NULL,
    positionsAvailable INTEGER NOT NULL,
    positionsFilled INTEGER NOT NULL DEFAULT 0,
    createdBy INTEGER NOT NULL,
    FOREIGN KEY (eventId) REFERENCES Events(id),
    FOREIGN KEY (createdBy) REFERENCES Users(id)
  );

  CREATE TABLE IF NOT EXISTS VolunteerApplications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    eventId INTEGER NOT NULL,
    roleId INTEGER NOT NULL,
    fullName TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    department TEXT NOT NULL,
    year TEXT NOT NULL,
    skills TEXT,
    reason TEXT,
    availability TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Pending' CHECK(status IN ('Pending', 'Approved', 'Rejected')),
    appliedAt TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (userId) REFERENCES Users(id),
    FOREIGN KEY (eventId) REFERENCES Events(id),
    FOREIGN KEY (roleId) REFERENCES VolunteerRoles(id)
  );

  CREATE TABLE IF NOT EXISTS VolunteerPayments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    eventId INTEGER NOT NULL,
    roleId INTEGER NOT NULL,
    amount REAL NOT NULL,
    status TEXT NOT NULL DEFAULT 'Pending' CHECK(status IN ('Pending', 'Paid')),
    completedAt TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (userId) REFERENCES Users(id),
    FOREIGN KEY (eventId) REFERENCES Events(id),
    FOREIGN KEY (roleId) REFERENCES VolunteerRoles(id)
  );
`);

// ── Seed Clubs ─────────────────────────────────────────────────
const clubs = [
  { name: 'E-Cell', type: 'Entrepreneurship', description: 'The Entrepreneurship Cell fosters innovation and startup culture on campus.' },
  { name: 'Coding Club', type: 'Technical', description: 'A community of passionate programmers who love solving problems.' },
  { name: 'Robotics Club', type: 'Technical', description: 'Build, program, and compete!' },
  { name: 'AI Club', type: 'Technical', description: 'Exploring the frontiers of AI and Machine Learning.' },
  { name: 'Dance Club', type: 'Cultural', description: 'Express yourself through movement!' },
  { name: 'Music Club', type: 'Cultural', description: 'Uniting musicians across genres.' },
  { name: 'Drama Club', type: 'Cultural', description: 'The stage is our canvas.' },
];

const insertClub = db.prepare('INSERT OR IGNORE INTO Clubs (name, type, description) VALUES (?, ?, ?)');
const existingClubs = db.prepare('SELECT COUNT(*) as count FROM Clubs').get();
if (existingClubs.count === 0) {
  for (const club of clubs) insertClub.run(club.name, club.type, club.description);
  console.log('✅ Seeded 7 clubs');
}

// ── Seed Events ────────────────────────────────────────────────
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

const insertEvent = db.prepare('INSERT OR IGNORE INTO Events (title, description, organizerClubId, date, startTime, endTime, venue, totalSeats, availableSeats, fee, bannerImagePath) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
const existingEvents = db.prepare('SELECT COUNT(*) as count FROM Events').get();
if (existingEvents.count === 0) {
  for (const e of events) insertEvent.run(e.title, e.description, e.organizerClubId, e.date, e.startTime, e.endTime, e.venue, e.totalSeats, e.totalSeats, e.fee, e.bannerImagePath);
  console.log('✅ Seeded 8 events');
}

// ── Seed Admin User ────────────────────────────────────────────
const existingAdmin = db.prepare("SELECT COUNT(*) as count FROM Users WHERE role = 'Admin'").get();
if (existingAdmin.count === 0) {
  const hashedPassword = bcrypt.hashSync('admin123', 10);
  db.prepare('INSERT INTO Users (name, email, password, role) VALUES (?, ?, ?, ?)').run(
    'Admin User', 'admin@eventbuzz.com', hashedPassword, 'Admin'
  );
  console.log('✅ Seeded Admin: admin@eventbuzz.com / admin123');
}

// ── Seed Volunteer Roles ───────────────────────────────────────
const volunteerRoles = [
  { eventId: 1, roleTitle: 'Event Coordinator', description: 'Help manage check-ins, guide participants, and ensure the event runs smoothly.', paymentAmount: 500, positionsAvailable: 5, positionsFilled: 2, createdBy: 1 },
  { eventId: 1, roleTitle: 'Tech Support', description: 'Assist with technical issues, Wi-Fi connectivity, and projector setup during the hackathon.', paymentAmount: 800, positionsAvailable: 3, positionsFilled: 3, createdBy: 1 },
  { eventId: 2, roleTitle: 'Stage Manager', description: 'Coordinate with speakers, manage microphones, and keep the event on schedule.', paymentAmount: 600, positionsAvailable: 2, positionsFilled: 0, createdBy: 1 },
  { eventId: 3, roleTitle: 'Workshop Assistant', description: 'Help attendees with setup and answer basic questions during the AI Workshop.', paymentAmount: 400, positionsAvailable: 4, positionsFilled: 1, createdBy: 1 },
  { eventId: 4, roleTitle: 'Crowd Controller', description: 'Manage the entry gates and ensure discipline during the Cultural Fest Night.', paymentAmount: 700, positionsAvailable: 10, positionsFilled: 4, createdBy: 1 },
  { eventId: 5, roleTitle: 'Decoration Lead', description: 'Lead the team responsible for decorating the venue for Garba Night.', paymentAmount: 1000, positionsAvailable: 2, positionsFilled: 1, createdBy: 1 },
];

const insertVolunteerRole = db.prepare('INSERT INTO VolunteerRoles (eventId, roleTitle, description, paymentAmount, positionsAvailable, positionsFilled, createdBy) VALUES (?, ?, ?, ?, ?, ?, ?)');
const existingVolunteerRoles = db.prepare('SELECT COUNT(*) as count FROM VolunteerRoles').get();
if (existingVolunteerRoles.count === 0) {
  for (const role of volunteerRoles) {
    insertVolunteerRole.run(role.eventId, role.roleTitle, role.description, role.paymentAmount, role.positionsAvailable, role.positionsFilled, role.createdBy);
  }
  console.log('✅ Seeded 6 volunteer roles');
}

console.log('🎉 Database seeding complete!');
process.exit(0);
