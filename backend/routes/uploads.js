const express = require('express');
const { protect, userOnly } = require('../middleware/auth');
const { uploadMultipleFiles, handleUploadError } = require('../middleware/upload');
const uploadController = require('../controllers/uploadController');

const router = express.Router();

// @desc    Upload multiple files
// @route   POST /api/uploads/files
// @access  Private (User only)
router.post('/files', protect, userOnly, uploadMultipleFiles, handleUploadError, uploadController.uploadFiles);

// @desc    Get upload status
// @route   GET /api/uploads/status/:uploadId
// @access  Private (User only)
router.get('/status/:uploadId', protect, userOnly, uploadController.getUploadStatus);

// @desc    Get user uploads
// @route   GET /api/uploads/user/:userId
// @access  Private (User only)
router.get('/user/:userId', protect, userOnly, uploadController.getUserUploads);

module.exports = router;
