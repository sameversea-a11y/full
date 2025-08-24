const Razorpay = require('razorpay');
const crypto = require('crypto');

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Create order
exports.createOrder = async (amount, currency = 'INR', receipt, notes = {}) => {
  try {
    const options = {
      amount: amount * 100, // Amount in paise
      currency,
      receipt,
      notes,
      payment_capture: 1
    };

    const order = await razorpay.orders.create(options);
    return {
      success: true,
      order
    };
  } catch (error) {
    console.error('Razorpay create order error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Verify payment signature
exports.verifyPaymentSignature = (orderId, paymentId, signature) => {
  try {
    const body = orderId + '|' + paymentId;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    return expectedSignature === signature;
  } catch (error) {
    console.error('Signature verification error:', error);
    return false;
  }
};

// Fetch payment details
exports.fetchPayment = async (paymentId) => {
  try {
    const payment = await razorpay.payments.fetch(paymentId);
    return {
      success: true,
      payment
    };
  } catch (error) {
    console.error('Fetch payment error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Create refund
exports.createRefund = async (paymentId, amount, notes = {}) => {
  try {
    const refund = await razorpay.payments.refund(paymentId, {
      amount: amount * 100, // Amount in paise
      notes
    });
    
    return {
      success: true,
      refund
    };
  } catch (error) {
    console.error('Create refund error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Fetch order details
exports.fetchOrder = async (orderId) => {
  try {
    const order = await razorpay.orders.fetch(orderId);
    return {
      success: true,
      order
    };
  } catch (error) {
    console.error('Fetch order error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

module.exports = razorpay;