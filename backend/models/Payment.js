const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  documentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document'
  },
  razorpayOrderId: {
    type: String,
    required: true,
    unique: true
  },
  razorpayPaymentId: String,
  razorpaySignature: String,
  amount: {
    type: Number,
    required: true,
    min: [1, 'Amount must be greater than 0']
  },
  currency: {
    type: String,
    default: 'INR'
  },
  status: {
    type: String,
    enum: ['created', 'pending', 'paid', 'failed', 'refunded'],
    default: 'created'
  },
  paymentMethod: String,
  description: String,
  receipt: String,
  notes: {
    type: Map,
    of: String
  },
  failureReason: String,
  refundId: String,
  refundAmount: Number,
  refundReason: String,
  paymentDate: Date,
  refundDate: Date,
  transactionFee: Number,
  netAmount: Number,
  metadata: {
    userAgent: String,
    ipAddress: String,
    deviceInfo: String
  }
}, {
  timestamps: true
});

// Indexes for better query performance
paymentSchema.index({ userId: 1 });
paymentSchema.index({ razorpayOrderId: 1 });
paymentSchema.index({ razorpayPaymentId: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ paymentDate: -1 });

// Method to generate receipt number
paymentSchema.statics.generateReceipt = function() {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `UDIN_${timestamp}_${random}`;
};

module.exports = mongoose.model('Payment', paymentSchema);