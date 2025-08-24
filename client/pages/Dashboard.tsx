import React, { useState } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  FileText,
  Download,
  Edit,
  Trash2,
  Search,
  MoreHorizontal,
  CheckCircle,
  Clock,
  AlertCircle,
  Filter,
  Upload,
  Plus,
  X,
  Tag,
  Eye,
} from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { getUserDocuments, downloadDocument } from "@/api/api";
import { useEffect } from "react";

interface Document {
  id: string;
  name: string;
  type: string;
  uploadDate: string;
  status:
    | "processing"
    | "completed"
    | "signed"
    | "error"
    | "downloaded_by_admin"
    | "signed_document_uploaded";
  size: string;
  category: string;
  downloadedByAdmin?: boolean;
  adminDownloadDate?: string;
  signedDocumentUrl?: string;
  signedDocumentUploadDate?: string;
  canEdit: boolean;
  canDelete: boolean;
  userId: string;
}

interface UploadFile {
  id: string;
  name: string;
  size: number;
  type: string;
  status: "uploading" | "completed" | "error";
  progress: number;
  category: string;
}

export default function Dashboard() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [showPayment, setShowPayment] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  
  // Loading and error states
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [documents, setDocuments] = useState<Document[]>([]);
  
  // Load documents from external server
  useEffect(() => {
    const loadDocuments = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Get user ID from localStorage or token
        const userData = localStorage.getItem('udin_user_data');
        const userToken = localStorage.getItem('userToken');
        
        let userId = null;
        if (userData) {
          const parsedData = JSON.parse(userData);
          userId = parsedData.userId;
        }
        
        if (!userId && !userToken) {
          // Redirect to login if no user data
          navigate('/login');
          return;
        }
        
        // Fetch documents from external server
        const response = await getUserDocuments(userId || 'current', {
          status: statusFilter,
          type: typeFilter,
          category: categoryFilter,
          date: dateFilter,
          search: searchTerm,
        });
        
        if (response.success) {
          setDocuments(response.documents || []);
        } else {
          throw new Error(response.error || 'Failed to load documents');
        }
      } catch (error: any) {
        console.error('Error loading documents:', error);
        setError(error.message || 'Failed to load documents');
        
        // Fallback to mock data for development
        setDocuments([
          {
            id: "1",
            name: "Contract_Agreement.pdf",
            type: "PDF",
            uploadDate: "2024-01-15",
            status: "downloaded_by_admin",
            size: "2.4 MB",
            category: "contracts",
            downloadedByAdmin: true,
            adminDownloadDate: "2024-01-16",
            canEdit: false,
            canDelete: false,
            userId: "user-001",
          },
          // ... other mock documents
        ]);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadDocuments();
  }, [statusFilter, typeFilter, categoryFilter, dateFilter, searchTerm, navigate]);

  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch = doc.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || doc.status === statusFilter;
    const matchesType = typeFilter === "all" || doc.type === typeFilter;
    const matchesCategory =
      categoryFilter === "all" || doc.category === categoryFilter;

    let matchesDate = true;
    if (dateFilter !== "all") {
      const docDate = new Date(doc.uploadDate);
      const now = new Date();
      const daysDiff = Math.floor(
        (now.getTime() - docDate.getTime()) / (1000 * 60 * 60 * 24),
      );

      switch (dateFilter) {
        case "today":
          matchesDate = daysDiff === 0;
          break;
        case "week":
          matchesDate = daysDiff <= 7;
          break;
        case "month":
          matchesDate = daysDiff <= 30;
          break;
        default:
          matchesDate = true;
      }
    }

    return (
      matchesSearch &&
      matchesStatus &&
      matchesType &&
      matchesCategory &&
      matchesDate
    );
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredDocuments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedDocuments = filteredDocuments.slice(startIndex, endIndex);

  // Reset to first page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, typeFilter, categoryFilter, dateFilter]);

  const clearFilters = () => {
    setStatusFilter("all");
    setTypeFilter("all");
    setCategoryFilter("all");
    setDateFilter("all");
    setSearchTerm("");
  };

  const hasActiveFilters =
    statusFilter !== "all" ||
    typeFilter !== "all" ||
    categoryFilter !== "all" ||
    dateFilter !== "all" ||
    searchTerm !== "";

  const handleUploadMore = () => {
    setIsUploadModalOpen(true);
    setShowPayment(false);
    setUploadFiles([]);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    processUploadFiles(droppedFiles);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      processUploadFiles(selectedFiles);
    }
  };

  const processUploadFiles = (newFiles: File[]) => {
    if (uploadFiles.length + newFiles.length > 30) {
      alert("Maximum 30 documents allowed");
      return;
    }

    const files: UploadFile[] = newFiles.map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      type: file.type,
      status: "uploading",
      progress: 0,
      category: "uncategorized",
    }));

    setUploadFiles((prev) => [...prev, ...files]);

    // Simulate upload progress
    files.forEach((file) => {
      const interval = setInterval(() => {
        setUploadFiles((prev) =>
          prev.map((f) => {
            if (f.id === file.id) {
              const newProgress = f.progress + Math.random() * 30;
              if (newProgress >= 100) {
                clearInterval(interval);
                return { ...f, progress: 100, status: "completed" };
              }
              return { ...f, progress: newProgress };
            }
            return f;
          }),
        );
      }, 200);
    });
  };

  const removeUploadFile = (id: string) => {
    setUploadFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const updateUploadFileCategory = (id: string, category: string) => {
    setUploadFiles((prev) =>
      prev.map((f) => (f.id === id ? { ...f, category } : f)),
    );
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const fileCategories = [
    "Legal Documents",
    "Financial Records",
    "Contracts",
    "Identity Documents",
    "Insurance Papers",
    "Medical Records",
    "Tax Documents",
    "Business Documents",
    "Personal Documents",
    "Other",
  ];

  const handleContinueToPayment = () => {
    if (
      uploadFiles.length > 0 &&
      !uploadFiles.some((f) => f.category === "uncategorized")
    ) {
      setShowPayment(true);
    }
  };

  const handlePaymentComplete = () => {
    // Here you would normally process the payment
    setIsUploadModalOpen(false);
    setShowPayment(false);
    setUploadFiles([]);
    // Optionally refresh the documents list or show success message
    alert("Payment completed! Your documents will be processed shortly.");
  };

  const handleModalClose = (open: boolean) => {
    setIsUploadModalOpen(open);
    if (!open) {
      // Reset state when modal is closed
      setShowPayment(false);
      setUploadFiles([]);
      setIsDragOver(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            <CheckCircle className="h-3 w-3 mr-1" />
            Completed
          </Badge>
        );
      case "signed":
        return (
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
            <CheckCircle className="h-3 w-3 mr-1" />
            Signed
          </Badge>
        );
      case "downloaded_by_admin":
        return (
          <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">
            <Eye className="h-3 w-3 mr-1" />
            Admin Downloaded
          </Badge>
        );
      case "signed_document_uploaded":
        return (
          <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">
            <CheckCircle className="h-3 w-3 mr-1" />
            Signed Available
          </Badge>
        );
      case "processing":
        return (
          <Badge variant="secondary">
            <Clock className="h-3 w-3 mr-1" />
            Processing
          </Badge>
        );
      case "error":
        return (
          <Badge variant="destructive">
            <AlertCircle className="h-3 w-3 mr-1" />
            Error
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleDownload = (document: Document) => {
    downloadDocument(document.id, 'original')
      .then(() => {
        console.log("Downloaded:", document.name);
      })
      .catch((error) => {
        console.error("Download failed:", error);
        alert("Failed to download document. Please try again.");
      });
  };

  const handleEdit = (document: Document) => {
    if (!document.canEdit) {
      alert(
        "This document cannot be edited because it has been downloaded by admin.",
      );
      return;
    }
    console.log("Editing:", document.name);
  };

  const handleDelete = (document: Document) => {
    if (!document.canDelete) {
      alert(
        "This document cannot be deleted because it has been downloaded by admin.",
      );
      return;
    }
    if (confirm(`Are you sure you want to delete ${document.name}?`)) {
      console.log("Deleting:", document.name);
    }
  };

  const handleDownloadSigned = (document: Document) => {
    downloadDocument(document.id, 'signed')
      .then(() => {
        console.log("Downloaded signed document for:", document.name);
      })
      .catch((error) => {
        console.error("Signed document download failed:", error);
        alert("Failed to download signed document. Please try again.");
      });
  };
  
  // Show loading state
  if (isLoading) {
    return (
      <Layout title="Document Management">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your documents...</p>
          </div>
        </div>
      </Layout>
    );
  }
  
  // Show error state
  if (error) {
    return (
      <Layout title="Document Management">
        <div className="text-center py-12">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Failed to Load Documents
          </h3>
          <p className="text-gray-500 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Document Management">
      {/* Header */}
      <div className="mb-6 lg:mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-2">
            Document Management
          </h2>
          <p className="text-gray-600 text-sm lg:text-base">
            Manage and track your uploaded documents
          </p>
        </div>
        <Button
          onClick={handleUploadMore}
          className="flex items-center gap-2 w-full sm:w-auto"
          size="sm"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Upload More Documents</span>
          <span className="sm:hidden">Upload</span>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs lg:text-sm font-medium text-gray-500">
              Total Documents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl lg:text-2xl font-bold">5</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs lg:text-sm font-medium text-gray-500">
              Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl lg:text-2xl font-bold text-green-600">
              2
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs lg:text-sm font-medium text-gray-500">
              Processing
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl lg:text-2xl font-bold text-blue-600">1</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs lg:text-sm font-medium text-gray-500">
              Signed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl lg:text-2xl font-bold text-purple-600">
              1
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-gray-500" />
              <CardTitle className="text-lg">Filters</CardTitle>
            </div>
            {hasActiveFilters && (
              <Button variant="outline" size="sm" onClick={clearFilters}>
                <X className="h-4 w-4 mr-2" />
                Clear All
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Status
              </label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="signed">Signed</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                  <SelectItem value="downloaded_by_admin">
                    Downloaded by Admin
                  </SelectItem>
                  <SelectItem value="signed_document_uploaded">
                    Signed Available
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                File Type
              </label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="PDF">PDF</SelectItem>
                  <SelectItem value="DOCX">DOCX</SelectItem>
                  <SelectItem value="TXT">TXT</SelectItem>
                  <SelectItem value="DOC">DOC</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Category
              </label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="legal-documents">
                    Legal Documents
                  </SelectItem>
                  <SelectItem value="financial-records">
                    Financial Records
                  </SelectItem>
                  <SelectItem value="contracts">Contracts</SelectItem>
                  <SelectItem value="business-documents">
                    Business Documents
                  </SelectItem>
                  <SelectItem value="identity-documents">
                    Identity Documents
                  </SelectItem>
                  <SelectItem value="insurance-papers">
                    Insurance Papers
                  </SelectItem>
                  <SelectItem value="medical-records">
                    Medical Records
                  </SelectItem>
                  <SelectItem value="tax-documents">Tax Documents</SelectItem>
                  <SelectItem value="personal-documents">
                    Personal Documents
                  </SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Upload Date
              </label>
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All dates" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Dates</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">Last 7 days</SelectItem>
                  <SelectItem value="month">Last 30 days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Documents Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                Your Documents
                <Badge variant="secondary" className="text-xs">
                  {filteredDocuments.length} of {documents.length}
                </Badge>
              </CardTitle>
              <CardDescription>
                {hasActiveFilters
                  ? "Filtered view of your documents"
                  : "View and manage all your uploaded documents"}
              </CardDescription>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search documents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full sm:w-64"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {paginatedDocuments.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Document</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Upload Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead className="text-center">
                      Signed Available
                    </TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedDocuments.map((document) => (
                    <TableRow key={document.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-gray-500" />
                          <span className="font-medium">{document.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{document.type}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-xs">
                          {document.category
                            .replace(/-/g, " ")
                            .replace(/\b\w/g, (l) => l.toUpperCase())}
                        </Badge>
                      </TableCell>
                      <TableCell>{document.uploadDate}</TableCell>
                      <TableCell>{getStatusBadge(document.status)}</TableCell>
                      <TableCell className="text-gray-500">
                        {document.size}
                      </TableCell>
                      <TableCell className="text-center">
                        {document.signedDocumentUrl ? (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-green-600 border-green-200 hover:bg-green-50"
                            onClick={() => handleDownloadSigned(document)}
                          >
                            <Download className="h-3 w-3 mr-1" />
                            Download
                          </Button>
                        ) : (
                          <span className="text-gray-400 text-sm">
                            Not Available
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleDownload(document)}
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Download Original
                            </DropdownMenuItem>
                            {document.signedDocumentUrl && (
                              <DropdownMenuItem
                                onClick={() => handleDownloadSigned(document)}
                                className="text-green-600 font-medium"
                              >
                                <Download className="h-4 w-4 mr-2" />
                                Download Signed Document
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              onClick={() => handleEdit(document)}
                              disabled={!document.canEdit}
                              className={!document.canEdit ? "opacity-50" : ""}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDelete(document)}
                              disabled={!document.canDelete}
                              className={`${!document.canDelete ? "opacity-50" : "text-red-600"}`}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No documents found
              </h3>
              <p className="text-gray-500 mb-4">
                {hasActiveFilters
                  ? "No documents match your current filters. Try adjusting your search criteria."
                  : "You haven't uploaded any documents yet."}
              </p>
              {hasActiveFilters ? (
                <Button variant="outline" onClick={clearFilters}>
                  Clear Filters
                </Button>
              ) : (
                <Button onClick={handleUploadMore}>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Your First Document
                </Button>
              )}
            </div>
          )}

          {/* Pagination */}
          {filteredDocuments.length > itemsPerPage && (
            <div className="mt-6">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(prev - 1, 1))
                      }
                      className={
                        currentPage === 1
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer"
                      }
                    />
                  </PaginationItem>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => {
                      // Show first page, last page, current page, and pages around current
                      const showPage =
                        page === 1 ||
                        page === totalPages ||
                        (page >= currentPage - 1 && page <= currentPage + 1);

                      if (!showPage) {
                        // Show ellipsis for gaps
                        if (
                          (page === 2 && currentPage > 4) ||
                          (page === totalPages - 1 &&
                            currentPage < totalPages - 3)
                        ) {
                          return (
                            <PaginationItem key={page}>
                              <PaginationEllipsis />
                            </PaginationItem>
                          );
                        }
                        return null;
                      }

                      return (
                        <PaginationItem key={page}>
                          <PaginationLink
                            onClick={() => setCurrentPage(page)}
                            isActive={currentPage === page}
                            className="cursor-pointer"
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    },
                  )}

                  <PaginationItem>
                    <PaginationNext
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                      }
                      className={
                        currentPage === totalPages
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer"
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>

              <div className="text-center mt-4 text-sm text-gray-600">
                Showing {startIndex + 1} to{" "}
                {Math.min(endIndex, filteredDocuments.length)} of{" "}
                {filteredDocuments.length} documents
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upload Modal */}
      <Dialog open={isUploadModalOpen} onOpenChange={handleModalClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {showPayment ? "Complete Payment" : "Upload More Documents"}
            </DialogTitle>
          </DialogHeader>

          {!showPayment ? (
            <div className="space-y-6">
              {/* Upload Area */}
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  isDragOver
                    ? "border-primary bg-primary/5"
                    : "border-gray-300 hover:border-primary/50"
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-lg font-medium mb-2">
                  Drag and drop your files here
                </p>
                <p className="text-gray-500 mb-4">
                  or click to browse from your computer
                </p>
                <input
                  type="file"
                  multiple
                  className="hidden"
                  id="modal-file-upload"
                  onChange={handleFileSelect}
                />
                <Button asChild>
                  <label htmlFor="modal-file-upload" className="cursor-pointer">
                    Select Files
                  </label>
                </Button>
              </div>

              {/* Uploaded Files */}
              {uploadFiles.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium">
                      Files to Upload ({uploadFiles.length}/30)
                    </h3>
                    <Badge variant="outline">
                      {
                        uploadFiles.filter((f) => f.status === "completed")
                          .length
                      }{" "}
                      completed
                    </Badge>
                  </div>

                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {uploadFiles.map((file) => (
                      <div
                        key={file.id}
                        className="flex items-start gap-3 p-3 border rounded-lg bg-white"
                      >
                        <div className="flex-shrink-0 mt-1">
                          <FileText className="h-4 w-4 text-gray-500" />
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
                          <div className="flex items-center gap-2">
                            <Select
                              value={file.category}
                              onValueChange={(value) =>
                                updateUploadFileCategory(file.id, value)
                              }
                            >
                              <SelectTrigger className="w-40 h-7 text-xs">
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                              <SelectContent>
                                {fileCategories.map((category) => (
                                  <SelectItem
                                    key={category}
                                    value={category
                                      .toLowerCase()
                                      .replace(/\s+/g, "-")}
                                  >
                                    {category}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {file.status === "completed" && (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeUploadFile(file.id)}
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

              {/* Continue Button */}
              {uploadFiles.length > 0 && (
                <div className="flex justify-between items-center pt-4 border-t">
                  <p className="text-sm text-gray-500">
                    {uploadFiles.some((f) => f.category === "uncategorized")
                      ? "Please select a category for all files to continue"
                      : `Ready to upload ${uploadFiles.length} documents`}
                  </p>
                  <Button
                    onClick={handleContinueToPayment}
                    disabled={
                      uploadFiles.some((f) => f.status === "uploading") ||
                      uploadFiles.some((f) => f.category === "uncategorized")
                    }
                  >
                    Continue to Payment
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {/* Payment Summary */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium mb-2">Upload Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Documents to process:</span>
                    <span>{uploadFiles.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Processing fee per document:</span>
                    <span>₹500.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>GST (18%):</span>
                    <span>₹{(uploadFiles.length * 500 * 0.18).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-medium border-t pt-2">
                    <span>Total:</span>
                    <span>₹{(uploadFiles.length * 500 * 1.18).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Payment Actions */}
              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setShowPayment(false)}>
                  Back to Upload
                </Button>
                <Button onClick={handlePaymentComplete}>
                  Complete Payment
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
