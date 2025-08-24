import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  FileText,
  Download,
  Upload,
  Search,
  MoreHorizontal,
  CheckCircle,
  Clock,
  AlertCircle,
  Filter,
  X,
  Eye,
  Edit,
  Users,
  Receipt,
  Settings,
  ArrowLeft,
  User,
  DollarSign,
  Calendar,
  ChevronRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  SlidersHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface BackofficeDocument {
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
  userName: string;
  userEmail: string;
}

interface BackofficeTransaction {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  date: string;
  description: string;
  amount: number;
  status: "completed" | "pending" | "failed" | "refunded";
  type: "document_processing" | "subscription" | "refund" | "credit";
  paymentMethod: "credit_card" | "paypal" | "bank_transfer";
  invoiceId: string;
  documents?: string[];
}

interface UserSummary {
  userId: string;
  userName: string;
  userEmail: string;
  joinDate: string;
  totalDocuments: number;
  pendingDocuments: number;
  completedDocuments: number;
  signedDocuments: number;
  totalSpent: number;
  lastActivity: string;
  accountType: "premium" | "standard" | "enterprise";
}

interface UploadSignedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  status: "uploading" | "completed" | "error";
  progress: number;
}

type SortKey =
  | "userName"
  | "accountType"
  | "totalDocuments"
  | "pendingDocuments"
  | "signedDocuments"
  | "totalSpent"
  | "lastActivity";
type SortDirection = "asc" | "desc" | null;

