const express = require('express');
const { body, validationResult } = require('express-validator');
const { protect, backofficeOnly } = require('../middleware/auth');
const backofficeController = require('../controllers/backofficeController');

const router = express.Router();

// @desc    Get dashboard statistics
// @route   GET /api/backoffice/dashboard
// @access  Private (Backoffice only)
router.get('/dashboard', protect, backofficeOnly, backofficeController.getDashboardStats);

// @desc    Get all documents
// @route   GET /api/backoffice/documents
// @access  Private (Backoffice only)
router.get('/documents', protect, backofficeOnly, backofficeController.getAllDocuments);

// @desc    Update document status
// @route   PUT /api/backoffice/documents/:documentId/status
// @access  Private (Backoffice only)
router.put('/documents/:documentId/status', protect, backofficeOnly, [
  body('status').isIn(['uploaded', 'processing', 'verified', 'rejected']).withMessage('Invalid status'),
  body('rejectionReason').optional().trim().isLength({ min: 1 }).withMessage('Rejection reason is required when rejecting')
], backofficeController.updateDocumentStatus);

// @desc    Get all users
// @route   GET /api/backoffice/users
// @access  Private (Backoffice only)
router.get('/users', protect, backofficeOnly, backofficeController.getAllUsers);

// @desc    Get all payments
// @route   GET /api/backoffice/payments
// @access  Private (Backoffice only)
router.get('/payments', protect, backofficeOnly, backofficeController.getAllPayments);

// @desc    Process refund
// @route   POST /api/backoffice/payments/:paymentId/refund
// @access  Private (Backoffice only)
router.post('/payments/:paymentId/refund', protect, backofficeOnly, [
  body('refundAmount').isNumeric().isFloat({ min: 1 }).withMessage('Valid refund amount is required'),
  body('reason').trim().isLength({ min: 1 }).withMessage('Refund reason is required')
], backofficeController.processRefund);

// @desc    Get transaction history
// @route   GET /api/backoffice/transactions
// @access  Private (Backoffice only)
router.get('/transactions', protect, backofficeOnly, backofficeController.getTransactionHistory);

module.exports = router;