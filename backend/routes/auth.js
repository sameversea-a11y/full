const express = require('express');
const { body, validationResult } = require('express-validator');
const { protect } = require('../middleware/auth');
const authController = require('../controllers/authController');

const router = express.Router();

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
router.post('/register', [
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Name must be between 2-100 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Please enter a valid email'),
  body('mobile').matches(/^[6-9]\d{9}$/).withMessage('Please enter a valid 10-digit mobile number'),
  body('address.street').optional().trim(),
  body('address.city').optional().trim(),
  body('address.state').optional().trim(),
  body('address.pinCode').optional().matches(/^\d{6}$/).withMessage('Please enter a valid 6-digit pin code')
], authController.register);

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
router.post('/login', [
  body('email').isEmail().normalizeEmail().withMessage('Please enter a valid email'),
  body('password').notEmpty().withMessage('Password is required')
], authController.login);

// @desc    Send OTP for email verification
// @route   POST /api/auth/send-otp
// @access  Public
router.post('/send-otp', [
  body('email').isEmail().normalizeEmail().withMessage('Please enter a valid email')
], authController.sendOtp);

// @desc    Verify email using OTP
// @route   POST /api/auth/verify-email
// @access  Public
router.post('/verify-email', [
  body('verificationId').notEmpty().withMessage('Verification ID is required'),
  body('otp').notEmpty().withMessage('OTP is required')
], authController.verifyEmail);

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
router.get('/me', protect, authController.getProfile);

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
router.post('/logout', protect, authController.logout);

module.exports = router;
