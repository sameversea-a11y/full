// services/PaymentService.js
const Payment = require('../models/Payment');
const Transaction = require('../models/Transaction');
const Document = require('../models/Document');
const {
  createOrder,
  verifyPaymentSignature,
  fetchPayment,
  createRefund,
} = require('../utils/razorpay');

class PaymentService {
  /* ---------------------------------------------------------------------------
   * A) CART-STYLE ORDER (matches frontend: POST /payments/order)
   *    body: { amount (INR), currency?, notes?, items?, subtotal?, tax? }
   * -------------------------------------------------------------------------*/
  async createCartOrder(userId, payload = {}) {
    const {
      amount,               // in INR (frontend sends)
      currency = 'INR',
      notes = {},
      items = [],           // snapshot of items [{id,name,price,tier,udinRequired}, ...]
      subtotal,             // optional INR
      tax,                  // optional { rate, gstAmount }
      description = 'Cart payment',
    } = payload;

    if (!amount || amount <= 0) {
      throw new Error('Amount must be a positive number (INR)');
    }

    // Generate a receipt on our side (model helper recommended)
    const receipt = Payment.generateReceipt
      ? Payment.generateReceipt()
      : `rcpt_${Date.now()}_${Math.floor(Math.random() * 1e6)}`;

    // Create Razorpay order in paise
    const orderResult = await createOrder(Math.round(amount * 100), currency, receipt, {
      userId,
      kind: 'cart',
      ...notes,
    });

    if (!orderResult?.success) {
      throw new Error(`Failed to create payment order: ${orderResult?.error || 'unknown error'}`);
    }

    const order = orderResult.order;

    // Persist our Payment row (status=created)
    const payment = await Payment.create({
      userId,
      // Not binding to a single document in cart mode:
      documentId: null,
      razorpayOrderId: order.id,
      amount,             // store in INR in our DB (consistent with UI)
      currency,
      description,
      receipt,
      status: 'created',  // created -> pending -> paid -> (refunded)
      notes,
      metadata: {
        items,
        subtotal,
        tax,
      },
    });

    // Create a transaction entry for bookkeeping (type: payment, status: created)
    await Transaction.create({
      userId,
      paymentId: payment._id,
      documentId: null,
      transactionId: Transaction.generateTransactionId(),
      type: 'payment',
      amount,
      currency,
      status: 'created',
      description: 'Cart payment order created',
      razorpayData: { orderId: order.id },
      metadata: { items, subtotal, tax },
    });

    return {
      orderId: order.id,
      amount: order.amount,      // paise
      currency: order.currency,  // "INR"
      receipt: order.receipt,
      razorpayKeyId: process.env.RAZORPAY_KEY_ID,
      // keep old name for compatibility if your frontend expects keyId:
      keyId: process.env.RAZORPAY_KEY_ID,
    };
  }

  /* ---------------------------------------------------------------------------
   * B) (Legacy) SINGLE-DOCUMENT ORDER (kept for compatibility)
   *    If you still call it somewhere else.
   * -------------------------------------------------------------------------*/
  async createPaymentOrder(userId, documentId, amount) {
    const document = await Document.findOne({
      _id: documentId,
      userId,
      isActive: true,
    });

    if (!document) {
      throw new Error('Document not found');
    }

    const existingPayment = await Payment.findOne({
      documentId,
      status: { $in: ['created', 'pending', 'paid'] },
    });

    if (existingPayment) {
      throw new Error('Payment already exists for this document');
    }

    const receipt = Payment.generateReceipt
      ? Payment.generateReceipt()
      : `rcpt_${Date.now()}_${Math.floor(Math.random() * 1e6)}`;

    const orderResult = await createOrder(Math.round(amount * 100), 'INR', receipt, {
      userId: document.userId,
      documentId,
      udin: document.udin,
    });

    if (!orderResult.success) {
      throw new Error(`Failed to create payment order: ${orderResult.error}`);
    }

    const payment = await Payment.create({
      userId,
      documentId,
      razorpayOrderId: orderResult.order.id,
      amount, // INR
      currency: 'INR',
      description: `Payment for document verification - UDIN: ${document.udin}`,
      receipt,
      notes: {
        udin: document.udin,
        userId: document.userId,
      },
      status: 'created',
    });

    await Transaction.create({
      userId,
      paymentId: payment._id,
      documentId,
      transactionId: Transaction.generateTransactionId(),
      type: 'payment',
      amount,
      currency: 'INR',
      status: 'created',
      description: `Payment order created for UDIN: ${document.udin}`,
      razorpayData: { orderId: orderResult.order.id },
    });

    return {
      orderId: orderResult.order.id,
      amount: orderResult.order.amount,
      currency: orderResult.order.currency,
      receipt: orderResult.order.receipt,
      razorpayKeyId: process.env.RAZORPAY_KEY_ID,
      keyId: process.env.RAZORPAY_KEY_ID,
    };
  }

