import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDocuments } from "@/contexts/DocumentsContext";
import { usePricing } from "@/contexts/PricingContext";
import { usePayment } from "@/contexts/PaymentContext";

export function PaymentTest() {
  const { state: documentsState } = useDocuments();
  const { state: pricingState } = usePricing();
  const { state: paymentState } = usePayment();

  return (
    <Card className="max-w-md mx-auto m-4">
      <CardHeader>
        <CardTitle>State Management Debug</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="font-semibold">Documents State:</h4>
          <p className="text-sm">Files: {documentsState.files.length}</p>
          <p className="text-sm">
            Loading: {documentsState.isLoading ? "Yes" : "No"}
          </p>
          <p className="text-sm">Error: {documentsState.error || "None"}</p>
        </div>

        <div>
          <h4 className="font-semibold">Pricing State:</h4>
          <p className="text-sm">
            Total: ₹{pricingState.calculation.totalAmount.toFixed(2)}
          </p>
          <p className="text-sm">
            Calculating: {pricingState.isCalculating ? "Yes" : "No"}
          </p>
          <p className="text-sm">Error: {pricingState.error || "None"}</p>
        </div>

        <div>
          <h4 className="font-semibold">Payment State:</h4>
          <p className="text-sm">
            Processing: {paymentState.isProcessing ? "Yes" : "No"}
          </p>
          <p className="text-sm">
            Initialized: {paymentState.currentPayment ? "Yes" : "No"}
          </p>
          <p className="text-sm">Error: {paymentState.error || "None"}</p>
        </div>
      </CardContent>
    </Card>
  );
}
