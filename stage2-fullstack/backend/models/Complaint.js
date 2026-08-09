const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
  complaintId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: function() { return !this.isAnonymous; }
  },
  registerNumber: {
    type: String,
    required: function() { return !this.isAnonymous; }
  },
  department: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: function() { return !this.isAnonymous; }
  },
  phone: {
    type: String,
    required: function() { return !this.isAnonymous; }
  },
  category: {
    type: String,
    required: true,
    enum: ['University', 'Hostel', 'Bus']
  },
  // Specific subcategory/type fields
  subcategory: {
    type: String,
    default: ''
  },
  roomSharing: {
    type: String,
    default: ''
  },
  roomType: {
    type: String,
    default: ''
  },
  hostelName: {
    type: String,
    default: ''
  },
  hostelBlock: {
    type: String,
    default: ''
  },
  roomNumber: {
    type: String,
    default: ''
  },
  // Bus specific fields
  busRoute: {
    type: String,
    default: ''
  },
  busType: {
    type: String,
    default: ''
  },
  busNumber: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  fileUrl: {
    type: String,
    default: ''
  },
  isAnonymous: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    required: true,
    enum: ['Pending', 'Under Review', 'Resolved', 'Rejected'],
    default: 'Pending'
  },
  priority: {
    type: String,
    required: true,
    enum: ['Low', 'Medium', 'High'],
    default: 'Medium'
  },
  adminRemarks: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Complaint', complaintSchema);
