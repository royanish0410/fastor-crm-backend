const Enquiry = require('../models/Enquiry');

exports.submitEnquiry = async (req, res) => {
  try {
    const { name, email, phone, courseInterest, message } = req.body;

    // Create enquiry
    const enquiry = await Enquiry.create({
      name,
      email,
      phone,
      courseInterest,
      message
    });

    res.status(201).json({
      success: true,
      message: 'Enquiry submitted successfully',
      data: enquiry
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all unclaimed enquiries (Public enquiries)
// @route   GET /api/enquiries/unclaimed
// @access  Private (Authenticated employees only)
exports.getUnclaimedEnquiries = async (req, res) => {
  try {
    const enquiries = await Enquiry.find({ status: 'public' })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: enquiries.length,
      data: enquiries
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get enquiries claimed by logged in employee
// @route   GET /api/enquiries/my-claims
// @access  Private (Authenticated employees only)
exports.getMyClaimedEnquiries = async (req, res) => {
  try {
    const enquiries = await Enquiry.find({
      claimedBy: req.employee._id,
      status: 'claimed'
    })
      .sort({ claimedAt: -1 })
      .populate('claimedBy', 'name email');

    res.status(200).json({
      success: true,
      count: enquiries.length,
      data: enquiries
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Claim an enquiry
// @route   PUT /api/enquiries/claim/:id
// @access  Private (Authenticated employees only)
exports.claimEnquiry = async (req, res) => {
  try {
    const enquiry = await Enquiry.findById(req.params.id);

    // Check if enquiry exists
    if (!enquiry) {
      return res.status(404).json({
        success: false,
        message: 'Enquiry not found'
      });
    }

    // Check if enquiry is already claimed
    if (enquiry.status === 'claimed') {
      return res.status(400).json({
        success: false,
        message: 'This enquiry has already been claimed by another counselor'
      });
    }

    // Claim the enquiry
    enquiry.status = 'claimed';
    enquiry.claimedBy = req.employee._id;
    enquiry.claimedAt = Date.now();

    await enquiry.save();

    // Populate the employee data
    await enquiry.populate('claimedBy', 'name email');

    res.status(200).json({
      success: true,
      message: 'Enquiry claimed successfully',
      data: enquiry
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all enquiries (For admin/testing)
// @route   GET /api/enquiries
// @access  Private
exports.getAllEnquiries = async (req, res) => {
  try {
    const enquiries = await Enquiry.find()
      .populate('claimedBy', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: enquiries.length,
      data: enquiries
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};