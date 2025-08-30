const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

const Admin = require('../models/Admin');
const Voter = require('../models/Voter');
const auth = require('../middleware/auth');

const router = express.Router();

// Email transporter setup
let transporter;
try {
  transporter = nodemailer.createTransporter({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
} catch (error) {
  console.warn('Email configuration not set up. Email features will be disabled.');
  transporter = null;
}

// Generate JWT token
const generateToken = (userId, role) => {
  return jwt.sign(
    { userId, role },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '24h' }
  );
};

// Send verification email
const sendVerificationEmail = async (email, token, type) => {
  if (!transporter) {
    console.warn('Email transporter not configured. Skipping email send.');
    return;
  }
  
  const verificationUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/verify/${type}/${token}`;
  
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: `Verify your ${type} account`,
    html: `
      <h2>Welcome to the Voting System!</h2>
      <p>Please click the link below to verify your ${type} account:</p>
      <a href="${verificationUrl}" style="background-color: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
        Verify Account
      </a>
      <p>This link will expire in 24 hours.</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Failed to send email:', error);
  }
};

// Admin Login
router.post('/admin/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Find admin
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isPasswordValid = await admin.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check if admin is verified
    if (!admin.isVerified) {
      // Generate verification token if not exists
      if (!admin.verificationToken) {
        admin.verificationToken = crypto.randomBytes(32).toString('hex');
        admin.verificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
        await admin.save();
        
        await sendVerificationEmail(email, admin.verificationToken, 'admin');
      }
      
      return res.status(403).json({ 
        error: 'Account not verified',
        message: 'Please check your email for verification link'
      });
    }

    // Update last login
    admin.lastLogin = new Date();
    await admin.save();

    // Generate token
    const token = generateToken(admin._id, 'admin');

    res.json({
      token,
      user: admin.getPublicProfile(),
      message: 'Admin login successful'
    });

  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Admin Registration
router.post('/admin/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('name').trim().isLength({ min: 2 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, name } = req.body;

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ error: 'Admin with this email already exists' });
    }

    // Create new admin (unverified)
    const admin = new Admin({
      email,
      password,
      name,
      isVerified: false
    });

    // Generate verification token
    admin.verificationToken = crypto.randomBytes(32).toString('hex');
    admin.verificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
    await admin.save();

    // Send verification email to debtanu.operations.script@gmail.com
    const adminApprovalUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/verify/admin/${admin.verificationToken}`;
    
    const adminApprovalMailOptions = {
      from: process.env.EMAIL_USER,
      to: 'debtanu.operations.script@gmail.com',
      subject: 'New Admin Registration Request',
      html: `
        <h2>New Admin Registration Request</h2>
        <p>A new admin registration request has been submitted:</p>
        <ul>
          <li><strong>Name:</strong> ${name}</li>
          <li><strong>Email:</strong> ${email}</li>
          <li><strong>Registration Date:</strong> ${new Date().toLocaleString()}</li>
        </ul>
        <p>Click the link below to approve this admin registration:</p>
        <a href="${adminApprovalUrl}" style="background-color: #10B981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
          Approve Admin Registration
        </a>
        <p>This link will expire in 24 hours.</p>
        <p>If you do not approve this registration, the account will remain unverified.</p>
      `
    };

    if (transporter) {
      try {
        await transporter.sendMail(adminApprovalMailOptions);

        // Send confirmation email to the applicant
        const confirmationMailOptions = {
          from: process.env.EMAIL_USER,
          to: email,
          subject: 'Admin Registration Submitted',
          html: `
            <h2>Admin Registration Submitted</h2>
            <p>Your admin registration request has been submitted successfully.</p>
            <p>Your application will be reviewed by the system administrator.</p>
            <p>You will receive an email notification once your account is approved.</p>
            <p>Thank you for your patience.</p>
          `
        };

        await transporter.sendMail(confirmationMailOptions);
      } catch (error) {
        console.error('Failed to send admin registration emails:', error);
      }
    } else {
      console.warn('Email transporter not configured. Admin registration emails not sent.');
    }

    res.json({
      message: 'Admin registration submitted. Please wait for approval from the system administrator.'
    });

  } catch (error) {
    console.error('Admin registration error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Voter Login/Register
router.post('/voter/login', [
  body('email').isEmail().normalizeEmail(),
  body('name').trim().isLength({ min: 2 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, name } = req.body;

    // Find or create voter
    let voter = await Voter.findOne({ email });
    
    if (!voter) {
      // Create new voter
      voter = new Voter({
        email,
        name
      });
    }

    // Generate verification token
    voter.verificationToken = crypto.randomBytes(32).toString('hex');
    voter.verificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
    await voter.save();

    // Send verification email
    await sendVerificationEmail(email, voter.verificationToken, 'voter');

    res.json({
      message: 'Verification email sent. Please check your inbox.'
    });

  } catch (error) {
    console.error('Voter login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Verify Account
router.get('/verify/:type/:token', async (req, res) => {
  try {
    const { type, token } = req.params;

    if (type === 'admin') {
      const admin = await Admin.findOne({
        verificationToken: token,
        verificationTokenExpires: { $gt: Date.now() }
      });

      if (!admin) {
        return res.status(400).json({ error: 'Invalid or expired verification token' });
      }

      admin.isVerified = true;
      admin.verificationToken = undefined;
      admin.verificationTokenExpires = undefined;
      await admin.save();

      // Send approval notification email to the admin
      if (transporter) {
        try {
          const approvalMailOptions = {
            from: process.env.EMAIL_USER,
            to: admin.email,
            subject: 'Admin Account Approved',
            html: `
              <h2>Admin Account Approved</h2>
              <p>Congratulations! Your admin account has been approved by the system administrator.</p>
              <p>You can now log in to your admin dashboard using your email and password.</p>
              <p>Welcome to the Voting System admin team!</p>
            `
          };

          await transporter.sendMail(approvalMailOptions);
        } catch (error) {
          console.error('Failed to send approval email:', error);
        }
      }

      const jwtToken = generateToken(admin._id, 'admin');

      res.json({
        token: jwtToken,
        user: admin.getPublicProfile(),
        message: 'Admin account verified successfully'
      });

    } else if (type === 'voter') {
      const voter = await Voter.findOne({
        verificationToken: token,
        verificationTokenExpires: { $gt: Date.now() }
      });

      if (!voter) {
        return res.status(400).json({ error: 'Invalid or expired verification token' });
      }

      voter.isVerified = true;
      voter.verificationToken = undefined;
      voter.verificationTokenExpires = undefined;
      await voter.save();

      const jwtToken = generateToken(voter._id, 'voter');

      res.json({
        token: jwtToken,
        user: voter.getPublicProfile(),
        message: 'Voter account verified successfully'
      });

    } else {
      res.status(400).json({ error: 'Invalid verification type' });
    }

  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get current user
router.get('/me', auth, async (req, res) => {
  try {
    const { userId, role } = req.user;

    if (role === 'admin') {
      const admin = await Admin.findById(userId);
      if (!admin) {
        return res.status(404).json({ error: 'Admin not found' });
      }
      res.json({ user: admin.getPublicProfile(), role });
    } else {
      const voter = await Voter.findById(userId);
      if (!voter) {
        return res.status(404).json({ error: 'Voter not found' });
      }
      res.json({ user: voter.getPublicProfile(), role });
    }

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Logout (client-side token removal)
router.post('/logout', (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

module.exports = router;
