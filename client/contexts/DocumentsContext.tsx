import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  ReactNode,
} from "react";
import { fileStorage } from "@/utlis/fileStorage";

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  status: "pending" | "uploading" | "completed" | "error";
  progress: number;
  documentTypeId: string;
  tier: string;
  file: File;
  timestamp?: string;
}

interface DocumentsState {
  files: UploadedFile[];
  isLoading: boolean;
  error: string | null;
  totalFiles: number;
  completedFiles: number;
}

type DocumentsAction =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "SET_FILES"; payload: UploadedFile[] }
  | { type: "ADD_FILES"; payload: UploadedFile[] }
  | {
      type: "UPDATE_FILE";
      payload: { id: string; updates: Partial<UploadedFile> };
    }
  | { type: "REMOVE_FILE"; payload: string }
  | { type: "CLEAR_FILES" }
  | { type: "RESTORE_FILES"; payload: UploadedFile[] };

const initialState: DocumentsState = {
  files: [],
  isLoading: false,
  error: null,
  totalFiles: 0,
  completedFiles: 0,
};

function documentsReducer(
  state: DocumentsState,
  action: DocumentsAction,
): DocumentsState {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };

    case "SET_ERROR":
      return { ...state, error: action.payload };

    case "SET_FILES":
      return {
        ...state,
        files: action.payload,
        totalFiles: action.payload.length,
        completedFiles: action.payload.filter((f) => f.status === "completed")
          .length,
      };

    case "ADD_FILES":
      const newFiles = [...state.files, ...action.payload];
      return {
        ...state,
        files: newFiles,
        totalFiles: newFiles.length,
        completedFiles: newFiles.filter((f) => f.status === "completed").length,
      };

    case "UPDATE_FILE":
      const updatedFiles = state.files.map((file) =>
        file.id === action.payload.id
          ? { ...file, ...action.payload.updates }
          : file,
      );
      return {
        ...state,
        files: updatedFiles,
        completedFiles: updatedFiles.filter((f) => f.status === "completed")
          .length,
      };

    case "REMOVE_FILE":
      const remainingFiles = state.files.filter(
        (file) => file.id !== action.payload,
      );
      return {
        ...state,
        files: remainingFiles,
        totalFiles: remainingFiles.length,
        completedFiles: remainingFiles.filter((f) => f.status === "completed")
          .length,
      };

    case "CLEAR_FILES":
      return {
        ...state,
        files: [],
        totalFiles: 0,
        completedFiles: 0,
      };

    case "RESTORE_FILES":
      return {
        ...state,
        files: action.payload,
        totalFiles: action.payload.length,
        completedFiles: action.payload.filter((f) => f.status === "completed")
          .length,
      };

    default:
      return state;
  }
}

interface DocumentsContextValue {
  state: DocumentsState;
  actions: {
    addFiles: (files: File[]) => Promise<void>;
    removeFile: (id: string) => Promise<void>;
    updateFileDocumentType: (
      id: string,
      documentTypeId: string,
    ) => Promise<void>;
    updateFileTier: (id: string, tier: string) => Promise<void>;
    clearAllFiles: () => Promise<void>;
    restoreFiles: () => Promise<void>;
    getValidFiles: () => UploadedFile[];
    getTotalSize: () => number;
  };
}

const DocumentsContext = createContext<DocumentsContextValue | undefined>(
  undefined,
);

export function useDocuments() {
  const context = useContext(DocumentsContext);
  if (context === undefined) {
    throw new Error("useDocuments must be used within a DocumentsProvider");
  }
  return context;
}

interface DocumentsProviderProps {
  children: ReactNode;
}

