// routes/payment.routes.js
const express = require('express');
const { body, param } = require('express-validator');
const { protect, userOnly /*, adminOnly*/ } = require('../middleware/auth');
const paymentController = require('../controllers/paymentController');

const router = express.Router();

/* =========================
 * PAYMENTS
 * =======================*/

// Create cart order (matches frontend)
router.post(
  '/order',
  [
    body('amount').isNumeric().withMessage('amount (INR) is required'),
    body('amount').custom((v) => v > 0).withMessage('amount must be > 0'),
    body('items').optional().isArray().withMessage('items must be an array'),
    body('subtotal').optional().isNumeric(),
    body('tax').optional().isObject(), // { rate, gstAmount }
    body('notes').optional().isObject(),
  ],
  paymentController.createCartOrder
);

// (Optional) legacy single-document order
router.post(
  '/payments/order/document',
  protect,
  userOnly,
  [
    body('documentId').isMongoId().withMessage('Valid document ID is required'),
    body('amount').isNumeric().withMessage('amount (INR) is required'),
    body('amount').custom((v) => v > 0).withMessage('amount must be > 0'),
  ],
  paymentController.createDocumentOrder
);

// Verify payment (accepts either new or razorpay_* keys)
router.post(
  '/payments/verify',
  protect,
  userOnly,
  [
    body().custom((body) => {
      const hasNew = body.orderId && body.paymentId && body.signature;
      const hasLegacy =
        body.razorpay_order_id && body.razorpay_payment_id && body.razorpay_signature;
      if (!hasNew && !hasLegacy) {
        throw new Error(
          'Provide (orderId, paymentId, signature) or (razorpay_order_id, razorpay_payment_id, razorpay_signature)'
        );
      }
      return true;
    }),
  ],
  paymentController.verifyPayment
);

// Payment history (user)
router.get('/payments/history', protect, userOnly, paymentController.getPaymentHistory);

// (Optional) backoffice list
// router.get('/payments', protect, adminOnly, paymentController.getAllPayments);

/* =========================
 * TRANSACTIONS
 * =======================*/

// Create a transaction (pending)
router.post(
  '/transactions',
  protect,
  userOnly,
  [
    body('orderId').isString().withMessage('orderId is required'),
    body('amount').isNumeric().withMessage('amount (INR) is required'),
    body('amount').custom((v) => v > 0).withMessage('amount must be > 0'),
    body('currency').optional().isString(),
    body('items').optional().isArray(),
    body('customer').optional().isObject(),
    body('tax').optional().isObject(),
    body('subtotal').optional().isNumeric(),
    body('status').optional().isString(),
    body('description').optional().isString(),
  ],
  paymentController.createTransaction
);

// Update transaction status (paid / uploaded / error / cancelled)
router.patch(
  '/transactions/:transactionId/status',
  protect,
  userOnly,
  [
    param('transactionId').isString().withMessage('transactionId is required'),
    body('status').isString().withMessage('status is required'),
    body('uploadedFilesCount').optional().isNumeric(),
    body('paymentId').optional().isString(),
    body('error').optional().isString(),
    body('extra').optional().isObject(),
  ],
  paymentController.updateTransactionStatus
);

module.exports = router;
