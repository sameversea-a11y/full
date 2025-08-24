const { validationResult } = require("express-validator");
const Document = require("../models/Document");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

class UploadController {
  // Upload multiple files
  async uploadFiles(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          message: "No files uploaded",
        });
      }

      // Check if user has verified email
      if (!req.user.isEmailVerified) {
        // Delete uploaded files
        req.files.forEach((file) => {
          try {
            fs.unlinkSync(file.path);
          } catch (unlinkError) {
            console.error("Error deleting file:", unlinkError);
          }
        });

        return res.status(400).json({
          success: false,
          message: "Please verify your email before uploading documents",
        });
      }

      const metadata = {
        ip: req.ip,
        userAgent: req.get("User-Agent"),
        uploadTimestamp: req.body.uploadTimestamp || new Date().toISOString(),
        customerInfo: req.body.customerInfo
          ? JSON.parse(req.body.customerInfo)
          : null,
        pricingSnapshot: req.body.pricingSnapshot
          ? JSON.parse(req.body.pricingSnapshot)
          : null,
        metadata: req.body.metadata ? JSON.parse(req.body.metadata) : null,
      };

      const uploadedDocuments = [];
      const errors = [];

      // Process each file
      for (let i = 0; i < req.files.length; i++) {
        const file = req.files[i];

        try {
          // Get file metadata from request (indexed by file position)
          const fileMetadata = {
            documentTypeId:
              req.body[`fileMetadata[${i}][documentTypeId]`] || "",
            tier: req.body[`fileMetadata[${i}][tier]`] || "Standard",
            originalId: req.body[`fileMetadata[${i}][originalId]`] || "",
            name: req.body[`fileMetadata[${i}][name]`] || file.originalname,
          };

          // Generate document hash
          const fileBuffer = fs.readFileSync(file.path);
          const documentHash = crypto
            .createHash("sha256")
            .update(fileBuffer)
            .digest("hex");

          // Check if document already exists
          const existingDoc = await Document.findOne({ documentHash });
          if (existingDoc) {
            // Delete uploaded file
            fs.unlinkSync(file.path);
            errors.push(
              `File "${file.originalname}" has already been uploaded`,
            );
            continue;
          }

          // Generate UDIN
          const udin = await Document.generateUDIN();

          // Create document record
          const document = await Document.create({
            userId: req.user.id,
            udin,
            fileName: file.filename,
            originalName: file.originalname,
            fileType: file.originalname.split(".").pop().toLowerCase(),
            fileSize: file.size,
            filePath: file.path,
            documentHash,
            documentTypeId: fileMetadata.documentTypeId,
            tier: fileMetadata.tier,
            metadata: {
              uploadIP: metadata.ip,
              userAgent: metadata.userAgent,
              checksum: documentHash,
              originalId: fileMetadata.originalId,
              customerInfo: metadata.customerInfo,
              pricingSnapshot: metadata.pricingSnapshot,
              uploadMetadata: metadata.metadata,
            },
          });

          uploadedDocuments.push({
            id: document._id,
            udin: document.udin,
            fileName: document.originalName,
            fileSize: document.fileSize,
            fileType: document.fileType,
            documentTypeId: document.documentTypeId,
            tier: document.tier,
            uploadDate: document.uploadDate,
            status: document.status,
            originalId: fileMetadata.originalId,
          });
        } catch (error) {
          // Clean up file on error
          try {
            fs.unlinkSync(file.path);
          } catch (unlinkError) {
            console.error("Error deleting file:", unlinkError);
          }

          console.error(`Error processing file ${file.originalname}:`, error);
          errors.push(
            `Failed to process file "${file.originalname}": ${error.message}`,
          );
        }
      }

      // Return response
      const response = {
        success: uploadedDocuments.length > 0,
        message:
          uploadedDocuments.length > 0
            ? `Successfully uploaded ${uploadedDocuments.length} file(s)`
            : "No files were uploaded successfully",
        data: {
          uploadedFiles: uploadedDocuments,
          totalUploaded: uploadedDocuments.length,
          totalRequested: req.files.length,
          errors: errors.length > 0 ? errors : undefined,
        },
      };

      const statusCode = uploadedDocuments.length > 0 ? 201 : 400;
      res.status(statusCode).json(response);
    } catch (error) {
      // Clean up uploaded files on error
      if (req.files) {
        req.files.forEach((file) => {
          try {
            fs.unlinkSync(file.path);
          } catch (unlinkError) {
            console.error("Error deleting file:", unlinkError);
          }
        });
      }

      console.error("Upload files error:", error);
      res.status(500).json({
        success: false,
        message: error.message || "File upload failed",
      });
    }
  }

  // Get upload status
  async getUploadStatus(req, res) {
    try {
      const { uploadId } = req.params;

      // For this implementation, we'll return the document status
      // In a more complex system, you might have separate upload tracking
      const document = await Document.findOne({
        _id: uploadId,
        userId: req.user.id,
      });

      if (!document) {
        return res.status(404).json({
          success: false,
          message: "Upload not found",
        });
      }

      res.status(200).json({
        success: true,
        data: {
          uploadId: document._id,
          status: document.status,
          fileName: document.originalName,
          fileSize: document.fileSize,
          uploadDate: document.uploadDate,
          udin: document.udin,
        },
      });
    } catch (error) {
      console.error("Get upload status error:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to get upload status",
      });
    }
  }

  // Get user uploads
  async getUserUploads(req, res) {
    try {
      const { page = 1, limit = 10, status } = req.query;

      const searchQuery = { userId: req.user.id, isActive: true };
      if (status) {
        searchQuery.status = status;
      }

      const documents = await Document.find(searchQuery)
        .populate("paymentId", "status amount paymentDate")
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

      const total = await Document.countDocuments(searchQuery);

      const uploads = documents.map((doc) => ({
        id: doc._id,
        udin: doc.udin,
        fileName: doc.originalName,
        fileType: doc.fileType,
        fileSize: doc.fileSize,
        status: doc.status,
        uploadDate: doc.uploadDate,
        verificationDate: doc.verificationDate,
        documentTypeId: doc.documentTypeId,
        tier: doc.tier,
        payment: doc.paymentId,
      }));

      res.status(200).json({
        success: true,
        data: {
          uploads,
          pagination: {
            current: parseInt(page),
            pages: Math.ceil(total / limit),
            total,
          },
        },
      });
    } catch (error) {
      console.error("Get user uploads error:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to get user uploads",
      });
    }
  }
}

module.exports = new UploadController();
