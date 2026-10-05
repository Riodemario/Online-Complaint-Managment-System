# Online Public Complaint Management System for County Governments in Kenya

A full-stack web app that lets citizens submit and track complaints about county
services, lets officers respond to complaints assigned to their department, and gives
administrators reporting and reassignment tools. Built as a JKUAT project
(Diploma in Information Technology).

## Features
- **Citizens:** register, log in, submit complaints (get a reference number), track status
- **Officers:** see complaints assigned to their department and update their status
- **Administrators:** reassign complaints, view complaint volumes and officer performance
- **Notifications:** SMS (Africa's Talking) and email (Nodemailer) on submission and status change
- **Security:** JWT authentication, bcrypt password hashing, role-based access

## Tech stack
React (Vite) + Tailwind CSS | Node.js + Express | MySQL | JWT + bcrypt

## Prerequisites
Node.js 18+, npm, and MySQL 8 running locally.

## Project layout

```
project/
├── backend/                      # Logic Layer (Node.js + Express)
│   ├── server.js                 # App entry point, mounts routes
│   ├── config/
│   │   └── db.js                 # MySQL connection pool
│   ├── controllers/
│   │   ├── authController.js     # Registration + login (Section 4.4.1)
│   │   ├── complaintController.js# Submission, tracking, officer updates (4.4.2-4.4.4)
│   │   └── adminController.js    # Reassignment, reporting (4.4.5)
│   ├── middleware/
│   │   └── auth.js               # JWT verification + role guard
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── complaintRoutes.js
│   │   └── adminRoutes.js
│   ├── utils/
│   │   └── notify.js             # Africa's Talking SMS + Nodemailer email
│   ├── database/
│   │   ├── schema.sql            # CITIZEN, DEPARTMENT, OFFICER, COMPLAINT, RESPONSE
│   │   └── seed.js               # Creates the first admin account
│   ├── package.json
│   └── .env.example
│
└── frontend/                      # Presentation Layer (React + Tailwind)
    ├── index.html
    ├── vite.config.js
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── package.json
    └── src/
        ├── main.jsx               # App bootstrap (Router + AuthProvider)
        ├── App.jsx                # Route table, nav bar
        ├── index.css              # Tailwind directives
        ├── api/client.js          # Axios instance, attaches JWT
        ├── context/AuthContext.jsx# Login/register/logout for all 3 roles
        ├── components/ProtectedRoute.jsx
        └── pages/
            ├── Login.jsx
            ├── Register.jsx
            ├── citizen/
            │   ├── Dashboard.jsx       # Track complaints (4.4.3)
            │   └── SubmitComplaint.jsx # Submission form (4.4.2)
            ├── officer/
            │   └── OfficerDashboard.jsx# Assigned complaints, status updates (4.4.4)
            └── admin/
                └── AdminDashboard.jsx  # Volumes, officer performance (4.4.5)
```

## How to build and run it

### 1. Database
```bash
mysql -u root -p < backend/database/schema.sql
```

### 2. Backend API
```bash
cd backend
cp .env.example .env      # fill in DB credentials, JWT_SECRET, Africa's Talking + SMTP keys
npm install
npm run seed               # creates admin@county.go.ke / ChangeMe123!
npm run dev                 # http://localhost:5000
```

### 3. Frontend
```bash
cd frontend
npm install
npm run dev                 # http://localhost:5173
```

The frontend expects the API at `http://localhost:5000/api` by default; override with
a `VITE_API_URL` env variable if you deploy the backend elsewhere (e.g. Railway/Render,
as noted in Table 4.1).

### 4. Try it out
- Register as a citizen at `/register`, submit a complaint, and watch it appear
  (with a generated reference number) on your dashboard.
- Log in as the seeded admin (Officer/Admin tab) to see the reporting dashboard,
  or use `POST /api/admin/officers` to create officer accounts per department.
- Africa's Talking and SMTP credentials must be real for SMS/email to actually send;
  without them the app still works, notifications just fail silently (logged to console).

## Notes on scope
This mirrors exactly what's specified in Section 4.3 (five tables), 4.4 (five modules),
and the JWT/bcrypt/RESTful choices in Section 4.2 — it's a functional starting point,
not a production hardened deployment. Before going further: add rate limiting, input
sanitization beyond basic checks, HTTPS termination, photo upload storage (e.g. S3),
and automated tests around the ten test cases in Table 4.2.

## Security notes
- Never commit `backend/.env`; it is git-ignored. Copy `.env.example` and fill in your own values.
- The seed script creates a default admin (`admin@county.go.ke` / `ChangeMe123!`).
  Change this password immediately after first login, and never keep it on a public deployment.

## License
MIT - see [LICENSE](LICENSE).
