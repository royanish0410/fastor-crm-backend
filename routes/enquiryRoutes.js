const express = require('express');
const router = express.Router();
const {
  submitEnquiry,
  getUnclaimedEnquiries,
  getMyClaimedEnquiries,
  claimEnquiry,
  getAllEnquiries
} = require('../controllers/enquiryController');
const { protect } = require('../middleware/auth');

// Public route - No authentication required
router.post('/submit', submitEnquiry);

// Protected routes - Authentication required
router.get('/unclaimed', protect, getUnclaimedEnquiries);
router.get('/my-claims', protect, getMyClaimedEnquiries);
router.put('/claim/:id', protect, claimEnquiry);
router.get('/', protect, getAllEnquiries);

module.exports = router;