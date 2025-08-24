//@ts-nocheck
// src/api/udin.ts
import axios from "axios";

export type SignupForm = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  state: string;
  pin: string;
  agreeToTerms: boolean;
};

const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"; // Use environment variable for API URL

// Helper function to handle API calls with axios
const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000, // 30 second timeout
});

// Add request interceptor for auth token if needed
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('userToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('userToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

/**
 * Send OTP to email
 */
export async function sendEmailOtp(email: string) {
  try {
    const response = await axiosInstance.post("/api/auth/send-otp", { email });
    return response.data;
  } catch (error) {
    throw new Error("Failed to send email OTP");
  }
}

/**
 * Send OTP to phone
 */
export async function sendPhoneOtp(phone: string) {
  try {
    const response = await axiosInstance.post("/send-phone-otp", { phone });
    return response.data;
  } catch (error) {
    throw new Error("Failed to send phone OTP");
  }
}

/**
 * Verify email OTP
 */
export async function verifyEmailOtp(email: string, otp: string) {
  try {
    const response = await axiosInstance.post("/api/auth/verify-email", {
      email,
      otp,
    });
    return response.data;
  } catch (error) {
    throw new Error("Invalid email OTP");
  }
}

/**
 * Verify phone OTP
 */
export async function verifyPhoneOtp(phone: string, otp: string) {
  try {
    const response = await axiosInstance.post("/verify-phone-otp", {
      phone,
      otp,
    });
    return response.data;
  } catch (error) {
    throw new Error("Invalid phone OTP");
  }
}

/**
 * Create new account
 */
export async function createAccount(formData: SignupForm) {
  try {
    const response = await axiosInstance.post("/api/auth/register", formData);
    return response.data;
  } catch (error) {
    throw new Error("Failed to create account");
  }
}

export const loginUser = async (email, password) => {
  try {
    const response = await axiosInstance.post('/api/auth/login', { email, password });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to log in");
  }
};

// API Call for Forgot Password (send reset email)
export const forgotPassword = async (email) => {
  try {
    const response = await axiosInstance.post('/api/auth/forgot-password', { email });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to send password reset link",
    );
  }
};

// Enhanced file upload function for external server
export const uploadFilesToServer = async (
  files: Array<{
    id: string;
    name: string;
    file: File | Blob;
    documentTypeId?: string;
    tier?: string;
    [key: string]: any;
  }>,
  userId: string,
  customerInfo?: any,
  pricingSnapshot?: any,
  metadata?: any,
  onProgress?: (progress: number) => void,
) => {
  try {
    const formData = new FormData();

    // Add files + per-file metadata
    files.forEach((fileItem, index) => {
      // Ensure we always send a File (not just a Blob)
      const asFile =
        fileItem.file instanceof File
          ? fileItem.file
          : new File(
              [fileItem.file],
              // fall back to a safe filename if missing
              fileItem.name || `upload-${index}`,
              {
                type:
                  (fileItem.file as any)?.type ||
                  "application/octet-stream",
              },
            );

      // Multiple files can share the same field name "files"
      formData.append("files", asFile);

      // Per-file metadata (indexed, if your backend expects this shape)
      if (fileItem.documentTypeId != null) {
        formData.append(
          `fileMetadata[${index}][documentTypeId]`,
          String(fileItem.documentTypeId),
        );
      }
      if (fileItem.tier != null) {
        formData.append(`fileMetadata[${index}][tier]`, String(fileItem.tier));
      }
      formData.append(
        `fileMetadata[${index}][originalId]`,
        String(fileItem.id),
      );
      // Include filename too (often handy on the server)
      if (fileItem.name) {
        formData.append(`fileMetadata[${index}][name]`, String(fileItem.name));
      }
      // Pass through any extra keys (optional)
      Object.entries(fileItem).forEach(([k, v]) => {
        if (
          ["id", "name", "file", "documentTypeId", "tier"].includes(k)
        ) {
          return;
        }
        if (v == null) return;
        formData.append(`fileMetadata[${index}][${k}]`, String(v));
      });
    });

    // Add additional data
    if (userId) formData.append("userId", userId);
    if (customerInfo)
      formData.append("customerInfo", JSON.stringify(customerInfo));
    if (pricingSnapshot)
      formData.append("pricingSnapshot", JSON.stringify(pricingSnapshot));
    if (metadata) formData.append("metadata", JSON.stringify(metadata));

    // Timestamp
    formData.append("uploadTimestamp", new Date().toISOString());

    const response = await axiosInstance.post("/api/uploads/files", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      timeout: 300000, // 5 minutes
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total,
          );
          onProgress(percentCompleted);
        }
      },
    });

    return response.data;
  } catch (error: any) {
    console.error("File upload error:", error);
    throw new Error(
      error?.response?.data?.error || error.message || "File upload failed",
    );
  }
};

