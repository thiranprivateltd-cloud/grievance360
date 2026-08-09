require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcrypt');
const connectDB = async () => {
  const cdb = require('./config/db');
  await cdb();
};

const Admin = require('./models/Admin');
const authRoutes = require('./routes/auth');
const complaintRoutes = require('./routes/complaints');

const app = express();

// Middlewares
app.use(cors({
  origin: '*', // Allow all origins for testing/development
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Simple Rate Limiting for submissions (in-memory simple counter)
const ipSubmissionLimit = {};
app.use('/api/complaints', (req, res, next) => {
  if (req.method === 'POST') {
    const clientIp = req.ip;
    const now = Date.now();
    const limitWindowMs = 10 * 60 * 1000; // 10 minutes
    const maxSubmissions = 5;

    if (!ipSubmissionLimit[clientIp]) {
      ipSubmissionLimit[clientIp] = [];
    }

    // Filter out old requests
    ipSubmissionLimit[clientIp] = ipSubmissionLimit[clientIp].filter(time => now - time < limitWindowMs);

    if (ipSubmissionLimit[clientIp].length >= maxSubmissions) {
      return res.status(429).json({ message: 'Too many complaints submitted from this IP. Please try again after 10 minutes.' });
    }

    ipSubmissionLimit[clientIp].push(now);
  }
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintRoutes);

// Error Handler Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: err.message || 'Internal Server Error' });
});

// Seed default Admin if not exists
const seedDefaultAdmin = async () => {
  try {
    const username = 'VeltechGrievance';
    const rawPassword = 'Admin@Grievance';
    const hashedPassword = await bcrypt.hash(rawPassword, 10);

    const existingAdmin = await Admin.findOne({ username });
    if (!existingAdmin) {
      const defaultAdmin = new Admin({
        username: username,
        password: hashedPassword
      });
      await defaultAdmin.save();
      console.log(`Default Admin seeded successfully (Username: ${username}, Password: ${rawPassword})`);
    } else {
      // Update password to match request
      existingAdmin.password = hashedPassword;
      await existingAdmin.save();
      console.log(`Default Admin credentials verified and updated (Username: ${username})`);
    }
  } catch (err) {
    console.error('Failed to seed default admin user:', err.message);
  }
};

const migrateOldComplaints = async () => {
  try {
    const Complaint = require('./models/Complaint');
    const list = await Complaint.find({
      category: { $nin: ['University', 'Hostel', 'Bus'] }
    });

    if (list.length > 0) {
      console.log(`Found ${list.length} complaints with legacy categories. Migrating to updated schema...`);
      for (let c of list) {
        const oldCat = c.category;
        
        if (oldCat === 'Mess/Food') {
          c.category = 'Hostel';
          c.subcategory = 'Food';
        } else if (oldCat === 'Hostel') {
          c.category = 'Hostel';
        } else {
          c.category = 'University';
          c.subcategory = oldCat;
        }

        await c.save();
      }
      console.log('Database migration completed successfully!');
    }
  } catch (err) {
    console.error('Failed to run database migrations:', err.message);
  }
};

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  await seedDefaultAdmin();
  await migrateOldComplaints();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();
