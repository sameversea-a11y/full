const Document = require('../models/Document');
const Payment = require('../models/Payment');
const crypto = require('crypto');
const fs = require('fs');

class DocumentService {
  // Upload document
  async uploadDocument(userId, fileData, metadata) {
    // Generate document hash
    const fileBuffer = fs.readFileSync(fileData.path);
    const documentHash = crypto.createHash('sha256').update(fileBuffer).digest('hex');

    // Check if document already exists
    const existingDoc = await Document.findOne({ documentHash });
    if (existingDoc) {
      // Delete uploaded file
      fs.unlinkSync(fileData.path);
      throw new Error('This document has already been uploaded');
    }

    // Generate UDIN
    const udin = await Document.generateUDIN();

    // Create document record
    const document = await Document.create({
      userId,
      udin,
      fileName: fileData.filename,
      originalName: fileData.originalname,
      fileType: fileData.originalname.split('.').pop().toLowerCase(),
      fileSize: fileData.size,
      filePath: fileData.path,
      documentHash,
      metadata: {
        uploadIP: metadata.ip,
        userAgent: metadata.userAgent,
        checksum: documentHash
      }
    });

    return {
      udin: document.udin,
      fileName: document.originalName,
      fileSize: document.fileSize,
      uploadDate: document.uploadDate,
      status: document.status
    };
  }

  // Get user documents
  async getUserDocuments(userId, query) {
    const { page = 1, limit = 10, status } = query;
    
    const searchQuery = { userId, isActive: true };
    if (status) {
      searchQuery.status = status;
    }

    const documents = await Document.find(searchQuery)
      .populate('paymentId', 'status amount paymentDate')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Document.countDocuments(searchQuery);

    return {
      documents: documents.map(doc => ({
        id: doc._id,
        udin: doc.udin,
        fileName: doc.originalName,
        fileType: doc.fileType,
        fileSize: doc.fileSize,
        status: doc.status,
        uploadDate: doc.uploadDate,
        verificationDate: doc.verificationDate,
        payment: doc.paymentId
      })),
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    };
  }

  // Get document by UDIN
  async getDocumentByUDIN(userId, udin) {
    const document = await Document.findOne({
      udin,
      userId,
      isActive: true
    }).populate('paymentId');

    if (!document) {
      throw new Error('Document not found');
    }

    return {
      id: document._id,
      udin: document.udin,
      fileName: document.originalName,
      fileType: document.fileType,
      fileSize: document.fileSize,
      status: document.status,
      uploadDate: document.uploadDate,
      verificationDate: document.verificationDate,
      rejectionReason: document.rejectionReason,
      payment: document.paymentId
    };
  }

  // Delete document (soft delete)
  async deleteDocument(userId, udin) {
    const document = await Document.findOne({
      udin,
      userId,
      isActive: true
    });

    if (!document) {
      throw new Error('Document not found');
    }

    // Check if document can be deleted (only if not verified)
    if (document.status === 'verified') {
      throw new Error('Verified documents cannot be deleted');
    }

    // Soft delete
    document.isActive = false;
    await document.save();

    return { message: 'Document deleted successfully' };
  }

  // Get all documents (backoffice)
  async getAllDocuments(query) {
    const { page = 1, limit = 10, status, search } = query;
    
    const searchQuery = { isActive: true };
    if (status) {
      searchQuery.status = status;
    }
    if (search) {
      searchQuery.$or = [
        { udin: { $regex: search, $options: 'i' } },
        { originalName: { $regex: search, $options: 'i' } }
      ];
    }

    const documents = await Document.find(searchQuery)
      .populate('userId', 'name email userId')
      .populate('paymentId', 'status amount paymentDate')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Document.countDocuments(searchQuery);

    return {
      documents: documents.map(doc => ({
        id: doc._id,
        udin: doc.udin,
        fileName: doc.originalName,
        fileType: doc.fileType,
        fileSize: doc.fileSize,
        status: doc.status,
        uploadDate: doc.uploadDate,
        verificationDate: doc.verificationDate,
        rejectionReason: doc.rejectionReason,
        user: doc.userId,
        payment: doc.paymentId
      })),
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    };
  }

  // Update document status (backoffice)
  async updateDocumentStatus(documentId, status, rejectionReason = null) {
    const updateData = { status };
    
    if (status === 'verified') {
      updateData.verificationDate = new Date();
    } else if (status === 'rejected' && rejectionReason) {
      updateData.rejectionReason = rejectionReason;
    }

    const document = await Document.findByIdAndUpdate(
      documentId,
      updateData,
      { new: true }
    ).populate('userId', 'name email');

    if (!document) {
      throw new Error('Document not found');
    }

    return document;
  }
}

module.exports = new DocumentService();