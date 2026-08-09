const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { body, validationResult } = require('express-validator');
const Complaint = require('../models/Complaint');
const { protect } = require('../middleware/auth');
const { sendStatusUpdateEmail } = require('../utils/mailer');

// Configure Multer Storage for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '../public/uploads');
    // Ensure directory exists
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter (images and PDFs)
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|pdf/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Only PDF, JPG, and PNG file attachments are supported!'));
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: fileFilter
});

// @route   POST /api/complaints
// @desc    Submit a new complaint
// @access  Public
router.post(
  '/',
  upload.single('attachment'),
  [
    // Custom check: if not anonymous, validate student fields
    body('isAnonymous').isBoolean(),
    body('department', 'Department is required').notEmpty().trim(),
    body('category', 'Category is required').notEmpty().trim().isIn(['University', 'Hostel', 'Bus']),
    body('description', 'Description is required').notEmpty().trim(),
    body('date', 'Invalid Date').isISO8601()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      name,
      registerNumber,
      department,
      email,
      phone,
      category,
      description,
      date,
      isAnonymous,
      // New optional fields
      subcategory,
      roomSharing,
      roomType,
      hostelName,
      hostelBlock,
      roomNumber,
      busRoute,
      busType,
      busNumber
    } = req.body;

    const parsedAnonymous = isAnonymous === 'true' || isAnonymous === true;

    // Validate fields if NOT anonymous
    if (!parsedAnonymous) {
      if (!name || !registerNumber || !email || !phone) {
        return res.status(400).json({ message: 'Name, Register Number, Email, and Phone are required when not anonymous.' });
      }
    }

    try {
      // Determine prefix based on category selection
      let prefix = '';
      if (category === 'University') prefix = 'VTU-CA';
      else if (category === 'Hostel') prefix = 'VTU-HS';
      else if (category === 'Bus') prefix = 'VTU-BS';

      const currentYear = new Date(date).getFullYear();

      // Find the last complaint in this specific category to determine next sequential number
      const lastComplaint = await Complaint.findOne({ category }).sort({ createdAt: -1 });
      let nextNum = 1;
      if (lastComplaint && lastComplaint.complaintId) {
        const idParts = lastComplaint.complaintId.split('-');
        if (idParts.length === 4) {
          nextNum = parseInt(idParts[3]) + 1;
        }
      }
      const complaintId = `${prefix}-${currentYear}-${String(nextNum).padStart(4, '0')}`;

      // Handle file URL
      let fileUrl = '';
      if (req.file) {
        fileUrl = `/uploads/${req.file.filename}`;
      }

      const complaintData = {
        complaintId,
        department,
        category,
        description,
        date: new Date(date),
        fileUrl,
        isAnonymous: parsedAnonymous,
        name: parsedAnonymous ? 'Anonymous' : name,
        registerNumber: parsedAnonymous ? '' : registerNumber,
        email: parsedAnonymous ? '' : email,
        phone: parsedAnonymous ? '' : phone,
        // Save new fields
        subcategory: subcategory || '',
        roomSharing: roomSharing || '',
        roomType: roomType || '',
        hostelName: hostelName || '',
        hostelBlock: hostelBlock || '',
        roomNumber: roomNumber || '',
        busRoute: busRoute || '',
        busType: busType || '',
        busNumber: busNumber || ''
      };

      const complaint = new Complaint(complaintData);
      await complaint.save();

      res.status(201).json({
        message: 'Complaint submitted successfully',
        complaintId: complaint.complaintId
      });
    } catch (error) {
      console.error(error.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route   GET /api/complaints/:id
// @desc    Track a complaint by tracking ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const complaint = await Complaint.findOne({ complaintId: req.params.id.toUpperCase() });
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint ID not found' });
    }

    // Mask student data if anonymous
    const result = complaint.toObject();
    if (result.isAnonymous) {
      delete result.name;
      delete result.registerNumber;
      delete result.email;
      delete result.phone;
    }

    res.json(result);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/complaints
// @desc    Get all complaints (Admin search & filter)
// @access  Private
router.get('/', protect, async (req, res) => {
  const { category, status, search } = req.query;
  let query = {};

  if (category && category !== 'All') {
    query.category = category;
  }
  if (status && status !== 'All') {
    query.status = status;
  }
  if (search) {
    query.$or = [
      { complaintId: { $regex: search, $options: 'i' } },
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
  }

  try {
    const complaints = await Complaint.find(query).sort({ createdAt: -1 });
    res.json(complaints);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});

// @route   PATCH /api/complaints/:id/status
// @desc    Update complaint status, priority, and remarks
// @access  Private
router.patch(
  '/:id/status',
  protect,
  [
    body('status', 'Invalid status').isIn(['Pending', 'Under Review', 'Resolved', 'Rejected']),
    body('priority', 'Invalid priority').isIn(['Low', 'Medium', 'High']),
    body('adminRemarks').optional().trim()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { status, priority, adminRemarks } = req.body;

    try {
      const complaint = await Complaint.findOne({ complaintId: req.params.id.toUpperCase() });
      if (!complaint) {
        return res.status(404).json({ message: 'Complaint not found' });
      }

      const oldStatus = complaint.status;

      // Apply changes
      complaint.status = status;
      complaint.priority = priority;
      complaint.adminRemarks = adminRemarks || '';

      await complaint.save();

      // Send email alert on status update if email is present
      if (complaint.email) {
        // Run in background
        sendStatusUpdateEmail(complaint.email, complaint.complaintId, oldStatus, status, complaint.adminRemarks);
      }

      res.json({ message: 'Complaint status updated successfully', complaint });
    } catch (error) {
      console.error(error.message);
      res.status(500).send('Server Error');
    }
  }
);

module.exports = router;