// Enhanced function to get files from IndexedDB with better error handling
export const getFilesFromIndexedDB = async (): Promise<
  Array<{
    id: string;
    name: string;
    file: Blob;
    size?: number;
    type?: string;
    documentTypeId?: string;
    tier?: string;
  }>
> => {
  const DB_NAME = "udin_files_db";
  const STORE_NAME = "uploaded_files";

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);

    request.onerror = () => reject(request.error);
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const objectStore = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        objectStore.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };

    request.onsuccess = () => {
      const db = request.result;

      if (!db.objectStoreNames.contains(STORE_NAME)) {
        resolve([]);
        return;
      }

      const transaction = db.transaction([STORE_NAME], "readonly");
      const store = transaction.objectStore(STORE_NAME);
      const getAllRequest = store.getAll();

      getAllRequest.onerror = () => reject(getAllRequest.error);

      getAllRequest.onsuccess = () => {
        const files = getAllRequest.result || [];
        resolve(
          files.map((file: any) => ({
            id: file.id,
            name: file.name,
            file: file.file,
            size: file.size,
            type: file.type,
            documentTypeId: file.documentTypeId,
            tier: file.tier,
          })),
        );
      };
    };
  });
};

// Enhanced function to clear IndexedDB with better error handling
export const clearIndexedDBFiles = async (): Promise<void> => {
  const DB_NAME = "udin_files_db";
  const STORE_NAME = "uploaded_files";

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);

    request.onerror = () => reject(request.error);

    request.onsuccess = () => {
      const db = request.result;

      if (!db.objectStoreNames.contains(STORE_NAME)) {
        resolve();
        return;
      }

      const transaction = db.transaction([STORE_NAME], "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      const clearRequest = store.clear();

      clearRequest.onerror = () => reject(clearRequest.error);
      clearRequest.onsuccess = () => resolve();
    };
  });
};

// Get upload status
export const getUploadStatus = async (uploadId: string) => {
  try {
    const response = await axiosInstance.get(`/api/uploads/status/${uploadId}`);
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.error || "Failed to get upload status",
    );
  }
};

// Get user uploads
export const getUserUploads = async (userId: string) => {
  try {
    const response = await axiosInstance.get(`/api/uploads/user/${userId}`);
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.error || "Failed to get user uploads",
    );
  }
};

// Create payment order
export const createPaymentOrder = async (orderData: {
  amount: number;
  currency: string;
  receipt: string;
  notes?: any;
}) => {
  try {
    const response = await axiosInstance.post('/api/payments/create-order', orderData);
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.error || "Failed to create payment order",
    );
  }
};

// Verify payment
export const verifyPayment = async (paymentData: {
  orderId: string;
  paymentId: string;
  signature: string;
}) => {
  try {
    const response = await axiosInstance.post('/api/payments/verify', paymentData);
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.error || "Failed to verify payment",
    );
  }
};

// Get user profile
export const getUserProfile = async (userId: string) => {
  try {
    const response = await axiosInstance.get(`/api/users/profile/${userId}`);
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.error || "Failed to get user profile",
    );
  }
};

// Update user profile
export const updateUserProfile = async (userId: string, profileData: any) => {
  try {
    const response = await axiosInstance.put(`/api/users/profile/${userId}`, profileData);
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.error || "Failed to update user profile",
    );
  }
};

// Get user transactions
export const getUserTransactions = async (userId: string, filters?: any) => {
  try {
    const params = new URLSearchParams();
    if (filters) {
      Object.keys(filters).forEach(key => {
        if (filters[key] && filters[key] !== 'all') {
          params.append(key, filters[key]);
        }
      });
    }
    
    const response = await axiosInstance.get(`/api/users/transactions/${userId}?${params}`);
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.error || "Failed to get user transactions",
    );
  }
};

// Get user documents
export const getUserDocuments = async (userId: string, filters?: any) => {
  try {
    const params = new URLSearchParams();
    if (filters) {
      Object.keys(filters).forEach(key => {
        if (filters[key] && filters[key] !== 'all') {
          params.append(key, filters[key]);
        }
      });
    }
    
    const response = await axiosInstance.get(`/api/users/documents/${userId}?${params}`);
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.error || "Failed to get user documents",
    );
  }
};

// Download document
export const downloadDocument = async (documentId: string, type: 'original' | 'signed' = 'original') => {
  try {
    const response = await axiosInstance.get(`/api/documents/download/${documentId}?type=${type}`, {
      responseType: 'blob',
    });
    
    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    
    // Get filename from response headers or use default
    const contentDisposition = response.headers['content-disposition'];
    let filename = `document_${documentId}.pdf`;
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="(.+)"/);
      if (filenameMatch) {
        filename = filenameMatch[1];
      }
    }
    
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    
    return { success: true, filename };
  } catch (error: any) {
    throw new Error(
      error.response?.data?.error || "Failed to download document",
    );
  }
};
