// UDIN Price List - Document Processing Pricing Structure
// Updated based on the provided UDIN Price List Excel file

export interface DocumentType {
  id: string;
  name: string;
  category: string;
  basePrice: number;
  description: string;
  processingTime: string; // in hours
  requirements?: string[];
  udinRequired?: boolean;
}

export interface PricingTier {
  name: string;
  multiplier: number;
  description: string;
}

// Document types and their base pricing (in INR) - Updated from UDIN Price List
export const DOCUMENT_TYPES: DocumentType[] = [
  // Audit & Assurance Services
  {
    id: "audit-statutory",
    name: "Statutory Audit Report",
    category: "audit",
    basePrice: 500,
    description: "Annual statutory audit reports with UDIN",
    processingTime: "72-96",
    requirements: [
      "Auditor signature",
      "UDIN number",
      "Complete financial statements",
    ],
    udinRequired: true,
  },
  {
    id: "audit-internal",
    name: "Internal Audit Report",
    category: "audit",
    basePrice: 350,
    description: "Internal audit reports and observations",
    processingTime: "48-72",
    requirements: ["Auditor signature", "Management letter"],
    udinRequired: true,
  },
  {
    id: "audit-tax",
    name: "Tax Audit Report",
    category: "audit",
    basePrice: 450,
    description: "Tax audit under section 44AB with UDIN",
    processingTime: "72-96",
    requirements: ["CA signature", "UDIN number", "Tax audit report format"],
    udinRequired: true,
  },
  {
    id: "audit-bank",
    name: "Bank Audit Certificate",
    category: "audit",
    basePrice: 300,
    description: "Bank audit certificates and reports",
    processingTime: "48-72",
    requirements: ["Bank letterhead", "CA signature", "UDIN"],
    udinRequired: true,
  },

  // Certification Services
  {
    id: "cert-net-worth",
    name: "Net Worth Certificate",
    category: "certification",
    basePrice: 200,
    description: "Net worth certification by chartered accountant",
    processingTime: "24-48",
    requirements: ["Financial statements", "CA signature", "UDIN"],
    udinRequired: true,
  },
  {
    id: "cert-turnover",
    name: "Turnover Certificate",
    category: "certification",
    basePrice: 150,
    description: "Annual turnover certification",
    processingTime: "24-48",
    requirements: ["Books of accounts", "CA signature", "UDIN"],
    udinRequired: true,
  },
  {
    id: "cert-income",
    name: "Income Certificate",
    category: "certification",
    basePrice: 100,
    description: "Income certification for individuals/entities",
    processingTime: "12-24",
    requirements: ["Income proof", "CA signature"],
    udinRequired: true,
  },
  {
    id: "cert-project",
    name: "Project Report Certification",
    category: "certification",
    basePrice: 400,
    description: "Project feasibility and financial projections",
    processingTime: "48-96",
    requirements: [
      "Detailed project report",
      "Financial projections",
      "CA certification",
    ],
    udinRequired: true,
  },

  // Compliance Services
  {
    id: "compliance-gst",
    name: "GST Return Certification",
    category: "compliance",
    basePrice: 120,
    description: "GST return filing and certification",
    processingTime: "24-48",
    requirements: ["GST returns", "Supporting documents", "UDIN"],
    udinRequired: true,
  },
  {
    id: "compliance-roc",
    name: "ROC Compliance Certificate",
    category: "compliance",
    basePrice: 250,
    description: "Registrar of Companies compliance certification",
    processingTime: "48-72",
    requirements: ["Company documents", "Filing acknowledgments", "UDIN"],
    udinRequired: true,
  },
  {
    id: "compliance-fema",
    name: "FEMA Compliance Certificate",
    category: "compliance",
    basePrice: 300,
    description: "Foreign Exchange Management Act compliance",
    processingTime: "48-72",
    requirements: ["FEMA documents", "RBI approvals", "CA certification"],
    udinRequired: true,
  },
  {
    id: "compliance-tds",
    name: "TDS Compliance Certificate",
    category: "compliance",
    basePrice: 180,
    description: "TDS return and compliance certification",
    processingTime: "24-48",
    requirements: ["TDS returns", "26AS statement", "UDIN"],
    udinRequired: true,
  },

  // Financial Services
  {
    id: "financial-due-diligence",
    name: "Financial Due Diligence",
    category: "financial",
    basePrice: 800,
    description: "Comprehensive financial due diligence report",
    processingTime: "96-120",
    requirements: [
      "Financial statements",
      "Books of accounts",
      "Management discussions",
    ],
    udinRequired: true,
  },
  {
    id: "financial-valuation",
    name: "Business Valuation Report",
    category: "financial",
    basePrice: 600,
    description: "Business valuation for legal and commercial purposes",
    processingTime: "72-96",
    requirements: ["Financial data", "Valuation methods", "Market analysis"],
    udinRequired: true,
  },
  {
    id: "financial-loan",
    name: "Loan Documentation Review",
    category: "financial",
    basePrice: 250,
    description: "Bank loan application and documentation review",
    processingTime: "48-72",
    requirements: [
      "Financial statements",
      "Loan application",
      "CA certification",
    ],
    udinRequired: true,
  },
  {
    id: "financial-merger",
    name: "Merger & Acquisition Support",
    category: "financial",
    basePrice: 1000,
    description: "Financial advisory for M&A transactions",
    processingTime: "120-168",
    requirements: [
      "Financial statements",
      "Valuation reports",
      "Legal documents",
    ],
    udinRequired: true,
  },

  // Legal & Documentation
  {
    id: "legal-agreement-review",
    name: "Agreement Review & Certification",
    category: "legal",
    basePrice: 200,
    description: "Legal agreement review and financial certification",
    processingTime: "24-48",
    requirements: ["Legal agreements", "Financial implications", "CA review"],
    udinRequired: false,
  },
  {
    id: "legal-forensic",
    name: "Forensic Audit & Investigation",
    category: "legal",
    basePrice: 1200,
    description: "Forensic accounting and fraud investigation",
    processingTime: "168-240",
    requirements: [
      "Complete records",
      "Investigation scope",
      "Legal authorization",
    ],
    udinRequired: true,
  },
  {
    id: "legal-expert-opinion",
    name: "Expert Opinion & Testimony",
    category: "legal",
    basePrice: 500,
    description: "Expert financial opinion for legal proceedings",
    processingTime: "72-120",
    requirements: [
      "Case documents",
      "Financial analysis",
      "Court requirements",
    ],
    udinRequired: true,
  },

  // Taxation Services
  {
    id: "tax-itr-review",
    name: "Income Tax Return Review",
    category: "taxation",
    basePrice: 80,
    description: "ITR preparation and review with certification",
    processingTime: "12-24",
    requirements: [
      "Income documents",
      "Tax computations",
      "Supporting documents",
    ],
    udinRequired: false,
  },
  {
    id: "tax-assessment",
    name: "Tax Assessment Support",
    category: "taxation",
    basePrice: 300,
    description: "Tax assessment and appeal support",
    processingTime: "48-72",
    requirements: [
      "Assessment order",
      "Supporting documents",
      "Reply drafting",
    ],
    udinRequired: true,
  },
  {
    id: "tax-international",
    name: "International Tax Advisory",
    category: "taxation",
    basePrice: 600,
    description: "Transfer pricing and international tax matters",
    processingTime: "72-96",
    requirements: [
      "International transactions",
      "TP documentation",
      "Tax treaties",
    ],
    udinRequired: true,
  },

  // Company Law Services
  {
    id: "company-incorporation",
    name: "Company Incorporation Services",
    category: "company",
    basePrice: 400,
    description: "Complete company incorporation and certification",
    processingTime: "72-120",
    requirements: [
      "MOA/AOA",
      "Incorporation documents",
      "Compliance certificates",
    ],
    udinRequired: false,
  },
  {
    id: "company-annual-return",
    name: "Annual Return Filing",
    category: "company",
    basePrice: 200,
    description: "Annual return preparation and filing",
    processingTime: "48-72",
    requirements: [
      "Company records",
      "Financial statements",
      "Board resolutions",
    ],
    udinRequired: true,
  },
  {
    id: "company-closure",
    name: "Company Closure/Winding Up",
    category: "company",
    basePrice: 800,
    description: "Company closure and winding up procedures",
    processingTime: "120-240",
    requirements: ["Complete records", "NOCs", "Final accounts"],
    udinRequired: true,
  },

  // Other Professional Services
  {
    id: "other-training",
    name: "Professional Training & Workshops",
    category: "other",
    basePrice: 300,
    description: "Professional training on accounting and compliance",
    processingTime: "24-48",
    requirements: [
      "Training modules",
      "Certificates",
      "Professional development",
    ],
    udinRequired: false,
  },
  {
    id: "other-consultation",
    name: "General Professional Consultation",
    category: "other",
    basePrice: 150,
    description: "General professional consultation and advisory",
    processingTime: "12-24",
    requirements: [
      "Consultation scope",
      "Professional advice",
      "Documentation",
    ],
    udinRequired: false,
  },
];

