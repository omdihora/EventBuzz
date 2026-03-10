# 🚀 EventBuzz

EventBuzz is a modern, full-stack college event management platform that allows students to register for events, apply to clubs, and volunteer, while providing administrators with powerful dashboards to manage the entire ecosystem.

## 📂 Project Structure

This project follows a standard **Monorepo** structure, perfectly separating the user interface from the database logic.

```text
EVBZ/
│
├── client/       # 🎨 FRONTEND (React + Vite)
│   ├── src/
│   │   ├── components/  # Reusable UI parts (Navbar, Modals, 3D Canvas)
│   │   ├── pages/       # Full web pages (Home, Dashboard, Events)
│   │   └── services/    # API connection logic (axios)
│   └── package.json     # Frontend dependencies
│
├── server/       # ⚙️ BACKEND (Node.js + Express)
│   ├── db/              # SQLite Database and seeding scripts
│   ├── middleware/      # Security guards for routes (JWT Auth)
│   ├── routes/          # API endpoints (Auth, Events, Payments)
│   ├── uploads/         # Saved QR codes and User Resumes
│   └── server.js        # Main backend entry point
│
└── package.json  # 🚀 ROOT PACKAGE (Manage both sides at once)
```

---

## 🎨 Frontend Technologies (`/client`)
The **Frontend** is what the user sees and clicks in their browser.
*   **React (Vite):** The core framework used to build fast, interactive user interfaces.
*   **Tailwind CSS:** Used for all styling, creating the dark/light mode themes, and glassy UI effects.
*   **React Router:** Handles navigating between different pages without reloading the browser.
*   **Three.js / React Three Fiber:** Powers the immersive 3D Globe seen on the Clubs page.
*   **Axios:** The library used to send HTTP requests to the backend API.

## ⚙️ Backend Technologies (`/server`)
The **Backend** is the hidden engine that stores data securely and processes business logic.
*   **Node.js & Express:** The server environment that hosts the API and listens for frontend requests.
*   **SQLite (`better-sqlite3`):** A lightweight, file-based SQL database that permanently stores Users, Events, Clubs, and Tickets.
*   **JSON Web Tokens (JWT):** Used for secure authentication so the server knows who is logged in.
*   **Razorpay SDK:** Integrates with India's most popular payment gateway to securely process event ticketing fees.
*   **Multer:** Handles file formatting when students upload their PDF resumes.
*   **QRCode:** Automatically generates unique ticket QR codes when a student successfully registers or pays.

---

## 🏃‍♂️ How to Run the App Easily
You no longer need to open two separate terminals! Thanks to the new root structure, you can run everything at once:

1. Open a single terminal in the `EVBZ` root folder.
2. Run this command to install dependencies for both sides (only needed once):
   ```bash
   npm run install-all
   ```
3. Run this command to start both the Frontend and Backend simultaneously:
   ```bash
   npm run dev
   ```

*   **Frontend Website:** `http://localhost:5173`
*   **Backend API:** `http://localhost:5000`
