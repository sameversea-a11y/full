import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";
import {
  PricingCalculator,
  DOCUMENT_TYPES,
  PRICING_TIERS,
} from "@shared/pricing";
import { UploadedFile } from "./DocumentsContext";

export interface OrderItem {
  documentTypeId: string;
  tier: string;
  quantity: number;
  fileName?: string;
  fileId?: string;
}

export interface OrderCalculation {
  subtotal: number;
  bulkDiscount: number;
  gstAmount: number;
  totalAmount: number;
  breakdown: Array<{
    documentType: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
}

interface PricingState {
  currentOrder: OrderItem[];
  calculation: OrderCalculation;
  isCalculating: boolean;
  error: string | null;
}

interface PricingContextValue {
  state: PricingState;
  actions: {
    calculateFromFiles: (files: UploadedFile[]) => OrderCalculation;
    updateOrderFromFiles: (files: UploadedFile[]) => void;
    clearOrder: () => void;
    getOrderSummary: () => {
      totalDocuments: number;
      totalAmount: number;
      hasValidOrder: boolean;
      requiresUdin: boolean;
    };
    validateOrder: () => { isValid: boolean; errors: string[] };
    estimateProcessingTime: () => string;
  };
}

const initialState: PricingState = {
  currentOrder: [],
  calculation: {
    subtotal: 0,
    bulkDiscount: 0,
    gstAmount: 0,
    totalAmount: 0,
    breakdown: [],
  },
  isCalculating: false,
  error: null,
};

const PricingContext = createContext<PricingContextValue | undefined>(
  undefined,
);

export function usePricing() {
  const context = useContext(PricingContext);
  if (context === undefined) {
    throw new Error("usePricing must be used within a PricingProvider");
  }
  return context;
}

interface PricingProviderProps {
  children: ReactNode;
}

export function PricingProvider({ children }: PricingProviderProps) {
  const [state, setState] = useState<PricingState>(initialState);

  const calculateFromFiles = useCallback(
    (files: UploadedFile[]): OrderCalculation => {
      try {
        setState((prev) => ({ ...prev, isCalculating: true, error: null }));

        const items = files
          .filter((file) => file.documentTypeId && file.status === "completed")
          .map((file) => ({
            documentTypeId: file.documentTypeId,
            tier: file.tier || "Standard",
            quantity: 1,
          }));

        if (items.length === 0) {
          const emptyCalculation = {
            subtotal: 0,
            bulkDiscount: 0,
            gstAmount: 0,
            totalAmount: 0,
            breakdown: [],
          };

          setState((prev) => ({
            ...prev,
            calculation: emptyCalculation,
            isCalculating: false,
          }));

          return emptyCalculation;
        }

        const calculation = PricingCalculator.calculateOrderTotal(items);

        setState((prev) => ({
          ...prev,
          calculation,
          isCalculating: false,
        }));

        return calculation;
      } catch (error) {
        console.error("Error calculating pricing:", error);
        const errorMessage =
          error instanceof Error ? error.message : "Error calculating pricing";

        setState((prev) => ({
          ...prev,
          error: errorMessage,
          isCalculating: false,
        }));

        return {
          subtotal: 0,
          bulkDiscount: 0,
          gstAmount: 0,
          totalAmount: 0,
          breakdown: [],
        };
      }
    },
    [],
  );

  const updateOrderFromFiles = useCallback(
    (files: UploadedFile[]) => {
      const orderItems: OrderItem[] = files
        .filter((file) => file.documentTypeId && file.status === "completed")
        .map((file) => ({
          documentTypeId: file.documentTypeId,
          tier: file.tier || "Standard",
          quantity: 1,
          fileName: file.name,
          fileId: file.id,
        }));

      const calculation = calculateFromFiles(files);

      setState((prev) => ({
        ...prev,
        currentOrder: orderItems,
        calculation,
      }));
    },
    [calculateFromFiles],
  );

  const clearOrder = useCallback(() => {
    setState(initialState);
  }, []);

  const getOrderSummary = useCallback(() => {
    const totalDocuments = state.currentOrder.reduce(
      (sum, item) => sum + item.quantity,
      0,
    );
    const hasValidOrder =
      state.currentOrder.length > 0 && state.calculation.totalAmount > 0;

    // Check if any document types require UDIN
    const requiresUdin = state.currentOrder.some((item) => {
      const docType = DOCUMENT_TYPES.find(
        (dt) => dt.id === item.documentTypeId,
      );
      return docType?.udinRequired;
    });

    return {
      totalDocuments,
      totalAmount: state.calculation.totalAmount,
      hasValidOrder,
      requiresUdin,
    };
  }, [state.currentOrder, state.calculation]);

  const validateOrder = useCallback(() => {
    const errors: string[] = [];

    if (state.currentOrder.length === 0) {
      errors.push("No documents in order");
    }

    if (state.calculation.totalAmount <= 0) {
      errors.push("Invalid total amount");
    }

    // Validate each order item
    state.currentOrder.forEach((item, index) => {
      const docType = DOCUMENT_TYPES.find(
        (dt) => dt.id === item.documentTypeId,
      );
      if (!docType) {
        errors.push(`Invalid document type for item ${index + 1}`);
      }

      const tier = PRICING_TIERS.find((pt) => pt.name === item.tier);
      if (!tier) {
        errors.push(`Invalid tier for item ${index + 1}`);
      }

      if (item.quantity <= 0) {
        errors.push(`Invalid quantity for item ${index + 1}`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
    };
  }, [state.currentOrder, state.calculation]);

  const estimateProcessingTime = useCallback(() => {
    if (state.currentOrder.length === 0) {
      return "N/A";
    }

    // Get the maximum processing time from all documents
    let maxProcessingHours = 0;

    state.currentOrder.forEach((item) => {
      const docType = DOCUMENT_TYPES.find(
        (dt) => dt.id === item.documentTypeId,
      );
      if (docType?.processingTime) {
        // Parse processing time (e.g., "24-48" or "72-96")
        const timeRange = docType.processingTime.split("-");
        const maxTime = parseInt(timeRange[timeRange.length - 1]);
        if (maxTime > maxProcessingHours) {
          maxProcessingHours = maxTime;
        }
      }
    });

    // Apply tier multipliers
    const hasExpressTier = state.currentOrder.some(
      (item) => item.tier === "Express",
    );
    const hasPremiumTier = state.currentOrder.some(
      (item) => item.tier === "Premium",
    );

    if (hasPremiumTier) {
      maxProcessingHours = Math.ceil(maxProcessingHours * 0.5); // 50% faster
    } else if (hasExpressTier) {
      maxProcessingHours = Math.ceil(maxProcessingHours * 0.67); // 33% faster
    }

    if (maxProcessingHours <= 24) {
      return `${maxProcessingHours} hours`;
    } else if (maxProcessingHours <= 48) {
      return `${Math.ceil(maxProcessingHours / 24)} day${Math.ceil(maxProcessingHours / 24) > 1 ? "s" : ""}`;
    } else {
      return `${Math.ceil(maxProcessingHours / 24)} days`;
    }
  }, [state.currentOrder]);

  const contextValue: PricingContextValue = {
    state,
    actions: {
      calculateFromFiles,
      updateOrderFromFiles,
      clearOrder,
      getOrderSummary,
      validateOrder,
      estimateProcessingTime,
    },
  };

  return (
    <PricingContext.Provider value={contextValue}>
      {children}
    </PricingContext.Provider>
  );
}
