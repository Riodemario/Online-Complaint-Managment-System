const express = require('express');
const router = express.Router();
const { registerCitizen, loginCitizen, loginOfficer } = require('../controllers/authController');

router.post('/citizen/register', registerCitizen);
router.post('/citizen/login', loginCitizen);
router.post('/officer/login', loginOfficer); // also used by admins (is_admin flag)

module.exports = router;
