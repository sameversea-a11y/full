const express = require('express');
const { protect, userOnly } = require('../middleware/auth');
const { uploadDocument, handleUploadError } = require('../middleware/upload');
const documentController = require('../controllers/documentController');

const router = express.Router();

// @desc    Upload document
// @route   POST /api/documents/upload
// @access  Private (User only)
router.post('/upload', protect, userOnly, uploadDocument, handleUploadError, documentController.uploadDocument);

// @desc    Get user documents
// @route   GET /api/documents
// @access  Private (User only)
router.get('/', protect, userOnly, documentController.getUserDocuments);

// @desc    Get document by UDIN
// @route   GET /api/documents/:udin
// @access  Private (User only)
router.get('/:udin', protect, userOnly, documentController.getDocumentByUDIN);

// @desc    Delete document
// @route   DELETE /api/documents/:udin
// @access  Private (User only)
router.delete('/:udin', protect, userOnly, documentController.deleteDocument);

module.exports = router;