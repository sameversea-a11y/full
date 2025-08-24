import React, { ReactNode } from "react";
import { DocumentsProvider } from "./DocumentsContext";
import { PricingProvider } from "./PricingContext";
import { PaymentProvider } from "./PaymentContext";

interface AppProvidersProps {
  children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <DocumentsProvider>
      <PricingProvider>
        <PaymentProvider>{children}</PaymentProvider>
      </PricingProvider>
    </DocumentsProvider>
  );
}
