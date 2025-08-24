/**
 * Shared code between client and server
 * Useful to share types between client and server
 * and/or small pure JS functions that can be used on both client and server
 */

/**
 * Example response type for /api/demo
 */
export interface DemoResponse {
  message: string;
}

/**
 * File upload related types
 */
export interface UploadFileResponse {
  success: boolean;
  uploadId: string;
  message: string;
  files: Array<{
    originalName: string;
    size: number;
    uploadedAt: string;
  }>;
}

export interface UploadStatusResponse {
  success: boolean;
  upload: {
    uploadId: string;
    status: string;
    fileCount: number;
    uploadedAt: string;
    files: Array<{
      originalName: string;
      size: number;
      uploadedAt: string;
    }>;
  };
}

export interface UserUploadsResponse {
  success: boolean;
  uploads: Array<{
    uploadId: string;
    status: string;
    fileCount: number;
    uploadedAt: string;
  }>;
}

export interface UploadErrorResponse {
  success: false;
  error: string;
}
