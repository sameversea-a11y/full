const { validationResult } = require('express-validator');
const documentService = require('../services/documentService');
const paymentService = require('../services/paymentService');
const User = require('../models/User');
const Transaction = require('../models/Transaction');

class BackofficeController {
  // Get dashboard stats
  async getDashboardStats(req, res) {
    try {
      const [
        totalUsers,
        totalDocuments,
        totalPayments,
        pendingDocuments,
        verifiedDocuments,
        rejectedDocuments
      ] = await Promise.all([
        User.countDocuments({ role: 'user' }),
        require('../models/Document').countDocuments({ isActive: true }),
        require('../models/Payment').countDocuments({ status: 'paid' }),
        require('../models/Document').countDocuments({ status: 'uploaded', isActive: true }),
        require('../models/Document').countDocuments({ status: 'verified', isActive: true }),
        require('../models/Document').countDocuments({ status: 'rejected', isActive: true })
      ]);

      // Calculate total revenue
      const revenueResult = await require('../models/Payment').aggregate([
        { $match: { status: 'paid' } },
        { $group: { _id: null, total: { $sum: '$netAmount' } } }
      ]);
      const totalRevenue = revenueResult[0]?.total || 0;

      res.status(200).json({
        success: true,
        data: {
          totalUsers,
          totalDocuments,
          totalPayments,
          totalRevenue: totalRevenue / 100, // Convert from paise to rupees
          pendingDocuments,
          verifiedDocuments,
          rejectedDocuments
        }
      });

    } catch (error) {
      console.error('Dashboard stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch dashboard statistics'
      });
    }
  }

  // Get all documents
  async getAllDocuments(req, res) {
    try {
      const documentsData = await documentService.getAllDocuments(req.query);

      res.status(200).json({
        success: true,
        data: documentsData
      });

    } catch (error) {
      console.error('Get all documents error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch documents'
      });
    }
  }

  // Update document status
  async updateDocumentStatus(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { documentId } = req.params;
      const { status, rejectionReason } = req.body;

      const document = await documentService.updateDocumentStatus(
        documentId,
        status,
        rejectionReason
      );

      res.status(200).json({
        success: true,
        message: 'Document status updated successfully',
        data: {
          id: document._id,
          udin: document.udin,
          status: document.status,
          verificationDate: document.verificationDate,
          rejectionReason: document.rejectionReason
        }
      });

    } catch (error) {
      console.error('Update document status error:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to update document status'
      });
    }
  }

  // Get all payments
  async getAllPayments(req, res) {
    try {
      const paymentsData = await paymentService.getAllPayments(req.query);

      res.status(200).json({
        success: true,
        data: paymentsData
      });

    } catch (error) {
      console.error('Get all payments error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch payments'
      });
    }
  }

  // Process refund
  async processRefund(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { paymentId } = req.params;
      const { refundAmount, reason } = req.body;

      const refundData = await paymentService.processRefund(
        paymentId,
        refundAmount,
        reason
      );

      res.status(200).json({
        success: true,
        message: 'Refund processed successfully',
        data: refundData
      });

    } catch (error) {
      console.error('Process refund error:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to process refund'
      });
    }
  }

  // Get all users
  async getAllUsers(req, res) {
    try {
      const { page = 1, limit = 10, search } = req.query;
      
      const query = { role: 'user' };
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { userId: { $regex: search, $options: 'i' } }
        ];
      }

      const users = await User.find(query)
        .select('-password')
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

      const total = await User.countDocuments(query);

      res.status(200).json({
        success: true,
        data: {
          users: users.map(user => ({
            id: user._id,
            userId: user.userId,
            name: user.name,
            email: user.email,
            mobile: user.mobile,
            isEmailVerified: user.isEmailVerified,
            isActive: user.isActive,
            lastLogin: user.lastLogin,
            createdAt: user.createdAt
          })),
          pagination: {
            current: parseInt(page),
            pages: Math.ceil(total / limit),
            total
          }
        }
      });

    } catch (error) {
      console.error('Get all users error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch users'
      });
    }
  }

  // Get transaction history
  async getTransactionHistory(req, res) {
    try {
      const { page = 1, limit = 10, type, status } = req.query;
      
      const query = {};
      if (type) query.type = type;
      if (status) query.status = status;

      const transactions = await Transaction.find(query)
        .populate('userId', 'name email userId')
        .populate('documentId', 'udin originalName')
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

      const total = await Transaction.countDocuments(query);

      res.status(200).json({
        success: true,
        data: {
          transactions: transactions.map(txn => ({
            id: txn._id,
            transactionId: txn.transactionId,
            type: txn.type,
            amount: txn.amount,
            currency: txn.currency,
            status: txn.status,
            description: txn.description,
            user: txn.userId,
            document: txn.documentId,
            createdAt: txn.createdAt
          })),
          pagination: {
            current: parseInt(page),
            pages: Math.ceil(total / limit),
            total
          }
        }
      });

    } catch (error) {
      console.error('Get transaction history error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch transaction history'
      });
    }
  }
}

module.exports = new BackofficeController();