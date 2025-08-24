import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Trash2,
  Upload as UploadIcon,
  FileText,
  AlertCircle,
  CheckCircle2,
  Tag,
  Calculator,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DOCUMENT_TYPES, PricingCalculator } from "@shared/pricing";
import { useDocuments } from "@/contexts/DocumentsContext";
import { usePricing } from "@/contexts/PricingContext";

export default function Upload(): JSX.Element {
  const navigate = useNavigate();
  const { state: documentsState, actions: documentsActions } = useDocuments();
  const { state: pricingState, actions: pricingActions } = usePricing();

  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const [showCostPopup, setShowCostPopup] = useState<boolean>(false);

  // Update pricing calculation whenever files change
  useEffect(() => {
    if (documentsState.files.length > 0) {
      pricingActions.updateOrderFromFiles(documentsState.files);
    }
  }, [documentsState.files, pricingActions]);

  const handleDragOver = useCallback(
    (e: React.DragEvent<HTMLDivElement>): void => {
      e.preventDefault();
      setIsDragOver(true);
    },
    [],
  );

  const handleDragLeave = useCallback(
    (e: React.DragEvent<HTMLDivElement>): void => {
      e.preventDefault();
      setIsDragOver(false);
    },
    [],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>): void => {
      e.preventDefault();
      setIsDragOver(false);
      const droppedFiles = Array.from(e.dataTransfer.files);
      documentsActions.addFiles(droppedFiles);
    },
    [documentsActions],
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>): void => {
      if (e.target.files) {
        const selectedFiles = Array.from(e.target.files);
        documentsActions.addFiles(selectedFiles);
      }
    },
    [documentsActions],
  );

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getFileIcon = (type: string): JSX.Element => {
    return <FileText className="h-4 w-4" />;
  };

  const getStatusIcon = (status: string): JSX.Element | null => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case "pending":
        return <FileText className="h-4 w-4 text-blue-500" />;
      case "uploading":
        return <UploadIcon className="h-4 w-4 text-yellow-500 animate-spin" />;
      default:
        return null;
    }
  };

  const handleContinue = (): void => {
    if (documentsState.files.length > 0) {
      setShowCostPopup(true);
    }
  };

  const handleProceedToRegistration = async (): Promise<void> => {
    const validFiles = documentsActions.getValidFiles();

    if (validFiles.length === 0) {
      return;
    }

    try {
      // Save cost breakdown metadata in localStorage for backward compatibility
      const costBreakdown = pricingActions.calculateFromFiles(validFiles);
      const orderSummary = pricingActions.getOrderSummary();

      const tempCostData = {
        costBreakdown,
        filesCount: validFiles.length,
        fileIds: validFiles.map((f) => f.id),
        orderSummary,
        timestamp: new Date().toISOString(),
      };

      localStorage.setItem("udin_temp_cost", JSON.stringify(tempCostData));

      setShowCostPopup(false);
      navigate("/signup");
    } catch (error) {
      console.error("Error saving cost data:", error);
    }
  };

  const documentCategories = PricingCalculator.getDocumentCategories();

  // Show loading state while restoring files
  if (documentsState.isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-lg font-medium text-gray-700">
            Restoring your files...
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Please wait while we load your previously uploaded documents
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div
              className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => navigate("/")}
            >
              <FileText className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold text-gray-900">UDIN</span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/signup")}
              >
                Signup
              </Button>
            </nav>

            {/* Tablet Navigation */}
            <div className="hidden md:flex lg:hidden items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/signup")}
              >
                Signup
              </Button>
            </div>

            {/* Mobile Navigation */}
            <div className="md:hidden flex gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/signup")}
                className="text-xs px-2"
              >
                Sign Up
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4 px-4">
              UDIN Professional Services
            </h1>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto px-4">
              Upload your documents for professional UDIN processing. Supported
              formats: JPG, JPEG, PDF, Word Files, Excel (1KB - 50MB)
            </p>
            {documentsState.files.length > 0 && (
              <div className="mt-4">
                <Badge
                  variant="secondary"
                  className="text-green-700 bg-green-100"
                >
                  {documentsState.completedFiles} of {documentsState.totalFiles}{" "}
                  files uploaded
                </Badge>
              </div>
            )}
          </div>

          {/* Error Display */}
          {documentsState.error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{documentsState.error}</AlertDescription>
            </Alert>
          )}

          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UploadIcon className="h-5 w-5" />
                Upload Documents
              </CardTitle>
              <CardDescription>
                Upload your documents for UDIN processing. Supported formats:
                JPG, JPEG, PDF, Word Files, Excel. File size: 1KB - 50MB.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div
                className={cn(
                  "border-2 border-dashed rounded-lg p-4 sm:p-6 lg:p-8 text-center transition-colors",
                  isDragOver
                    ? "border-primary bg-primary/5"
                    : "border-gray-300 hover:border-primary/50",
                )}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <UploadIcon className="mx-auto h-8 sm:h-10 lg:h-12 w-8 sm:w-10 lg:w-12 text-gray-400 mb-3 sm:mb-4" />
                <p className="text-base sm:text-lg font-medium mb-2">
                  Drag and drop your files here
                </p>
                <p className="text-sm sm:text-base text-gray-500 mb-3 sm:mb-4">
                  or click to browse from your computer
                </p>
                <input
                  type="file"
                  multiple
                  className="hidden"
                  id="file-upload"
                  onChange={handleFileSelect}
                />
                <Button asChild>
                  <label htmlFor="file-upload" className="cursor-pointer">
                    Select Files
                  </label>
                </Button>
              </div>

              {documentsState.files.length > 0 && (
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium">
                      Uploaded Files ({documentsState.totalFiles}/30)
                    </h3>
                    <Badge variant="outline">
                      {documentsState.completedFiles} completed
                    </Badge>
                  </div>

                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {documentsState.files.map((file) => (
                      <div
                        key={file.id}
                        className="flex items-start gap-3 p-4 border rounded-lg bg-white"
                      >
                        <div className="flex-shrink-0 mt-1">
                          {getFileIcon(file.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {file.name}
                          </p>
                          <p className="text-xs text-gray-500 mb-2">
                            {formatFileSize(file.size)}
                          </p>
                          {file.status === "uploading" && (
                            <Progress
                              value={file.progress}
                              className="mb-2 h-1"
                            />
                          )}
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Tag className="h-3 w-3 text-gray-400" />
                              <Select
                                value={file.documentTypeId}
                                onValueChange={(value) =>
                                  documentsActions.updateFileDocumentType(
                                    file.id,
                                    value,
                                  )
                                }
                              >
                                <SelectTrigger className="w-48 h-7 text-xs">
                                  <SelectValue placeholder="Select document type" />
                                </SelectTrigger>
                                <SelectContent>
                                  {documentCategories.map((category) => (
                                    <div key={category.id}>
                                      <div className="px-2 py-1 text-xs font-semibold text-gray-500 bg-gray-50">
                                        {category.name}
                                      </div>
                                      {DOCUMENT_TYPES.filter(
                                        (dt) => dt.category === category.id,
                                      ).map((docType) => (
                                        <SelectItem
                                          key={docType.id}
                                          value={docType.id}
                                          className="pl-4"
                                        >
                                          {docType.name} - ₹{docType.basePrice}
                                        </SelectItem>
                                      ))}
                                    </div>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(file.status)}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => documentsActions.removeFile(file.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {documentsState.files.length > 0 && (
            <div className="text-center">
              <Button
                size="lg"
                onClick={handleContinue}
                disabled={
                  documentsState.isLoading ||
                  documentsActions.getValidFiles().length === 0
                }
                className="px-8"
              >
                Continue to Sign-up
              </Button>
              <p className="text-sm text-gray-500 mt-2">
                {documentsActions.getValidFiles().length === 0
                  ? "Please select a document type for all files to continue"
                  : "Next: Sign-up with OTP verification"}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Cost Calculation Popup */}
      <Dialog open={showCostPopup} onOpenChange={setShowCostPopup}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Cost Breakdown
            </DialogTitle>
            <DialogDescription>
              Review the total cost for processing your documents
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg space-y-3">
              {/* Document breakdown */}
              {pricingState.calculation.breakdown.map((item, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    {item.documentType} × {item.quantity}
                  </span>
                  <span className="font-medium">
                    ₹{item.totalPrice.toFixed(2)}
                  </span>
                </div>
              ))}

              <div className="border-t pt-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    Documents Subtotal
                  </span>
                  <span className="font-medium">
                    ₹{pricingState.calculation.subtotal.toFixed(2)}
                  </span>
                </div>
              </div>

              {pricingState.calculation.bulkDiscount > 0 && (
                <div className="flex justify-between items-center text-green-600">
                  <span className="text-sm">Bulk Discount (5+ services)</span>
                  <span className="font-medium">
                    -₹{pricingState.calculation.bulkDiscount.toFixed(2)}
                  </span>
                </div>
              )}

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">GST (18%)</span>
                <span className="font-medium">
                  ₹{pricingState.calculation.gstAmount.toFixed(2)}
                </span>
              </div>

              <div className="border-t pt-2">
                <div className="flex justify-between items-center text-lg">
                  <span className="font-semibold">Total Amount</span>
                  <span className="font-bold text-primary">
                    ₹{pricingState.calculation.totalAmount.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            <div className="text-xs text-gray-500 text-center">
              Files are stored locally. Payment will be collected during
              registration.
            </div>
          </div>

          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setShowCostPopup(false)}>
              Cancel
            </Button>
            <Button onClick={handleProceedToRegistration}>
              Continue to Registration
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