export default function BackofficeAdmin() {
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState<"users" | "user-detail">(
    "users",
  );
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("documents");

  // Sorting state
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  // User list state
  const [userSearchTerm, setUserSearchTerm] = useState("");
  const [userStatusFilter, setUserStatusFilter] = useState<string>("all");
  const [userAccountTypeFilter, setUserAccountTypeFilter] =
    useState<string>("all");
  const [userDateRangeFilter, setUserDateRangeFilter] = useState<string>("all");
  const [userCurrentPage, setUserCurrentPage] = useState(1);
  const [userItemsPerPage] = useState(10);

  // Documents state
  const [docSearchTerm, setDocSearchTerm] = useState("");
  const [docStatusFilter, setDocStatusFilter] = useState<string>("all");
  const [docCategoryFilter, setDocCategoryFilter] = useState<string>("all");
  const [docCurrentPage, setDocCurrentPage] = useState(1);
  const [docItemsPerPage] = useState(10);

  // Modals state
  const [selectedDocument, setSelectedDocument] =
    useState<BackofficeDocument | null>(null);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isUploadSignedModalOpen, setIsUploadSignedModalOpen] = useState(false);
  const [uploadSignedFiles, setUploadSignedFiles] = useState<
    UploadSignedFile[]
  >([]);
  const [isDragOver, setIsDragOver] = useState(false);

  // Status change state
  const [newStatus, setNewStatus] = useState<string>("");
  const [statusComment, setStatusComment] = useState("");

  const [documents, setDocuments] = useState<BackofficeDocument[]>([
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
      userName: "John Doe",
      userEmail: "john.doe@example.com",
    },
    {
      id: "2",
      name: "Financial_Statement.docx",
      type: "DOCX",
      uploadDate: "2024-01-14",
      status: "signed_document_uploaded",
      size: "1.8 MB",
      category: "financial-records",
      downloadedByAdmin: true,
      adminDownloadDate: "2024-01-15",
      signedDocumentUrl: "/signed/Financial_Statement_signed.pdf",
      signedDocumentUploadDate: "2024-01-16",
      canEdit: false,
      canDelete: false,
      userId: "user-001",
      userName: "John Doe",
      userEmail: "john.doe@example.com",
    },
    {
      id: "3",
      name: "Project_Proposal.pdf",
      type: "PDF",
      uploadDate: "2024-01-13",
      status: "processing",
      size: "3.2 MB",
      category: "business-documents",
      canEdit: true,
      canDelete: true,
      userId: "user-001",
      userName: "John Doe",
      userEmail: "john.doe@example.com",
    },
    {
      id: "4",
      name: "Invoice_2024.pdf",
      type: "PDF",
      uploadDate: "2024-01-12",
      status: "completed",
      size: "890 KB",
      category: "financial-records",
      canEdit: true,
      canDelete: true,
      userId: "user-002",
      userName: "Jane Smith",
      userEmail: "jane.smith@example.com",
    },
    {
      id: "5",
      name: "Legal_Document.pdf",
      type: "PDF",
      uploadDate: "2024-01-11",
      status: "error",
      size: "1.5 MB",
      category: "legal-documents",
      canEdit: true,
      canDelete: true,
      userId: "user-003",
      userName: "Bob Johnson",
      userEmail: "bob.johnson@example.com",
    },
    {
      id: "6",
      name: "Insurance_Policy.pdf",
      type: "PDF",
      uploadDate: "2024-01-10",
      status: "processing",
      size: "2.1 MB",
      category: "insurance-papers",
      canEdit: true,
      canDelete: true,
      userId: "user-002",
      userName: "Jane Smith",
      userEmail: "jane.smith@example.com",
    },
    {
      id: "7",
      name: "Tax_Return_2023.pdf",
      type: "PDF",
      uploadDate: "2024-01-09",
      status: "completed",
      size: "3.8 MB",
      category: "tax-documents",
      canEdit: true,
      canDelete: true,
      userId: "user-003",
      userName: "Bob Johnson",
      userEmail: "bob.johnson@example.com",
    },
    {
      id: "8",
      name: "Employment_Contract.pdf",
      type: "PDF",
      uploadDate: "2024-01-08",
      status: "processing",
      size: "980 KB",
      category: "legal-documents",
      canEdit: true,
      canDelete: true,
      userId: "user-004",
      userName: "Alice Brown",
      userEmail: "alice.brown@example.com",
    },
    {
      id: "9",
      name: "Medical_Records.pdf",
      type: "PDF",
      uploadDate: "2024-01-07",
      status: "completed",
      size: "1.2 MB",
      category: "medical-records",
      canEdit: true,
      canDelete: true,
      userId: "user-004",
      userName: "Alice Brown",
      userEmail: "alice.brown@example.com",
    },
  ]);

  const [transactions] = useState<BackofficeTransaction[]>([
    {
      id: "txn_001",
      userId: "user-001",
      userName: "John Doe",
      userEmail: "john.doe@example.com",
      date: "2024-01-15T10:30:00Z",
      description: "Document Processing - Contract Analysis",
      amount: 25.0,
      status: "completed",
      type: "document_processing",
      paymentMethod: "credit_card",
      invoiceId: "INV-2024-001",
      documents: ["Contract_Agreement.pdf"],
    },
    {
      id: "txn_002",
      userId: "user-001",
      userName: "John Doe",
      userEmail: "john.doe@example.com",
      date: "2024-01-14T15:45:00Z",
      description: "Premium Subscription - Monthly",
      amount: 29.99,
      status: "completed",
      type: "subscription",
      paymentMethod: "credit_card",
      invoiceId: "INV-2024-002",
    },
    {
      id: "txn_003",
      userId: "user-002",
      userName: "Jane Smith",
      userEmail: "jane.smith@example.com",
      date: "2024-01-12T09:15:00Z",
      description: "Document Processing - Invoice Analysis",
      amount: 15.0,
      status: "completed",
      type: "document_processing",
      paymentMethod: "paypal",
      invoiceId: "INV-2024-003",
      documents: ["Invoice_2024.pdf"],
    },
    {
      id: "txn_004",
      userId: "user-003",
      userName: "Bob Johnson",
      userEmail: "bob.johnson@example.com",
      date: "2024-01-10T14:20:00Z",
      description: "Document Processing - Tax Return",
      amount: 35.0,
      status: "pending",
      type: "document_processing",
      paymentMethod: "bank_transfer",
      invoiceId: "INV-2024-004",
      documents: ["Tax_Return_2023.pdf"],
    },
    {
      id: "txn_005",
      userId: "user-004",
      userName: "Alice Brown",
      userEmail: "alice.brown@example.com",
      date: "2024-01-08T11:30:00Z",
      description: "Document Processing - Medical Records",
      amount: 20.0,
      status: "completed",
      type: "document_processing",
      paymentMethod: "credit_card",
      invoiceId: "INV-2024-005",
      documents: ["Medical_Records.pdf"],
    },
    {
      id: "txn_006",
      userId: "user-002",
      userName: "Jane Smith",
      userEmail: "jane.smith@example.com",
      date: "2024-01-06T16:20:00Z",
      description: "Standard Subscription - Monthly",
      amount: 19.99,
      status: "completed",
      type: "subscription",
      paymentMethod: "credit_card",
      invoiceId: "INV-2024-006",
    },
  ]);

  // Generate user summaries from documents and transactions
  const userSummaries: UserSummary[] = Array.from(
    new Set(documents.map((doc) => doc.userId)),
  ).map((userId) => {
    const userDocs = documents.filter((doc) => doc.userId === userId);
    const userTransactions = transactions.filter(
      (txn) => txn.userId === userId,
    );
    const user = userDocs[0]; // Get user info from first document

    return {
      userId,
      userName: user.userName,
      userEmail: user.userEmail,
      joinDate: "2023-01-15", // Mock join date
      totalDocuments: userDocs.length,
      pendingDocuments: userDocs.filter((doc) => doc.status === "processing")
        .length,
      completedDocuments: userDocs.filter(
        (doc) =>
          doc.status === "completed" ||
          doc.status === "signed_document_uploaded",
      ).length,
      signedDocuments: userDocs.filter(
        (doc) => doc.status === "signed_document_uploaded",
      ).length,
      totalSpent: userTransactions.reduce((sum, txn) => sum + txn.amount, 0),
      lastActivity:
        userDocs.sort(
          (a, b) =>
            new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime(),
        )[0]?.uploadDate || "2024-01-01",
      accountType: userTransactions.some((txn) =>
        txn.description.includes("Premium"),
      )
        ? "premium"
        : "standard",
    };
  });

  // Sorting function
  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      if (sortDirection === "asc") {
        setSortDirection("desc");
      } else if (sortDirection === "desc") {
        setSortKey(null);
        setSortDirection(null);
      }
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
  };

  // Filter and sort users
  const filteredAndSortedUsers = (() => {
    let filtered = userSummaries.filter((user) => {
      const matchesSearch =
        user.userName.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
        user.userEmail.toLowerCase().includes(userSearchTerm.toLowerCase());

      const matchesStatus =
        userStatusFilter === "all" ||
        (userStatusFilter === "active" && user.totalDocuments > 0) ||
        (userStatusFilter === "inactive" && user.totalDocuments === 0);

      const matchesAccountType =
        userAccountTypeFilter === "all" ||
        user.accountType === userAccountTypeFilter;

      const matchesDateRange = (() => {
        if (userDateRangeFilter === "all") return true;
        const now = new Date();
        const lastActivity = new Date(user.lastActivity);
        const diffDays = Math.floor(
          (now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24),
        );

        switch (userDateRangeFilter) {
          case "7days":
            return diffDays <= 7;
          case "30days":
            return diffDays <= 30;
          case "90days":
            return diffDays <= 90;
          default:
            return true;
        }
      })();

      return (
        matchesSearch && matchesStatus && matchesAccountType && matchesDateRange
      );
    });

    // Sort if sorting is active
    if (sortKey && sortDirection) {
      filtered.sort((a, b) => {
        let aValue: any = a[sortKey];
        let bValue: any = b[sortKey];

        // Handle date sorting
        if (sortKey === "lastActivity") {
          aValue = new Date(aValue).getTime();
          bValue = new Date(bValue).getTime();
        }

        // Handle string sorting
        if (typeof aValue === "string" && typeof bValue === "string") {
          aValue = aValue.toLowerCase();
          bValue = bValue.toLowerCase();
        }

        if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
        if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  })();

  // Pagination for users
  const userTotalPages = Math.ceil(
    filteredAndSortedUsers.length / userItemsPerPage,
  );
  const userStartIndex = (userCurrentPage - 1) * userItemsPerPage;
  const userEndIndex = userStartIndex + userItemsPerPage;
  const paginatedUsers = filteredAndSortedUsers.slice(
    userStartIndex,
    userEndIndex,
  );

  // Get current user details
  const currentUser = userSummaries.find(
    (user) => user.userId === selectedUserId,
  );
  const currentUserDocuments = documents.filter(
    (doc) => doc.userId === selectedUserId,
  );
  const currentUserTransactions = transactions.filter(
    (txn) => txn.userId === selectedUserId,
  );

  // Filter documents for selected user
  const filteredUserDocuments = currentUserDocuments.filter((doc) => {
    const matchesSearch = doc.name
      .toLowerCase()
      .includes(docSearchTerm.toLowerCase());
    const matchesStatus =
      docStatusFilter === "all" || doc.status === docStatusFilter;
    const matchesCategory =
      docCategoryFilter === "all" || doc.category === docCategoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  // Pagination for user documents
  const docTotalPages = Math.ceil(
    filteredUserDocuments.length / docItemsPerPage,
  );
  const docStartIndex = (docCurrentPage - 1) * docItemsPerPage;
  const docEndIndex = docStartIndex + docItemsPerPage;
  const paginatedUserDocuments = filteredUserDocuments.slice(
    docStartIndex,
    docEndIndex,
  );

  const handleUserClick = (userId: string) => {
    setSelectedUserId(userId);
    setCurrentView("user-detail");
    setDocCurrentPage(1);
    setDocSearchTerm("");
    setDocStatusFilter("all");
    setDocCategoryFilter("all");
  };

  const handleBackToUsers = () => {
    setCurrentView("users");
    setSelectedUserId(null);
    setActiveTab("documents");
  };

  const clearUserFilters = () => {
    setUserSearchTerm("");
    setUserStatusFilter("all");
    setUserAccountTypeFilter("all");
    setUserDateRangeFilter("all");
    setSortKey(null);
    setSortDirection(null);
    setUserCurrentPage(1);
  };

  const clearDocFilters = () => {
    setDocSearchTerm("");
    setDocStatusFilter("all");
    setDocCategoryFilter("all");
    setDocCurrentPage(1);
  };

  const hasActiveUserFilters =
    userSearchTerm !== "" ||
    userStatusFilter !== "all" ||
    userAccountTypeFilter !== "all" ||
    userDateRangeFilter !== "all" ||
    sortKey !== null;

  const hasActiveDocFilters =
    docSearchTerm !== "" ||
    docStatusFilter !== "all" ||
    docCategoryFilter !== "all";

  const handleDownloadDocument = (document: BackofficeDocument) => {
    console.log("Admin downloading:", document.name);

    setDocuments((prev) =>
      prev.map((doc) =>
        doc.id === document.id
          ? {
              ...doc,
              downloadedByAdmin: true,
              adminDownloadDate: new Date().toISOString(),
              status: "downloaded_by_admin",
              canEdit: false,
              canDelete: false,
            }
          : doc,
      ),
    );

    alert(
      `Downloaded ${document.name} successfully. User can no longer edit/delete this document.`,
    );
  };

  const handleStatusChange = (document: BackofficeDocument) => {
    setSelectedDocument(document);
    setNewStatus(document.status);
    setStatusComment("");
    setIsStatusModalOpen(true);
  };

  const handleUploadSigned = (document: BackofficeDocument) => {
    setSelectedDocument(document);
    setIsUploadSignedModalOpen(true);
    setUploadSignedFiles([]);
  };

  const handleStatusUpdate = () => {
    if (selectedDocument && newStatus) {
      setDocuments((prev) =>
        prev.map((doc) =>
          doc.id === selectedDocument.id
            ? { ...doc, status: newStatus as any }
            : doc,
        ),
      );
      setIsStatusModalOpen(false);
      alert(`Status updated to ${newStatus} for ${selectedDocument.name}`);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge variant="secondary" className="text-green-700 bg-green-50">
            Completed
          </Badge>
        );
      case "processing":
        return (
          <Badge variant="secondary" className="text-blue-700 bg-blue-50">
            Processing
          </Badge>
        );
      case "error":
        return <Badge variant="destructive">Error</Badge>;
      case "downloaded_by_admin":
        return (
          <Badge variant="secondary" className="text-orange-700 bg-orange-50">
            Downloaded
          </Badge>
        );
      case "signed_document_uploaded":
        return (
          <Badge variant="secondary" className="text-purple-700 bg-purple-50">
            Signed
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && selectedDocument) {
      const selectedFiles = Array.from(e.target.files);
      processSignedFiles(selectedFiles);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (selectedDocument) {
      const droppedFiles = Array.from(e.dataTransfer.files);
      processSignedFiles(droppedFiles);
    }
  };

  const processSignedFiles = (newFiles: File[]) => {
    const files: UploadSignedFile[] = newFiles.map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      type: file.type,
      status: "uploading",
      progress: 0,
    }));

    setUploadSignedFiles(files);

    files.forEach((file) => {
      const interval = setInterval(() => {
        setUploadSignedFiles((prev) =>
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

  const handleCompleteSignedUpload = () => {
    if (
      selectedDocument &&
      uploadSignedFiles.some((f) => f.status === "completed")
    ) {
      setDocuments((prev) =>
        prev.map((doc) =>
          doc.id === selectedDocument.id
            ? {
                ...doc,
                status: "signed_document_uploaded",
                signedDocumentUrl: `/signed/${uploadSignedFiles[0].name}`,
                signedDocumentUploadDate: new Date().toISOString(),
              }
            : doc,
        ),
      );
      setIsUploadSignedModalOpen(false);
      alert(
        `Signed document uploaded successfully for ${selectedDocument.name}. User can now download it.`,
      );
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getTransactionStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge variant="secondary" className="text-green-700 bg-green-50">
            Completed
          </Badge>
        );
      case "pending":
        return (
          <Badge variant="secondary" className="text-yellow-700 bg-yellow-50">
            Pending
          </Badge>
        );
      case "failed":
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getAccountTypeBadge = (type: string) => {
    switch (type) {
      case "premium":
        return <Badge className="bg-black text-white">Premium</Badge>;
      case "enterprise":
        return <Badge className="bg-gray-800 text-white">Enterprise</Badge>;
      default:
        return <Badge variant="secondary">Standard</Badge>;
    }
  };

  const getSortIcon = (key: SortKey) => {
    if (sortKey !== key) {
      return <ArrowUpDown className="h-4 w-4 text-gray-400" />;
    }
    return sortDirection === "asc" ? (
      <ArrowUp className="h-4 w-4 text-gray-600" />
    ) : (
      <ArrowDown className="h-4 w-4 text-gray-600" />
    );
  };

  // Calculate stats
  const totalRevenue = transactions.reduce((sum, t) => sum + t.amount, 0);
  const activeUsers = userSummaries.filter((u) => u.totalDocuments > 0).length;
  const pendingDocs = documents.filter((d) => d.status === "processing").length;
  const signedDocs = documents.filter(
    (d) => d.status === "signed_document_uploaded",
  ).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <FileText className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold text-gray-900">
                UDIN Admin
              </span>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => navigate("/")}>
                Back to Upload
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-8">
        {/* Minimalist Header */}
        <div className="flex justify-between items-center mb-12">
          <div className="flex items-center gap-4">
            {currentView === "user-detail" && (
              <Button variant="ghost" size="sm" onClick={handleBackToUsers}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            )}
            <div>
              <h1 className="text-3xl font-light text-gray-900">
                {currentView === "users"
                  ? "Admin Dashboard"
                  : currentUser?.userName}
              </h1>
              <p className="text-gray-500 mt-1">
                {currentView === "users"
                  ? "User and document management"
                  : "User details and document history"}
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>

        {/* Minimalist Stats */}
        <div className="grid grid-cols-4 gap-8 mb-12">
          <div className="text-center">
            <div className="text-3xl font-light text-gray-900 mb-1">
              {userSummaries.length}
            </div>
            <div className="text-sm text-gray-500">Users</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-light text-gray-900 mb-1">
              {documents.length}
            </div>
            <div className="text-sm text-gray-500">Documents</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-light text-gray-900 mb-1">
              ${totalRevenue.toFixed(0)}
            </div>
            <div className="text-sm text-gray-500">Revenue</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-light text-gray-900 mb-1">
              {signedDocs}
            </div>
            <div className="text-sm text-gray-500">Signed</div>
          </div>
        </div>

        {/* Main Content */}
        {currentView === "users" ? (
          <div className="space-y-8">
            {/* Filters */}
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-medium">Filters</CardTitle>
                  {hasActiveUserFilters && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearUserFilters}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Clear
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm text-gray-700">Search</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search users..."
                        value={userSearchTerm}
                        onChange={(e) => setUserSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm text-gray-700">Status</Label>
                    <Select
                      value={userStatusFilter}
                      onValueChange={setUserStatusFilter}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm text-gray-700">
                      Account Type
                    </Label>
                    <Select
                      value={userAccountTypeFilter}
                      onValueChange={setUserAccountTypeFilter}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="standard">Standard</SelectItem>
                        <SelectItem value="premium">Premium</SelectItem>
                        <SelectItem value="enterprise">Enterprise</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm text-gray-700">
                      Last Activity
                    </Label>
                    <Select
                      value={userDateRangeFilter}
                      onValueChange={setUserDateRangeFilter}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Time</SelectItem>
                        <SelectItem value="7days">Last 7 days</SelectItem>
                        <SelectItem value="30days">Last 30 days</SelectItem>
                        <SelectItem value="90days">Last 90 days</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Users Table */}
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg font-medium">
                    Users ({filteredAndSortedUsers.length})
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-gray-200">
                        <TableHead>
                          <Button
                            variant="ghost"
                            className="h-auto p-0 font-medium text-left"
                            onClick={() => handleSort("userName")}
                          >
                            User
                            {getSortIcon("userName")}
                          </Button>
                        </TableHead>
                        <TableHead>
                          <Button
                            variant="ghost"
                            className="h-auto p-0 font-medium text-left"
                            onClick={() => handleSort("accountType")}
                          >
                            Type
                            {getSortIcon("accountType")}
                          </Button>
                        </TableHead>
                        <TableHead className="text-center">
                          <Button
                            variant="ghost"
                            className="h-auto p-0 font-medium"
                            onClick={() => handleSort("totalDocuments")}
                          >
                            Documents
                            {getSortIcon("totalDocuments")}
                          </Button>
                        </TableHead>
                        <TableHead className="text-center">
                          <Button
                            variant="ghost"
                            className="h-auto p-0 font-medium"
                            onClick={() => handleSort("pendingDocuments")}
                          >
                            Pending
                            {getSortIcon("pendingDocuments")}
                          </Button>
                        </TableHead>
                        <TableHead className="text-center">
                          <Button
                            variant="ghost"
                            className="h-auto p-0 font-medium"
                            onClick={() => handleSort("signedDocuments")}
                          >
                            Signed
                            {getSortIcon("signedDocuments")}
                          </Button>
                        </TableHead>
                        <TableHead className="text-right">
                          <Button
                            variant="ghost"
                            className="h-auto p-0 font-medium"
                            onClick={() => handleSort("totalSpent")}
                          >
                            Spent
                            {getSortIcon("totalSpent")}
                          </Button>
                        </TableHead>
                        <TableHead>
                          <Button
                            variant="ghost"
                            className="h-auto p-0 font-medium text-left"
                            onClick={() => handleSort("lastActivity")}
                          >
                            Last Activity
                            {getSortIcon("lastActivity")}
                          </Button>
                        </TableHead>
                        <TableHead className="text-center">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedUsers.map((user) => (
                        <TableRow
                          key={user.userId}
                          className="cursor-pointer hover:bg-gray-50 border-gray-100"
                          onClick={() => handleUserClick(user.userId)}
                        >
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                                <User className="h-4 w-4 text-gray-600" />
                              </div>
                              <div>
                                <div className="font-medium text-gray-900">
                                  {user.userName}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {user.userEmail}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {getAccountTypeBadge(user.accountType)}
                          </TableCell>
                          <TableCell className="text-center font-medium">
                            {user.totalDocuments}
                          </TableCell>
                          <TableCell className="text-center">
                            {user.pendingDocuments > 0 ? (
                              <Badge
                                variant="secondary"
                                className="text-orange-700 bg-orange-50"
                              >
                                {user.pendingDocuments}
                              </Badge>
                            ) : (
                              <span className="text-gray-400">0</span>
                            )}
                          </TableCell>
                          <TableCell className="text-center">
                            {user.signedDocuments > 0 ? (
                              <Badge
                                variant="secondary"
                                className="text-green-700 bg-green-50"
                              >
                                {user.signedDocuments}
                              </Badge>
                            ) : (
                              <span className="text-gray-400">0</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            ${user.totalSpent.toFixed(2)}
                          </TableCell>
                          <TableCell className="text-sm text-gray-600">
                            {formatDate(user.lastActivity)}
                          </TableCell>
                          <TableCell className="text-center">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleUserClick(user.userId);
                              }}
                            >
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                {filteredAndSortedUsers.length > userItemsPerPage && (
                  <div className="flex justify-center p-6 border-t border-gray-200">
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious
                            onClick={() =>
                              setUserCurrentPage((prev) =>
                                Math.max(prev - 1, 1),
                              )
                            }
                            className={
                              userCurrentPage === 1
                                ? "pointer-events-none opacity-50"
                                : "cursor-pointer"
                            }
                          />
                        </PaginationItem>

                        {Array.from(
                          { length: userTotalPages },
                          (_, i) => i + 1,
                        ).map((page) => {
                          const showPage =
                            page === 1 ||
                            page === userTotalPages ||
                            (page >= userCurrentPage - 1 &&
                              page <= userCurrentPage + 1);

                          if (!showPage) {
                            if (
                              (page === 2 && userCurrentPage > 4) ||
                              (page === userTotalPages - 1 &&
                                userCurrentPage < userTotalPages - 3)
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
                                onClick={() => setUserCurrentPage(page)}
                                isActive={userCurrentPage === page}
                                className="cursor-pointer"
                              >
                                {page}
                              </PaginationLink>
                            </PaginationItem>
                          );
                        })}

                        <PaginationItem>
                          <PaginationNext
                            onClick={() =>
                              setUserCurrentPage((prev) =>
                                Math.min(prev + 1, userTotalPages),
                              )
                            }
                            className={
                              userCurrentPage === userTotalPages
                                ? "pointer-events-none opacity-50"
                                : "cursor-pointer"
                            }
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        ) : (
          /* User Detail View */
          <div className="space-y-8">
            {/* User Overview */}
            {currentUser && (
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardContent className="p-8">
                  <div className="flex items-start justify-between mb-8">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                        <User className="h-8 w-8 text-gray-600" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-light text-gray-900 mb-1">
                          {currentUser.userName}
                        </h2>
                        <p className="text-gray-600">{currentUser.userEmail}</p>
                        <p className="text-sm text-gray-500 mt-2">
                          Joined {formatDate(currentUser.joinDate)}
                        </p>
                      </div>
                    </div>
                    {getAccountTypeBadge(currentUser.accountType)}
                  </div>

                  <div className="grid grid-cols-4 gap-8">
                    <div className="text-center">
                      <div className="text-2xl font-light text-gray-900 mb-1">
                        {currentUser.totalDocuments}
                      </div>
                      <div className="text-sm text-gray-500">Documents</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-light text-gray-900 mb-1">
                        ${currentUser.totalSpent.toFixed(2)}
                      </div>
                      <div className="text-sm text-gray-500">Total Spent</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-light text-gray-900 mb-1">
                        {currentUser.completedDocuments}
                      </div>
                      <div className="text-sm text-gray-500">Completed</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-light text-gray-900 mb-1">
                        {currentUser.signedDocuments}
                      </div>
                      <div className="text-sm text-gray-500">Signed</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="documents">
                  Documents ({currentUserDocuments.length})
                </TabsTrigger>
                <TabsTrigger value="transactions">
                  Transactions ({currentUserTransactions.length})
                </TabsTrigger>
              </TabsList>

              {/* Documents Tab */}
              <TabsContent value="documents" className="space-y-6">
                {/* Document Filters */}
                <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-medium">
                        Document Filters
                      </CardTitle>
                      {hasActiveDocFilters && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={clearDocFilters}
                        >
                          <X className="h-4 w-4 mr-2" />
                          Clear
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm text-gray-700">Search</Label>
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            placeholder="Search documents..."
                            value={docSearchTerm}
                            onChange={(e) => setDocSearchTerm(e.target.value)}
                            className="pl-10"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm text-gray-700">Status</Label>
                        <Select
                          value={docStatusFilter}
                          onValueChange={setDocStatusFilter}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Statuses</SelectItem>
                            <SelectItem value="processing">
                              Processing
                            </SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="error">Error</SelectItem>
                            <SelectItem value="downloaded_by_admin">
                              Downloaded
                            </SelectItem>
                            <SelectItem value="signed_document_uploaded">
                              Signed
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm text-gray-700">
                          Category
                        </Label>
                        <Select
                          value={docCategoryFilter}
                          onValueChange={setDocCategoryFilter}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Categories</SelectItem>
                            <SelectItem value="contracts">Contracts</SelectItem>
                            <SelectItem value="financial-records">
                              Financial Records
                            </SelectItem>
                            <SelectItem value="legal-documents">
                              Legal Documents
                            </SelectItem>
                            <SelectItem value="business-documents">
                              Business Documents
                            </SelectItem>
                            <SelectItem value="insurance-papers">
                              Insurance Papers
                            </SelectItem>
                            <SelectItem value="tax-documents">
                              Tax Documents
                            </SelectItem>
                            <SelectItem value="medical-records">
                              Medical Records
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Documents Table */}
                <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-lg font-medium">
                      Documents ({filteredUserDocuments.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="border-gray-200">
                            <TableHead>Document</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Upload Date</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Size</TableHead>
                            <TableHead className="text-right">
                              Actions
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {paginatedUserDocuments.map((document) => (
                            <TableRow
                              key={document.id}
                              className="border-gray-100"
                            >
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  <FileText className="h-4 w-4 text-gray-500" />
                                  <div>
                                    <div className="font-medium">
                                      {document.name}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                      {document.type}
                                    </div>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className="text-xs">
                                  {document.category
                                    .replace(/-/g, " ")
                                    .replace(/\b\w/g, (l) => l.toUpperCase())}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-sm">
                                {formatDate(document.uploadDate)}
                                {document.adminDownloadDate && (
                                  <div className="text-xs text-gray-500">
                                    Admin:{" "}
                                    {formatDate(document.adminDownloadDate)}
                                  </div>
                                )}
                              </TableCell>
                              <TableCell>
                                {getStatusBadge(document.status)}
                              </TableCell>
                              <TableCell className="text-sm">
                                {document.size}
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
                                      onClick={() =>
                                        handleDownloadDocument(document)
                                      }
                                    >
                                      <Download className="h-4 w-4 mr-2" />
                                      Download
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() =>
                                        handleStatusChange(document)
                                      }
                                    >
                                      <Edit className="h-4 w-4 mr-2" />
                                      Change Status
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() =>
                                        handleUploadSigned(document)
                                      }
                                      disabled={!document.downloadedByAdmin}
                                    >
                                      <Upload className="h-4 w-4 mr-2" />
                                      Upload Signed
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Transactions Tab */}
              <TabsContent value="transactions" className="space-y-6">
                <Card className="border border-gray-200">
                  <CardHeader>
                    <CardTitle className="text-lg font-medium">
                      Transactions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="border-gray-200">
                            <TableHead>Date</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {currentUserTransactions.map((transaction) => (
                            <TableRow
                              key={transaction.id}
                              className="border-gray-100"
                            >
                              <TableCell className="text-sm">
                                {formatDate(transaction.date)}
                              </TableCell>
                              <TableCell>
                                <div className="font-medium">
                                  {transaction.description}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {transaction.invoiceId}
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className="text-xs">
                                  {transaction.type
                                    .replace("_", " ")
                                    .replace(/\b\w/g, (l) => l.toUpperCase())}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {getTransactionStatusBadge(transaction.status)}
                              </TableCell>
                              <TableCell className="text-right font-medium">
                                ${transaction.amount.toFixed(2)}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}

        {/* Status Change Modal */}
        <Dialog open={isStatusModalOpen} onOpenChange={setIsStatusModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Change Document Status</DialogTitle>
              <DialogDescription>
                Update the status of {selectedDocument?.name}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>New Status</Label>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select new status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="error">Error</SelectItem>
                    <SelectItem value="downloaded_by_admin">
                      Downloaded by Admin
                    </SelectItem>
                    <SelectItem value="signed_document_uploaded">
                      Signed Document Available
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Comment (Optional)</Label>
                <Textarea
                  value={statusComment}
                  onChange={(e) => setStatusComment(e.target.value)}
                  placeholder="Add a comment about this status change..."
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsStatusModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleStatusUpdate} disabled={!newStatus}>
                  Update Status
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Upload Signed Document Modal */}
        <Dialog
          open={isUploadSignedModalOpen}
          onOpenChange={setIsUploadSignedModalOpen}
        >
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Upload Signed Document</DialogTitle>
              <DialogDescription>
                Upload the signed version of {selectedDocument?.name}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* Upload Area */}
              <div
                className={cn(
                  "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
                  isDragOver
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-300 hover:border-gray-400",
                )}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragOver(true);
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  setIsDragOver(false);
                }}
                onDrop={handleDrop}
              >
                <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-lg font-medium mb-2">
                  Drag and drop signed document here
                </p>
                <p className="text-gray-500 mb-4">
                  or click to browse from your computer
                </p>
                <input
                  type="file"
                  multiple
                  className="hidden"
                  id="signed-file-upload"
                  onChange={handleFileSelect}
                  accept=".pdf,.doc,.docx"
                />
                <Button asChild variant="outline">
                  <label
                    htmlFor="signed-file-upload"
                    className="cursor-pointer"
                  >
                    Select Files
                  </label>
                </Button>
              </div>

              {/* Uploaded Files */}
              {uploadSignedFiles.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium mb-4">Signed Documents</h3>
                  <div className="space-y-3">
                    {uploadSignedFiles.map((file) => (
                      <div
                        key={file.id}
                        className="flex items-center gap-3 p-3 border rounded-lg"
                      >
                        <FileText className="h-4 w-4 text-gray-500" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{file.name}</p>
                          <p className="text-xs text-gray-500">
                            {formatFileSize(file.size)}
                          </p>
                          {file.status === "uploading" && (
                            <Progress
                              value={file.progress}
                              className="mt-2 h-1"
                            />
                          )}
                        </div>
                        {file.status === "completed" && (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsUploadSignedModalOpen(false);
                    setUploadSignedFiles([]);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCompleteSignedUpload}
                  disabled={
                    !uploadSignedFiles.some((f) => f.status === "completed")
                  }
                >
                  Complete Upload
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
