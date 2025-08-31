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

// Send OTP email to admin
const sendOTPEmail = async (email, otp) => {
  // For development, always show OTP in console
  console.log('🔐 OTP for admin login:', otp);
  console.log('📧 Email:', email);
  console.log('📬 OTP would be sent to: debtanu.operations.script@gmail.com');
  
  if (!transporter) {
    console.warn('Email transporter not configured. Skipping OTP email send.');
    console.log('💡 To enable email, configure EMAIL_USER and EMAIL_PASS in .env file');
    return;
  }
  
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: 'dasguptasoumasish@gmail.com',
    subject: 'Admin Login OTP',
    html: `
      <h2>Admin Login OTP</h2>
      <p>An admin is trying to log in with email: <strong>${email}</strong></p>
      <p>Please provide this OTP to the admin:</p>
      <h1 style="font-size: 48px; color: #3B82F6; text-align: center; padding: 20px; background: #f3f4f6; border-radius: 8px;">${otp}</h1>
      <p>This OTP will expire in 10 minutes.</p>
      <p>If you did not request this OTP, please ignore this email.</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('✅ OTP email sent successfully to debtanu.operations.script@gmail.com');
  } catch (error) {
    console.error('❌ Failed to send OTP email:', error);
    console.log('🔐 OTP for manual verification:', otp);
  }
};

// Admin Login (No password required, just email + OTP)
router.post('/admin/login', [
  body('email').isEmail().normalizeEmail()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email } = req.body;

    // Find admin
    let admin = await Admin.findOne({ email });
    if (!admin) {
      // Create new admin if doesn't exist
      admin = new Admin({
        email,
        password: 'default-password', // Will be hashed automatically
        name: email.split('@')[0], // Use email prefix as name
        isVerified: false
      });
    }

    // Generate OTP
    const otp = admin.generateOTP();
    await admin.save();

    // Send OTP to debtanu.operations.script@gmail.com
    await sendOTPEmail(email, otp);

    res.json({
      message: 'OTP sent to admin email. Please check debtanu.operations.script@gmail.com for the OTP.',
      requiresOTP: true
    });

  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Admin OTP Verification (with fixed code 2004)
router.post('/admin/verify-otp', [
  body('email').isEmail().normalizeEmail(),
  body('otp').isLength({ min: 4, max: 6 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, otp } = req.body;

    // Check for fixed code first
    if (otp === '2004') {
      // Find admin
      let admin = await Admin.findOne({ email });
      if (!admin) {
        // Create new admin if doesn't exist
        admin = new Admin({
          email,
          password: 'default-password',
          name: email.split('@')[0],
          isVerified: true
        });
        await admin.save();
      } else {
        // Update existing admin
        admin.isVerified = true;
        admin.lastLogin = new Date();
        await admin.save();
      }

      // Generate token
      const token = generateToken(admin._id, 'admin');

      res.json({
        token,
        user: admin.getPublicProfile(),
        message: 'Admin login successful with fixed code'
      });
      return;
    }

    // Regular OTP verification
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify OTP
    if (!admin.verifyOTP(otp)) {
      return res.status(401).json({ error: 'Invalid or expired OTP' });
    }

    // Clear OTP
    admin.otp = undefined;
    admin.otpExpires = undefined;
    admin.isVerified = true;
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
    console.error('Admin OTP verification error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Admin Registration (No password required)
router.post('/admin/register', [
  body('email').isEmail().normalizeEmail(),
  body('name').trim().isLength({ min: 2 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, name } = req.body;

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ error: 'Admin with this email already exists' });
    }

    // Create new admin (unverified)
    const admin = new Admin({
      email,
      password: 'default-password', // Will be hashed automatically
      name,
      isVerified: false
    });

    // Generate OTP for initial verification
    const otp = admin.generateOTP();
    await admin.save();

    // Send OTP to debtanu.operations.script@gmail.com
    console.log('🔐 OTP for admin registration:', otp);
    console.log('📧 Email:', email);
    console.log('📬 OTP would be sent to: debtanu.operations.script@gmail.com');
    
    if (transporter) {
      try {
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
            <p>Please provide this OTP to the admin for verification:</p>
            <h1 style="font-size: 48px; color: #10B981; text-align: center; padding: 20px; background: #f3f4f6; border-radius: 8px;">${otp}</h1>
            <p>This OTP will expire in 10 minutes.</p>
          `
        };

        await transporter.sendMail(adminApprovalMailOptions);
        console.log('✅ Admin registration email sent successfully to debtanu.operations.script@gmail.com');
      } catch (error) {
        console.error('❌ Failed to send admin registration email:', error);
        console.log('🔐 OTP for manual verification:', otp);
      }
    } else {
      console.warn('Email transporter not configured. Admin registration email not sent.');
      console.log('💡 To enable email, configure EMAIL_USER and EMAIL_PASS in .env file');
      console.log('🔐 OTP for manual verification:', otp);
    }

    res.json({
      message: 'Admin registration submitted. Please check debtanu.operations.script@gmail.com for the OTP.',
      requiresOTP: true
    });

  } catch (error) {
    console.error('Admin registration error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Voter Login/Register (Simplified - no email verification)
router.post('/voter/login', [
  body('name').trim().isLength({ min: 2 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name } = req.body;

    // Find or create voter
    let voter = await Voter.findOne({ name });
    
    if (!voter) {
      // Create new voter
      voter = new Voter({
        name,
        email: `${name.toLowerCase().replace(/\s+/g, '.')}@voter.local`, // Generate a dummy email
        isVerified: true // Auto-verify voters
      });
      await voter.save();
    }

    // Generate token directly (no email verification needed)
    const token = generateToken(voter._id, 'voter');

    res.json({
      token,
      user: voter.getPublicProfile(),
      message: 'Voter login successful'
    });

  } catch (error) {
    console.error('Voter login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Verify Account (for backward compatibility)
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