  /* ---------------------------------------------------------------------------
   * C) VERIFY PAYMENT (matches frontend: POST /payments/verify)
   *    body: { orderId, paymentId, signature }
   *    metadata: any additional (e.g., device, ip, etc.)
   * -------------------------------------------------------------------------*/
  async verifyPayment(userId, paymentData, metadata) {
    const { orderId, paymentId, signature } = normalizeVerifyPayload(paymentData);

    // Verify signature locally
    const isValidSignature = verifyPaymentSignature(orderId, paymentId, signature);
    if (!isValidSignature) {
      throw new Error('Invalid payment signature');
    }

    // Find our Payment by order id + user
    const payment = await Payment.findOne({
      razorpayOrderId: orderId,
      userId,
    });

    if (!payment) {
      throw new Error('Payment record not found');
    }

    // Fetch payment details from Razorpay (for fee/method/etc.)
    const paymentResult = await fetchPayment(paymentId);
    if (!paymentResult?.success) {
      throw new Error(`Failed to fetch payment details: ${paymentResult?.error || 'unknown error'}`);
    }
    const rp = paymentResult.payment;

    // Update payment record
    payment.razorpayPaymentId = paymentId;
    payment.razorpaySignature = signature;
    payment.status = 'paid';
    payment.paymentMethod = rp.method;
    payment.paymentDate = new Date();
    payment.transactionFee = rp.fee || 0; // paise per Razorpay docs
    // netAmount: store in INR; fee is in paise -> convert
    payment.netAmount = payment.amount - (payment.transactionFee / 100);
    // merge/append metadata from verify call
    payment.metadata = { ...(payment.metadata || {}), ...(metadata || {}) };
    await payment.save();

    // If this was a single-document payment, set document to processing
    if (payment.documentId) {
      await Document.findByIdAndUpdate(payment.documentId, {
        status: 'processing',
        paymentId: payment._id,
      });
    }

    // Update the transaction row created at order time
    await Transaction.findOneAndUpdate(
      { paymentId: payment._id, type: 'payment' },
      {
        status: 'completed',
        razorpayData: {
          orderId,
          paymentId,
          signature,
          method: rp.method,
        },
        metadata,
      }
    );

    return {
      paymentId: payment._id,
      amount: payment.amount,
      status: payment.status,
      paymentDate: payment.paymentDate,
    };
  }

  /* ---------------------------------------------------------------------------
   * D) TRANSACTIONS (matches frontend: POST /transactions, PATCH /transactions/:id/status)
   * -------------------------------------------------------------------------*/
  async createTransaction(userId, payload = {}) {
    const {
      orderId,
      amount,
      currency = 'INR',
      status = 'pending',
      items = [],
      customer,
      tax,       // { rate, gstAmount }
      subtotal,
      description = 'Cart transaction initiated',
      documentId = null, // optional
    } = payload;

    const trx = await Transaction.create({
      userId,
      paymentId: null, // will be known after verify; we still track via orderId in razorpayData
      documentId,
      transactionId: Transaction.generateTransactionId(),
      type: 'payment',
      amount,
      currency,
      status,
      description,
      razorpayData: { orderId },
      metadata: {
        items,
        customer,
        tax,
        subtotal,
      },
    });

    return { transactionId: trx.transactionId, id: trx._id };
  }

  async updateTransactionStatus(userId, transactionId, update = {}) {
    const {
      status,                // 'paid' | 'uploaded' | 'error' | 'cancelled' | ...
      uploadedFilesCount,
      paymentId,             // Razorpay payment id (when status goes 'paid')
      error,                 // error string if status='error'
      extra,                 // any extra metadata to merge
    } = update;

    const trx = await Transaction.findOne({ userId, transactionId });
    if (!trx) {
      throw new Error('Transaction not found');
    }

    // also try to link to our Payment row if we can find by orderId
    if (paymentId && trx?.razorpayData?.orderId) {
      const payment = await Payment.findOne({
        userId,
        razorpayOrderId: trx.razorpayData.orderId,
      });
      if (payment) {
        trx.paymentId = payment._id;
      }
    }

    if (typeof uploadedFilesCount === 'number') {
      trx.metadata = { ...(trx.metadata || {}), uploadedFilesCount };
    }
    if (error) {
      trx.metadata = { ...(trx.metadata || {}), error };
    }
    if (extra && typeof extra === 'object') {
      trx.metadata = { ...(trx.metadata || {}), ...extra };
    }
    if (status) {
      trx.status = status;
    }

    await trx.save();

    return {
      transactionId: trx.transactionId,
      status: trx.status,
      metadata: trx.metadata,
    };
  }