// Pricing tiers based on service complexity and urgency
export const PRICING_TIERS: PricingTier[] = [
  {
    name: "Standard",
    multiplier: 1.0,
    description: "Regular processing within stated timeframe",
  },
  {
    name: "Express",
    multiplier: 1.5,
    description: "50% faster processing with priority handling",
  },
  {
    name: "Premium",
    multiplier: 2.0,
    description: "Fastest processing with dedicated CA support",
  },
];

// Base fees and tax rates - Updated for UDIN services
export const PRICING_CONFIG = {
  BASE_PROCESSING_FEE: 0, // No base fee
  GST_RATE: 0.18, // 18% GST
  BULK_DISCOUNT_THRESHOLD: 5, // Number of documents for bulk discount
  BULK_DISCOUNT_RATE: 0.15, // 15% discount for bulk orders
  MINIMUM_ORDER_VALUE: 100, // Minimum order value in INR
  UDIN_FEE: 0, // No additional UDIN fee
};

// Utility functions for price calculations
export class PricingCalculator {
  static calculateDocumentPrice(
    documentTypeId: string,
    tier: string = "Standard",
    quantity: number = 1,
  ): number {
    const docType = DOCUMENT_TYPES.find((dt) => dt.id === documentTypeId);
    const pricingTier = PRICING_TIERS.find((pt) => pt.name === tier);

    if (!docType || !pricingTier) {
      throw new Error("Invalid document type or pricing tier");
    }

    const basePrice = docType.basePrice * pricingTier.multiplier * quantity;

    return Math.round(basePrice * 100) / 100; // Round to 2 decimal places
  }

