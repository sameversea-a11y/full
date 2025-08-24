import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { OrderCalculation, OrderItem } from "./PricingContext";
import { createPaymentOrder, verifyPayment } from "@/api/api";

export interface PaymentDetails {
  orderId?: string;
  amount: number;
  currency: string;
  orderItems: OrderItem[];
  calculation: OrderCalculation;
  customerInfo?: {
    name: string;
    email: string;
    phone: string;
  };
}

export interface PaymentResult {
  success: boolean;
  paymentId?: string;
  orderId?: string;
  signature?: string;
  error?: string;
}

interface PaymentState {
  currentPayment: PaymentDetails | null;
  isProcessing: boolean;
  error: string | null;
  lastPaymentResult: PaymentResult | null;
}

interface PaymentContextValue {
  state: PaymentState;
  actions: {
    initializePayment: (
      orderItems: OrderItem[],
      calculation: OrderCalculation,
      customerInfo?: any,
    ) => Promise<void>;
    processRazorpayPayment: () => Promise<PaymentResult>;
    clearPayment: () => void;
    retryPayment: () => Promise<PaymentResult>;
    savePaymentData: (paymentResult: PaymentResult) => void;
    getPaymentHistory: () => any[];
  };
}

const initialState: PaymentState = {
  currentPayment: null,
  isProcessing: false,
  error: null,
  lastPaymentResult: null,
};

const PaymentContext = createContext<PaymentContextValue | undefined>(
  undefined,
);

export function usePayment() {
  const context = useContext(PaymentContext);
  if (context === undefined) {
    throw new Error("usePayment must be used within a PaymentProvider");
  }
  return context;
}

// Declare Razorpay types
declare global {
  interface Window {
    Razorpay: any;
  }
}

interface PaymentProviderProps {
  children: ReactNode;
}