  /* ---------------------------------------------------------------------------
   * E) HISTORY & BACKOFFICE (left mostly unchanged, but cart-safe)
   * -------------------------------------------------------------------------*/
  async getPaymentHistory(userId, query) {
    const { page = 1, limit = 10, status } = query;

    const searchQuery = { userId };
    if (status) searchQuery.status = status;

    const payments = await Payment.find(searchQuery)
      .populate('documentId', 'udin originalName status')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Payment.countDocuments(searchQuery);

    return {
      payments: payments.map((p) => ({
        id: p._id,
        orderId: p.razorpayOrderId,
        paymentId: p.razorpayPaymentId,
        amount: p.amount,
        currency: p.currency,
        status: p.status,
        paymentMethod: p.paymentMethod,
        paymentDate: p.paymentDate,
        document: p.documentId, // might be null for cart
        metadata: p.metadata,
      })),
      pagination: {
        current: parseInt(page, 10),
        pages: Math.ceil(total / limit),
        total,
      },
    };
  }

  async getAllPayments(query) {
    const { page = 1, limit = 10, status } = query;

    const searchQuery = {};
    if (status) searchQuery.status = status;

    const payments = await Payment.find(searchQuery)
      .populate('userId', 'name email userId')
      .populate('documentId', 'udin originalName')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Payment.countDocuments(searchQuery);

    return {
      payments: payments.map((p) => ({
        id: p._id,
        orderId: p.razorpayOrderId,
        paymentId: p.razorpayPaymentId,
        amount: p.amount,
        currency: p.currency,
        status: p.status,
        paymentMethod: p.paymentMethod,
        paymentDate: p.paymentDate,
        user: p.userId,
        document: p.documentId,
        metadata: p.metadata,
      })),
      pagination: {
        current: parseInt(page, 10),
        pages: Math.ceil(total / limit),
        total,
      },
    };
  }

  /* ---------------------------------------------------------------------------
   * F) REFUND (unchanged, still works with cart payments)
   * -------------------------------------------------------------------------*/
  async processRefund(paymentId, refundAmount, reason) {
    const payment = await Payment.findById(paymentId);
    if (!payment) throw new Error('Payment not found');
    if (payment.status !== 'paid') {
      throw new Error('Only paid payments can be refunded');
    }

    const refundResult = await createRefund(payment.razorpayPaymentId, refundAmount, { reason });
    if (!refundResult.success) {
      throw new Error(`Failed to process refund: ${refundResult.error}`);
    }

    payment.status = 'refunded';
    payment.refundId = refundResult.refund.id;
    payment.refundAmount = refundAmount;
    payment.refundReason = reason;
    payment.refundDate = new Date();
    await payment.save();

    await Transaction.create({
      userId: payment.userId,
      paymentId: payment._id,
      documentId: payment.documentId || null,
      transactionId: Transaction.generateTransactionId(),
      type: 'refund',
      amount: -refundAmount,
      currency: 'INR',
      status: 'completed',
      description: `Refund processed${reason ? ` - ${reason}` : ''}`,
      razorpayData: {
        paymentId: payment.razorpayPaymentId,
        refundId: refundResult.refund.id,
      },
    });

    return {
      refundId: refundResult.refund.id,
      amount: refundAmount,
      status: 'completed',
    };
  }
}

/* ----------------------------- helpers ---------------------------------- */
function normalizeVerifyPayload(data = {}) {
  // frontend sends { orderId, paymentId, signature }
  // keep compatibility with { razorpay_order_id, ... } shapes
  const orderId = data.orderId || data.razorpay_order_id;
  const paymentId = data.paymentId || data.razorpay_payment_id;
  const signature = data.signature || data.razorpay_signature;

  if (!orderId || !paymentId || !signature) {
    throw new Error('orderId, paymentId and signature are required');
  }
  return { orderId, paymentId, signature };
}

module.exports = new PaymentService();
