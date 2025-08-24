const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const bcrypt = require('bcryptjs'); // Import bcrypt
const EmailVerification = require('../models/EmailVerification');
const { sendEmail } = require('../utils/email');

class AuthService {
  // Generate JWT token
  generateToken(id) {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE || '7d'
    });
  }

  // Register new user
 async registerUser(userData) {
    const { name, email, mobile, password, address } = userData;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { mobile }],
    });

    if (existingUser) {
      throw new Error('User already exists with this email or mobile number');
    }

    // Generate user ID
    const userId = await User.generateUserId();

    // Generate temporary password
    const tempPassword = crypto.randomBytes(8).toString('hex'); // Temporary 8-character password
    const hashedTempPassword = await bcrypt.hash(tempPassword, 12);// Hash the temporary password

    // Create user with the temporary password (password will be reset after the first login)
    const user = await User.create({
      name,
      email,
      mobile,
      password: hashedTempPassword, // Store the hashed temporary password
      address,
      userId,
      isEmailVerified: true, // Email verification will be needed
    });

    // Generate email verification token
    const emailToken = crypto.randomBytes(32).toString('hex');
    user.emailVerificationToken = emailToken;
    user.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
    await user.save();

    // Send welcome email with verification link and temporary login password
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${emailToken}`;
  /*   await sendEmail({
      to: email,
      subject: 'Welcome to UDIN - Verify Your Email',
      html: `
        <h2>Welcome to UDIN!</h2>
        <p>Hello ${name},</p>
        <p>Thank you for registering with UDIN. Please verify your email address by clicking the link below:</p>
        <a href="${verificationUrl}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Verify Email</a>
        <p>Your temporary login password is: <strong>${tempPassword}</strong></p>
        <p>This password can only be used once. After your first login, please reset your password using the "Forgot Password" feature.</p>
        <p>If you didn't create this account, please ignore this email.</p>
      `,
    }); */

    return {
      userId: user.userId,
      email: user.email,
      mobile: user.mobile,
      isEmailVerified: user.isEmailVerified,
    };
  }

  // Login user
  async loginUser(email, password) {
    // Find user and include password
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      throw new Error('Invalid credentials');
    }

    if (!user.isActive) {
      throw new Error('Account is deactivated');
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = this.generateToken(user._id);

    return {
      token,
      user: {
        id: user._id,
        userId: user.userId,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        lastLogin: user.lastLogin
      }
    };
  }

  // Verify email
  async verifyOtp(verificationId, otp) {
    // Find the verification record by the unique ID
    const verificationRecord = await EmailVerification.findOne({
      verificationId,
      expiresAt: { $gt: Date.now() }, // Check if OTP is not expired
    });

    if (!verificationRecord) {
      throw new Error('Invalid or expired OTP');
    }
    console.log(verificationRecord);
    // Check if the OTP matches
    if (verificationRecord.otp !== otp) {
      throw new Error('Invalid OTP');
    }

    // Mark email as verified for the user
    const user = await User.findOne({ email: verificationRecord.email });
    if (!user) {
      throw new Error('User not found');
    }

    user.isEmailVerified = true;
    user.lastLogin = new Date();
    await user.save();

    // Delete OTP record after successful verification
    await EmailVerification.deleteOne({ verificationId });

    // Generate JWT token for auto-login
    const token = this.generateToken(user._id);

    return {
      message: 'Email verified successfully',
      token,
      user: {
        id: user._id,
        userId: user.userId,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        lastLogin: user.lastLogin
      }
    };
  }


   async sendOtp(email) {
    // Check if user already exists with this email
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new Error('User already exists with this email');
    }

    // Generate unique verification ID
    const verificationId = crypto.randomBytes(16).toString('hex');

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP

    // Set expiration time for OTP (e.g., 15 minutes)
    const expiresAt = Date.now() + 15 * 60 * 1000; // 15 minutes

    // Save OTP and associated email in EmailVerification model
    await EmailVerification.create({
      email,
      otp,
      verificationId,
      expiresAt,
    });

    // Send OTP to email
    /* await sendEmail({
      to: email,
      subject: 'Verify Your Email - UDIN',
      html: `
        <h2>Email Verification</h2>
        <p>Hello,</p>
        <p>To complete your registration, please enter the OTP below:</p>
        <p><strong>${otp}</strong></p>
        <p>If you didn't request this, please ignore this email.</p>
      `,
    }); */

    return { verificationId, email };
  }

  // Get user profile
  async getUserProfile(userId) {
    const user = await User.findById(userId);
    
    if (!user) {
      throw new Error('User not found');
    }

    return {
      id: user._id,
      userId: user.userId,
      name: user.name,
      email: user.email,
      mobile: user.mobile,
      address: user.address,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt
    };
  }
}

module.exports = new AuthService();