export function DocumentsProvider({ children }: DocumentsProviderProps) {
  const [state, dispatch] = useReducer(documentsReducer, initialState);

  // File validation constants
  const ALLOWED_TYPES = [
    "image/jpeg",
    "image/jpg",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ];
  const MIN_SIZE = 1024; // 1KB
  const MAX_SIZE = 50 * 1024 * 1024; // 50MB
  const MAX_FILES = 30;

  // Restore files from IndexedDB on component mount
  useEffect(() => {
    restoreFiles();
  }, []);

  const validateFiles = (
    files: File[],
  ): { valid: File[]; errors: string[] } => {
    const errors: string[] = [];
    const valid: File[] = [];

    if (state.files.length + files.length > MAX_FILES) {
      errors.push(`Maximum ${MAX_FILES} documents allowed`);
      return { valid, errors };
    }

    files.forEach((file) => {
      if (!ALLOWED_TYPES.includes(file.type)) {
        errors.push(
          `${file.name}: Invalid file type. Only JPG, JPEG, PDF, Word, and Excel files are allowed.`,
        );
        return;
      }

      if (file.size < MIN_SIZE || file.size > MAX_SIZE) {
        errors.push(`${file.name}: File size must be between 1KB and 50MB.`);
        return;
      }

      valid.push(file);
    });

    return { valid, errors };
  };

  const addFiles = async (files: File[]): Promise<void> => {
    dispatch({ type: "SET_LOADING", payload: true });
    dispatch({ type: "SET_ERROR", payload: null });

    try {
      const { valid, errors } = validateFiles(files);

      if (errors.length > 0) {
        dispatch({ type: "SET_ERROR", payload: errors.join("\n") });
        dispatch({ type: "SET_LOADING", payload: false });
        return;
      }

      const uploadFiles: UploadedFile[] = valid.map((file) => ({
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        size: file.size,
        type: file.type,
        status: "pending",
        progress: 0,
        documentTypeId: "",
        tier: "Standard",
        file: file,
        timestamp: new Date().toISOString(),
      }));

      // Add to state first for immediate UI feedback
      dispatch({ type: "ADD_FILES", payload: uploadFiles });

      // Store files in IndexedDB
      await fileStorage.storeFiles(uploadFiles);

      // Update status to completed after successful storage
      uploadFiles.forEach((file) => {
        dispatch({
          type: "UPDATE_FILE",
          payload: {
            id: file.id,
            updates: { status: "completed", progress: 100 },
          },
        });
      });
    } catch (error) {
      console.error("Error storing files:", error);
      dispatch({
        type: "SET_ERROR",
        payload: "Error storing files locally. Please try again.",
      });
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  const removeFile = async (id: string): Promise<void> => {
    try {
      // Remove from state
      dispatch({ type: "REMOVE_FILE", payload: id });

      // Remove from IndexedDB
      await fileStorage.deleteFile(id);
    } catch (error) {
      console.error("Error removing file:", error);
      dispatch({
        type: "SET_ERROR",
        payload: "Error removing file from local storage. Please try again.",
      });
    }
  };

  const updateFileDocumentType = async (
    id: string,
    documentTypeId: string,
  ): Promise<void> => {
    try {
      // Update local state first for immediate UI feedback
      dispatch({
        type: "UPDATE_FILE",
        payload: { id, updates: { documentTypeId } },
      });

      // Get the current file to update in IndexedDB
      const currentFile = state.files.find((f) => f.id === id);
      if (!currentFile) {
        throw new Error(`File with id ${id} not found`);
      }

      // Update in IndexedDB
      const updatedFileData = {
        ...currentFile,
        documentTypeId,
        timestamp: new Date().toISOString(),
      };

      await fileStorage.storeFiles([updatedFileData]);
    } catch (error) {
      console.error("Error updating file document type:", error);
      dispatch({
        type: "SET_ERROR",
        payload: "Error updating document type in local storage. Please try again.",
      });
    }
  };

  const updateFileTier = async (id: string, tier: string): Promise<void> => {
    try {
      // Update local state first
      dispatch({
        type: "UPDATE_FILE",
        payload: { id, updates: { tier } },
      });

      // Get the current file to update in IndexedDB
      const currentFile = state.files.find((f) => f.id === id);
      if (!currentFile) {
        throw new Error(`File with id ${id} not found`);
      }

      // Update in IndexedDB
      const updatedFileData = {
        ...currentFile,
        tier,
        timestamp: new Date().toISOString(),
      };

      await fileStorage.storeFiles([updatedFileData]);
    } catch (error) {
      console.error("Error updating file tier:", error);
      dispatch({
        type: "SET_ERROR",
        payload: "Error updating tier in local storage. Please try again.",
      });
    }
  };

  const clearAllFiles = async (): Promise<void> => {
    try {
      dispatch({ type: "CLEAR_FILES" });
      await fileStorage.clearAllFiles();
    } catch (error) {
      console.error("Error clearing files:", error);
      dispatch({
        type: "SET_ERROR",
        payload: "Error clearing local files. Please try again.",
      });
    }
  };

  const restoreFiles = async (): Promise<void> => {
    dispatch({ type: "SET_LOADING", payload: true });

    try {
      const storedFiles = await fileStorage.getStoredFiles();

      if (storedFiles.length > 0) {
        const restoredFiles: UploadedFile[] = storedFiles.map((stored) => ({
          id: stored.id,
          name: stored.name,
          size: stored.size,
          type: stored.type,
          status: "completed" as const,
          progress: 100,
          documentTypeId: stored.documentTypeId,
          tier: stored.tier,
          file: new File([stored.file], stored.name, { type: stored.type }),
          timestamp: stored.timestamp,
        }));

        dispatch({ type: "RESTORE_FILES", payload: restoredFiles });
      }
    } catch (error) {
      console.error("Error restoring files:", error);
      dispatch({
        type: "SET_ERROR",
        payload: "Error restoring files from local storage.",
      });
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  const getValidFiles = (): UploadedFile[] => {
    return state.files.filter(
      (file) => file.status === "completed" && file.documentTypeId !== "",
    );
  };

  const getTotalSize = (): number => {
    return state.files.reduce((total, file) => total + file.size, 0);
  };

  const contextValue: DocumentsContextValue = {
    state,
    actions: {
      addFiles,
      removeFile,
      updateFileDocumentType,
      updateFileTier,
      clearAllFiles,
      restoreFiles,
      getValidFiles,
      getTotalSize,
    },
  };

  return (
    <DocumentsContext.Provider value={contextValue}>
      {children}
    </DocumentsContext.Provider>
  );
}
