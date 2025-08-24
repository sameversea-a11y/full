const { validationResult } = require('express-validator');
const authService = require('../services/authService');

class AuthController {
  // Register user
  async register(req, res) {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      // Register user and send OTP for email verification
      const userData = await authService.registerUser(req.body);

      res.status(201).json({
        success: true,
        message: 'User registered successfully. Please check your email for verification.',
        data: userData
      });

    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Registration failed'
      });
    }
  }

  // Login user
  async login(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { email, password } = req.body;
      const loginData = await authService.loginUser(email, password);

      res.status(200).json({
        success: true,
        message: 'Login successful',
        ...loginData
      });

    } catch (error) {
      console.error('Login error:', error);
      res.status(401).json({
        success: false,
        message: error.message || 'Login failed'
      });
    }
  }

  // Send OTP for email verification
  async sendOtp(req, res) {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { email } = req.body;

      // Send OTP for email verification
      const result = await authService.sendOtp(email);

      res.status(200).json({
        success: true,
        message: 'OTP sent to your email for verification.',
        data: { verificationId: result.verificationId, email: result.email }
      });

    } catch (error) {
      console.error('Send OTP error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to send OTP'
      });
    }
  }

  // Verify email using OTP
  async verifyEmail(req, res) {
    try {
      const { email, otp } = req.body;

      // Verify OTP
      const result = await authService.verifyOtp(email, otp);

      res.status(200).json({
        success: true,
        message: result.message
      });

    } catch (error) {
      console.error('Email verification error:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Email verification failed'
      });
    }
  }

  // Get current user profile
  async getProfile(req, res) {
    try {
      const userData = await authService.getUserProfile(req.user.id);
      
      res.status(200).json({
        success: true,
        data: userData
      });
    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get user data'
      });
    }
  }

  // Logout user
  async logout(req, res) {
    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  }
}

module.exports = new AuthController();