  static calculateOrderTotal(
    items: Array<{ documentTypeId: string; tier?: string; quantity?: number }>,
  ): {
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
  } {
    let subtotal = 0;
    const breakdown: Array<{
      documentType: string;
      quantity: number;
      unitPrice: number;
      totalPrice: number;
    }> = [];

    // Calculate subtotal for all documents
    items.forEach((item) => {
      const docType = DOCUMENT_TYPES.find(
        (dt) => dt.id === item.documentTypeId,
      );
      if (docType) {
        const quantity = item.quantity || 1;
        const tier = item.tier || "Standard";
        const tierMultiplier =
          PRICING_TIERS.find((pt) => pt.name === tier)?.multiplier || 1.0;
        const unitPrice = docType.basePrice * tierMultiplier;
        const totalPrice = unitPrice * quantity;

        subtotal += totalPrice;

        breakdown.push({
          documentType: docType.name,
          quantity,
          unitPrice,
          totalPrice,
        });
      }
    });

    // Calculate bulk discount if applicable
    const totalDocuments = items.reduce(
      (sum, item) => sum + (item.quantity || 1),
      0,
    );
    const bulkDiscount =
      totalDocuments >= PRICING_CONFIG.BULK_DISCOUNT_THRESHOLD
        ? subtotal * PRICING_CONFIG.BULK_DISCOUNT_RATE
        : 0;

    // Calculate GST
    const taxableAmount = subtotal - bulkDiscount;
    const gstAmount = taxableAmount * PRICING_CONFIG.GST_RATE;

    // Calculate total
    const totalAmount = taxableAmount + gstAmount;

    return {
      subtotal: Math.round(subtotal * 100) / 100,
      bulkDiscount: Math.round(bulkDiscount * 100) / 100,
      gstAmount: Math.round(gstAmount * 100) / 100,
      totalAmount: Math.round(totalAmount * 100) / 100,
      breakdown,
    };
  }

  static getDocumentsByCategory(category?: string): DocumentType[] {
    if (!category) return DOCUMENT_TYPES;
    return DOCUMENT_TYPES.filter((dt) => dt.category === category);
  }

  static getDocumentCategories(): Array<{
    id: string;
    name: string;
    count: number;
  }> {
    const categories = new Map();

    DOCUMENT_TYPES.forEach((dt) => {
      if (!categories.has(dt.category)) {
        categories.set(dt.category, {
          id: dt.category,
          name: this.getCategoryDisplayName(dt.category),
          count: 0,
        });
      }
      categories.get(dt.category).count++;
    });

    return Array.from(categories.values());
  }

  static getCategoryDisplayName(category: string): string {
    const categoryNames: Record<string, string> = {
      audit: "Audit & Assurance",
      certification: "Certification Services",
      compliance: "Compliance Services",
      financial: "Financial Services",
      legal: "Legal & Documentation",
      taxation: "Taxation Services",
      company: "Company Law Services",
      other: "Other Professional Services",
    };

    return (
      categoryNames[category] ||
      category.charAt(0).toUpperCase() + category.slice(1)
    );
  }

  static estimateProcessingTime(documentTypeId: string): string {
    const docType = DOCUMENT_TYPES.find((dt) => dt.id === documentTypeId);
    return docType?.processingTime || "24-48";
  }

  static requiresUdin(documentTypeId: string): boolean {
    const docType = DOCUMENT_TYPES.find((dt) => dt.id === documentTypeId);
    return docType?.udinRequired || false;
  }
}

// Export for use in components
export { PricingCalculator as default };
