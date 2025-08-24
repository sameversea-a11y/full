const { validationResult } = require('express-validator');
const documentService = require('../services/documentService');

class DocumentController {
  // Upload document
  async uploadDocument(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
      }

      // Check if user has verified email
      if (!req.user.isEmailVerified) {
        // Delete uploaded file
        const fs = require('fs');
        fs.unlinkSync(req.file.path);
        return res.status(400).json({
          success: false,
          message: 'Please verify your email before uploading documents'
        });
      }

      const metadata = {
        ip: req.ip,
        userAgent: req.get('User-Agent')
      };

      const documentData = await documentService.uploadDocument(
        req.user.id,
        req.file,
        metadata
      );

      res.status(201).json({
        success: true,
        message: 'Document uploaded successfully',
        data: documentData
      });

    } catch (error) {
      // Clean up uploaded file on error
      if (req.file) {
        try {
          const fs = require('fs');
          fs.unlinkSync(req.file.path);
        } catch (unlinkError) {
          console.error('Error deleting file:', unlinkError);
        }
      }

      console.error('Document upload error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Document upload failed'
      });
    }
  }

  // Get user documents
  async getUserDocuments(req, res) {
    try {
      const documentsData = await documentService.getUserDocuments(req.user.id, req.query);

      res.status(200).json({
        success: true,
        data: documentsData
      });

    } catch (error) {
      console.error('Get documents error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch documents'
      });
    }
  }

  // Get document by UDIN
  async getDocumentByUDIN(req, res) {
    try {
      const documentData = await documentService.getDocumentByUDIN(
        req.user.id,
        req.params.udin
      );

      res.status(200).json({
        success: true,
        data: documentData
      });

    } catch (error) {
      console.error('Get document error:', error);
      res.status(404).json({
        success: false,
        message: error.message || 'Document not found'
      });
    }
  }

  // Delete document
  async deleteDocument(req, res) {
    try {
      const result = await documentService.deleteDocument(req.user.id, req.params.udin);

      res.status(200).json({
        success: true,
        ...result
      });

    } catch (error) {
      console.error('Delete document error:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to delete document'
      });
    }
  }
}

module.exports = new DocumentController();