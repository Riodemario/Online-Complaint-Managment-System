// Authentication Module (Section 4.4.1)
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

const SALT_ROUNDS = 10;

function signToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '8h',
  });
}

// POST /api/auth/citizen/register  (TC01 / TC02 in Section 4.5.1)
async function registerCitizen(req, res) {
  const { full_name, email, phone_number, national_id, password } = req.body;
  if (!full_name || !email || !phone_number || !password) {
    return res.status(400).json({ error: 'full_name, email, phone_number and password are required' });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters' });
  }

  try {
    const [existing] = await pool.query('SELECT citizen_id FROM citizen WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(409).json({ error: 'Email already registered' }); // TC02
    }

    const password_hash = await bcrypt.hash(password, SALT_ROUNDS);
    const [result] = await pool.query(
      `INSERT INTO citizen (full_name, email, phone_number, national_id, password_hash)
       VALUES (?, ?, ?, ?, ?)`,
      [full_name, email, phone_number, national_id || null, password_hash]
    );

    const token = signToken({ id: result.insertId, role: 'citizen' });
    res.status(201).json({
      token,
      user: { id: result.insertId, full_name, email, role: 'citizen' },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Registration failed' });
  }
}

// POST /api/auth/citizen/login  (TC03)
async function loginCitizen(req, res) {
  const { email, password } = req.body;
  try {
    const [rows] = await pool.query('SELECT * FROM citizen WHERE email = ?', [email]);
    const citizen = rows[0];
    if (!citizen || !(await bcrypt.compare(password, citizen.password_hash))) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = signToken({ id: citizen.citizen_id, role: 'citizen' });
    res.json({
      token,
      user: { id: citizen.citizen_id, full_name: citizen.full_name, email: citizen.email, role: 'citizen' },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Login failed' });
  }
}

// POST /api/auth/officer/login  (used by both officers and administrators;
// the officer.is_admin flag distinguishes the role placed in the JWT)
async function loginOfficer(req, res) {
  const { email, password } = req.body;
  try {
    const [rows] = await pool.query('SELECT * FROM officer WHERE email = ?', [email]);
    const officer = rows[0];
    if (!officer || !(await bcrypt.compare(password, officer.password_hash))) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const role = officer.is_admin ? 'admin' : 'officer';
    const token = signToken({ id: officer.officer_id, role });
    res.json({
      token,
      user: {
        id: officer.officer_id,
        full_name: officer.full_name,
        email: officer.email,
        department_id: officer.department_id,
        role,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Login failed' });
  }
}

module.exports = { registerCitizen, loginCitizen, loginOfficer };
