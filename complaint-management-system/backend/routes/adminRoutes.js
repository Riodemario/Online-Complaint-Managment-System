const express = require('express');
const router = express.Router();
const { authenticate, requireRole } = require('../middleware/auth');
const { getAllComplaints, reassignComplaint, generateReport, createOfficer } = require('../controllers/adminController');

router.use(authenticate, requireRole('admin'));

router.get('/complaints', getAllComplaints);
router.patch('/complaints/:id/reassign', reassignComplaint);
router.get('/reports', generateReport);
router.post('/officers', createOfficer);

module.exports = router;