export function PaymentProvider({ children }: PaymentProviderProps) {
  const [state, setState] = useState<PaymentState>(initialState);

  // Load Razorpay script dynamically
  const loadRazorpayScript = useCallback((): Promise<boolean> => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => {
        resolve(true);
      };
      script.onerror = () => {
        resolve(false);
      };
      document.body.appendChild(script);
    });
  }, []);

  const initializePayment = useCallback(
    async (
      orderItems: OrderItem[],
      calculation: OrderCalculation,
      customerInfo?: any,
    ): Promise<void> => {
      // Prevent multiple simultaneous initializations
      if (state.isProcessing || state.currentPayment) {
        console.log("Payment initialization already in progress or completed");
        return;
      }

      setState((prev) => ({ ...prev, isProcessing: true, error: null }));

      try {
        // Validate inputs
        if (!orderItems.length || calculation.totalAmount <= 0) {
          throw new Error("Invalid order items or amount");
        }

        // Create payment details
        const paymentDetails: PaymentDetails = {
          amount: Math.round(calculation.totalAmount * 100), // Razorpay expects amount in paise
          currency: "INR",
          orderItems,
          calculation,
          customerInfo,
        };

        // Call external server to create Razorpay order
        const orderData = await createPaymentOrder({
          amount: paymentDetails.amount,
          currency: paymentDetails.currency,
          receipt: `receipt_${Date.now()}`,
          notes: {
            orderItemsCount: orderItems.length,
            customerEmail: customerInfo?.email || "",
            customerName: customerInfo?.name || "",
          },
        });

        if (!orderData.id) {
          throw new Error("Invalid order response from server");
        }

        setState((prev) => ({
          ...prev,
          currentPayment: {
            ...paymentDetails,
            orderId: orderData.id,
          },
          isProcessing: false,
        }));
      } catch (error) {
        console.error("Error initializing payment:", error);

        let errorMessage = "Failed to initialize payment";
        if (error instanceof Error) {
          errorMessage = error.message;
        }

        setState((prev) => ({
          ...prev,
          error: errorMessage,
          isProcessing: false,
        }));
      }
    },
    [state.isProcessing, state.currentPayment],
  );

  const processRazorpayPayment =
    useCallback(async (): Promise<PaymentResult> => {
      if (!state.currentPayment) {
        return { success: false, error: "No payment initialized" };
      }

      setState((prev) => ({ ...prev, isProcessing: true, error: null }));

      try {
        // Load Razorpay script
        const scriptLoaded = await loadRazorpayScript();
        if (!scriptLoaded) {
          throw new Error("Failed to load Razorpay");
        }

        return new Promise((resolve) => {
          // Get Razorpay configuration from environment
          const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID;
          
          if (!razorpayKey) {
            throw new Error("Razorpay configuration not found");
          }

          const options = {
            key: razorpayKey,
            amount: state.currentPayment!.amount,
            currency: state.currentPayment!.currency,
            name: "UDIN Professional Services",
            description: `Processing ${state.currentPayment!.orderItems.length} document(s)`,
            order_id: state.currentPayment!.orderId,
            handler: async function (response: any) {
              try {
                // Verify payment on external server
                const verificationResult = await verifyPayment({
                  paymentId: response.razorpay_payment_id,
                  orderId: response.razorpay_order_id,
                  signature: response.razorpay_signature,
                });

                if (verificationResult.success) {
                  const paymentResult: PaymentResult = {
                    success: true,
                    paymentId: response.razorpay_payment_id,
                    orderId: response.razorpay_order_id,
                    signature: response.razorpay_signature,
                  };

                  setState((prev) => ({
                    ...prev,
                    lastPaymentResult: paymentResult,
                    isProcessing: false,
                  }));

                  resolve(paymentResult);
                } else {
                  throw new Error("Payment verification failed");
                }
              } catch (error) {
                const errorResult: PaymentResult = {
                  success: false,
                  error:
                    error instanceof Error
                      ? error.message
                      : "Payment verification failed",
                };

                setState((prev) => ({
                  ...prev,
                  lastPaymentResult: errorResult,
                  error: errorResult.error!,
                  isProcessing: false,
                }));

                resolve(errorResult);
              }
            },
            prefill: {
              name: state.currentPayment?.customerInfo?.name || "",
              email: state.currentPayment?.customerInfo?.email || "",
              contact: state.currentPayment?.customerInfo?.phone || "",
            },
            theme: {
              color: "#8B5CF6", // Primary color from your theme
            },
            modal: {
              ondismiss: function () {
                const dismissResult: PaymentResult = {
                  success: false,
                  error: "Payment cancelled by user",
                };

                setState((prev) => ({
                  ...prev,
                  lastPaymentResult: dismissResult,
                  error: dismissResult.error!,
                  isProcessing: false,
                }));

                resolve(dismissResult);
              },
            },
          };

          const rzp = new window.Razorpay(options);
          rzp.open();
        });
      } catch (error) {
        const errorResult: PaymentResult = {
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "Payment processing failed",
        };

        setState((prev) => ({
          ...prev,
          lastPaymentResult: errorResult,
          error: errorResult.error!,
          isProcessing: false,
        }));

        return errorResult;
      }
    }, [state.currentPayment, loadRazorpayScript]);

  const retryPayment = useCallback(async (): Promise<PaymentResult> => {
    if (!state.currentPayment) {
      return { success: false, error: "No payment to retry" };
    }

    return processRazorpayPayment();
  }, [state.currentPayment, processRazorpayPayment]);

  const clearPayment = useCallback(() => {
    setState(initialState);
  }, []);

  const savePaymentData = useCallback(
    (paymentResult: PaymentResult) => {
      if (paymentResult.success && state.currentPayment) {
        const paymentData = {
          paymentId: paymentResult.paymentId,
          orderId: paymentResult.orderId,
          signature: paymentResult.signature,
          amount: state.currentPayment.amount / 100, // Convert back to rupees
          currency: state.currentPayment.currency,
          orderItems: state.currentPayment.orderItems,
          calculation: state.currentPayment.calculation,
          customerInfo: state.currentPayment.customerInfo,
          status: "completed",
          timestamp: new Date().toISOString(),
          transactionId: `TXN_${Date.now()}`,
        };

        // Save to localStorage (in production, this would be saved to database)
        const existingPayments = JSON.parse(
          localStorage.getItem("udin_payment_history") || "[]",
        );
        existingPayments.push(paymentData);
        localStorage.setItem(
          "udin_payment_history",
          JSON.stringify(existingPayments),
        );

        // Also save current payment data for backward compatibility
        localStorage.setItem("udin_payment_data", JSON.stringify(paymentData));

        // Clear temporary cost data since payment is complete
        localStorage.removeItem("udin_temp_cost");
      }
    },
    [state.currentPayment],
  );

  const getPaymentHistory = useCallback(() => {
    try {
      const history = JSON.parse(
        localStorage.getItem("udin_payment_history") || "[]",
      );
      return history;
    } catch (error) {
      console.error("Error retrieving payment history:", error);
      return [];
    }
  }, []);

  const contextValue: PaymentContextValue = {
    state,
    actions: {
      initializePayment,
      processRazorpayPayment,
      clearPayment,
      retryPayment,
      savePaymentData,
      getPaymentHistory,
    },
  };

  return (
    <PaymentContext.Provider value={contextValue}>
      {children}
    </PaymentContext.Provider>
  );
}
