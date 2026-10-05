const express = require('express');
const router = express.Router();
const { authenticate, requireRole } = require('../middleware/auth');
const {
  submitComplaint,
  getMyComplaints,
  getComplaintTimeline,
  getAssignedComplaints,
  updateComplaintStatus,
} = require('../controllers/complaintController');

// Citizen-facing (Section 4.4.2 / 4.4.3)
router.post('/', authenticate, requireRole('citizen'), submitComplaint);
router.get('/mine', authenticate, requireRole('citizen'), getMyComplaints);
router.get('/:reference_no/timeline', authenticate, getComplaintTimeline);

// Officer-facing (Section 4.4.4)
router.get('/assigned', authenticate, requireRole('officer'), getAssignedComplaints);
router.patch('/:id/status', authenticate, requireRole('officer'), updateComplaintStatus);

module.exports = router;
