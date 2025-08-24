// controllers/paymentController.js
const { validationResult } = require('express-validator');
const paymentService = require('../services/paymentService');

class PaymentController {
  /* -----------------------------------------------------------------------
   * CART ORDER (matches frontend: POST /payments/order)
   * body: { amount, currency?, notes?, items?, subtotal?, tax? }
   * --------------------------------------------------------------------- */
  async createCartOrder(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array(),
        });
      }

      const orderData = await paymentService.createCartOrder("68aa048c72b1d4e17784e1b7", req.body);

      return res.status(201).json({
        success: true,
        message: 'Payment order created successfully',
        data: orderData, // { orderId, amount(paise), currency, razorpayKeyId }
      });
    } catch (error) {
      console.error('Create cart order error:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to create payment order',
      });
    }
  }

  /* -----------------------------------------------------------------------
   * (Legacy) SINGLE DOCUMENT ORDER (optional; keep for backwards compat)
   * POST /payments/order/document
   * body: { documentId, amount }
   * --------------------------------------------------------------------- */
  async createDocumentOrder(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array(),
        });
      }

      const { documentId, amount } = req.body;
      const orderData = await paymentService.createPaymentOrder(
        req.user.id,
        documentId,
        amount
      );

      return res.status(201).json({
        success: true,
        message: 'Payment order created successfully',
        data: orderData,
      });
    } catch (error) {
      console.error('Create document order error:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to create payment order',
      });
    }
  }

  /* -----------------------------------------------------------------------
   * VERIFY PAYMENT (matches frontend: POST /payments/verify)
   * body: { orderId, paymentId, signature } or razorpay_* fields
   * --------------------------------------------------------------------- */
  async verifyPayment(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array(),
        });
      }

      const metadata = {
        userAgent: req.get('User-Agent'),
        ipAddress: req.ip,
      };

      const paymentData = await paymentService.verifyPayment(
        req.user.id,
        req.body,
        metadata
      );

      return res.status(200).json({
        success: true,
        message: 'Payment verified successfully',
        data: paymentData, // { paymentId, amount, status, paymentDate }
      });
    } catch (error) {
      console.error('Payment verification error:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Payment verification failed',
      });
    }
  }

  /* -----------------------------------------------------------------------
   * TRANSACTIONS
   * --------------------------------------------------------------------- */

  // POST /transactions
  async createTransaction(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array(),
        });
      }

      const result = await paymentService.createTransaction(req.user.id, req.body);
      return res.status(201).json({
        success: true,
        message: 'Transaction created',
        data: result, // { transactionId, id }
      });
    } catch (error) {
      console.error('Create transaction error:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to create transaction',
      });
    }
  }

  // PATCH /transactions/:transactionId/status
  async updateTransactionStatus(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array(),
        });
      }

      const { transactionId } = req.params;
      const result = await paymentService.updateTransactionStatus(
        req.user.id,
        transactionId,
        req.body // { status, uploadedFilesCount, paymentId, error, extra }
      );

      return res.status(200).json({
        success: true,
        message: 'Transaction updated',
        data: result, // { transactionId, status, metadata }
      });
    } catch (error) {
      console.error('Update transaction status error:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to update transaction',
      });
    }
  }

  /* -----------------------------------------------------------------------
   * HISTORY + BACKOFFICE
   * --------------------------------------------------------------------- */

  // GET /payments/history
  async getPaymentHistory(req, res) {
    try {
      const paymentsData = await paymentService.getPaymentHistory(req.user.id, req.query);
      return res.status(200).json({
        success: true,
        data: paymentsData,
      });
    } catch (error) {
      console.error('Get payment history error:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch payment history',
      });
    }
  }

  // GET /payments (backoffice)
  async getAllPayments(req, res) {
    try {
      const paymentsData = await paymentService.getAllPayments(req.query);
      return res.status(200).json({
        success: true,
        data: paymentsData,
      });
    } catch (error) {
      console.error('Get all payments error:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch payments',
      });
    }
  }

  /* -----------------------------------------------------------------------
   * REFUND
   * --------------------------------------------------------------------- */
  // POST /payments/:paymentId/refund
  async processRefund(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array(),
        });
      }

      const { paymentId } = req.params;
      const { amount, reason } = req.body;

      const result = await paymentService.processRefund(paymentId, amount, reason);
      return res.status(200).json({
        success: true,
        message: 'Refund processed',
        data: result, // { refundId, amount, status }
      });
    } catch (error) {
      console.error('Process refund error:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to process refund',
      });
    }
  }
}

module.exports = new PaymentController();
