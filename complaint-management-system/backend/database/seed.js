// Run with: npm run seed
// Creates one System Administrator account so you can log in for the first time.
require('dotenv').config();
const bcrypt = require('bcrypt');
const pool = require('../config/db');

async function seed() {
  const [depts] = await pool.query('SELECT * FROM department LIMIT 1');
  const dept_id = depts[0]?.dept_id;
  if (!dept_id) {
    console.error('No departments found - run schema.sql first.');
    process.exit(1);
  }

  const email = 'admin@county.go.ke';
  const password = 'ChangeMe123!';
  const password_hash = await bcrypt.hash(password, 10);

  await pool.query(
    `INSERT INTO officer (full_name, email, department_id, password_hash, is_admin)
     VALUES ('System Administrator', ?, ?, ?, TRUE)
     ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash)`,
    [email, dept_id, password_hash]
  );

  console.log(`Admin account ready -> email: ${email}  password: ${password}`);
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
