const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  udin: {
    type: String,
    unique: true,
    required: true
  },
  fileName: {
    type: String,
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  fileType: {
    type: String,
    required: true,
    enum: ['jpg', 'jpeg', 'pdf', 'doc', 'docx', 'xls', 'xlsx']
  },
  fileSize: {
    type: Number,
    required: true,
    max: [52428800, 'File size cannot exceed 50MB'] // 50MB in bytes
  },
  filePath: {
    type: String,
    required: true
  },
  fileUrl: String,
  documentHash: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['uploaded', 'processing', 'verified', 'rejected'],
    default: 'uploaded'
  },
  uploadDate: {
    type: Date,
    default: Date.now
  },
  verificationDate: Date,
  rejectionReason: String,
  metadata: {
    uploadIP: String,
    userAgent: String,
    checksum: String
  },
  paymentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Payment'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for better query performance
documentSchema.index({ userId: 1 });
documentSchema.index({ udin: 1 });
documentSchema.index({ status: 1 });
documentSchema.index({ uploadDate: -1 });

// Method to generate UDIN
documentSchema.statics.generateUDIN = async function() {
  const count = await this.countDocuments();
  const timestamp = Date.now().toString().slice(-6);
  return `UDIN${timestamp}${String(count + 1).padStart(4, '0')}`;
};

module.exports = mongoose.model('Document', documentSchema);