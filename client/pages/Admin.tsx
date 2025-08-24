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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Layout from "@/components/Layout";
import {
  Users,
  FileText,
  Download,
  Upload,
  Search,
  CheckCircle,
  Clock,
  AlertCircle,
  DollarSign,
  Shield,
  ArrowLeft,
  User,
  Settings,
  Eye,
  Edit3,
  Trash2,
  Plus,
  CreditCard,
  TrendingUp,
  Calendar,
  Receipt,
  MoreHorizontal,
} from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  joinDate: string;
  paymentStatus: "paid" | "pending" | "failed";
  totalDocuments: number;
  pendingDocuments: number;
  completedDocuments: number;
  signedDocuments: number;
  lastActivity: string;
  totalSpent: number;
  averageOrderValue: number;
}

interface Document {
  id: string;
  name: string;
  type: string;
  uploadDate: string;
  status:
    | "uploaded"
    | "downloaded_by_admin"
    | "in_review"
    | "signed_uploaded"
    | "completed"
    | "error";
  size: string;
  category: string;
  userId: string;
  downloadedByAdmin?: boolean;
  adminDownloadDate?: string;
  signedDocumentUrl?: string;
  signedDocumentUploadDate?: string;
  notes?: string;
  cost: number;
  paymentStatus: "paid" | "pending" | "failed";
}

interface Transaction {
  id: string;
  userId: string;
  date: string;
  description: string;
  amount: number;
  status: "completed" | "pending" | "failed" | "refunded";
  type: "document_processing" | "subscription" | "fee" | "refund";
  paymentMethod: "credit_card" | "paypal" | "bank_transfer" | "upi";
  documentIds?: string[];
}

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  status: "uploading" | "completed" | "error";
  progress: number;
}

export default function Admin() {
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState<"users" | "user-detail">(
    "users",
  );
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("documents");

  // Modal states
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(
    null,
  );
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isUploadSignedModalOpen, setIsUploadSignedModalOpen] = useState(false);
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);

  // Form states
  const [newStatus, setNewStatus] = useState<string>("");
  const [statusNotes, setStatusNotes] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);

  // Mock data
  const [users] = useState<User[]>([
    {
      id: "user-001",
      name: "John Doe",
      email: "john.doe@gmail.com",
      joinDate: "2024-01-15",
      paymentStatus: "paid",
      totalDocuments: 5,
      pendingDocuments: 2,
      completedDocuments: 2,
      signedDocuments: 1,
      lastActivity: "2024-01-18",
      totalSpent: 850.5,
      averageOrderValue: 170.1,
    },
    {
      id: "user-002",
      name: "Jane Smith",
      email: "jane.smith@outlook.com",
      joinDate: "2024-01-14",
      paymentStatus: "paid",
      totalDocuments: 3,
      pendingDocuments: 1,
      completedDocuments: 1,
      signedDocuments: 1,
      lastActivity: "2024-01-17",
      totalSpent: 425.75,
      averageOrderValue: 141.92,
    },
    {
      id: "user-003",
      name: "Bob Wilson",
      email: "bob.wilson@yahoo.com",
      joinDate: "2024-01-13",
      paymentStatus: "pending",
      totalDocuments: 7,
      pendingDocuments: 3,
      completedDocuments: 3,
      signedDocuments: 1,
      lastActivity: "2024-01-16",
      totalSpent: 1250.0,
      averageOrderValue: 178.57,
    },
    {
      id: "user-004",
      name: "Alice Brown",
      email: "alice.brown@gmail.com",
      joinDate: "2024-01-12",
      paymentStatus: "paid",
      totalDocuments: 4,
      pendingDocuments: 1,
      completedDocuments: 2,
      signedDocuments: 1,
      lastActivity: "2024-01-15",
      totalSpent: 675.25,
      averageOrderValue: 168.81,
    },
  ]);

  const [documents, setDocuments] = useState<Document[]>([
    {
      id: "doc-001",
      name: "Contract_Agreement.pdf",
      type: "PDF",
      uploadDate: "2024-01-15",
      status: "downloaded_by_admin",
      size: "2.4 MB",
      category: "Contract",
      userId: "user-001",
      downloadedByAdmin: true,
      adminDownloadDate: "2024-01-16",
      notes: "Downloaded for CA review",
      cost: 200.0,
      paymentStatus: "paid",
    },
    {
      id: "doc-002",
      name: "Financial_Statement.docx",
      type: "DOCX",
      uploadDate: "2024-01-14",
      status: "signed_uploaded",
      size: "1.8 MB",
      category: "Financial",
      userId: "user-001",
      downloadedByAdmin: true,
      adminDownloadDate: "2024-01-15",
      signedDocumentUrl: "/signed/Financial_Statement_signed.pdf",
      signedDocumentUploadDate: "2024-01-17",
      notes: "Signed document uploaded by backoffice",
      cost: 150.5,
      paymentStatus: "paid",
    },
    {
      id: "doc-003",
      name: "Project_Proposal.pdf",
      type: "PDF",
      uploadDate: "2024-01-13",
      status: "uploaded",
      size: "3.2 MB",
      category: "Business",
      userId: "user-001",
      cost: 300.0,
      paymentStatus: "pending",
    },
    {
      id: "doc-004",
      name: "Invoice_2024.pdf",
      type: "PDF",
      uploadDate: "2024-01-12",
      status: "in_review",
      size: "890 KB",
      category: "Financial",
      userId: "user-002",
      downloadedByAdmin: true,
      adminDownloadDate: "2024-01-13",
      notes: "Under CA review",
      cost: 125.75,
      paymentStatus: "paid",
    },
    {
      id: "doc-005",
      name: "Legal_Document.pdf",
      type: "PDF",
      uploadDate: "2024-01-11",
      status: "error",
      size: "1.5 MB",
      category: "Legal",
      userId: "user-003",
      notes: "Document format issue, re-upload required",
      cost: 250.0,
      paymentStatus: "failed",
    },
  ]);

  const [transactions] = useState<Transaction[]>([
    {
      id: "txn-001",
      userId: "user-001",
      date: "2024-01-18",
      description: "Document Processing - Contract Agreement",
      amount: 200.0,
      status: "completed",
      type: "document_processing",
      paymentMethod: "credit_card",
      documentIds: ["doc-001"],
    },
    {
      id: "txn-002",
      userId: "user-001",
      date: "2024-01-17",
      description: "Document Processing - Financial Statement",
      amount: 150.5,
      status: "completed",
      type: "document_processing",
      paymentMethod: "credit_card",
      documentIds: ["doc-002"],
    },
    {
      id: "txn-003",
      userId: "user-001",
      date: "2024-01-16",
      description: "Premium Service Fee",
      amount: 50.0,
      status: "completed",
      type: "fee",
      paymentMethod: "credit_card",
    },
    {
      id: "txn-004",
      userId: "user-001",
      date: "2024-01-15",
      description: "Subscription - Monthly Plan",
      amount: 299.0,
      status: "completed",
      type: "subscription",
      paymentMethod: "credit_card",
    },
    {
      id: "txn-005",
      userId: "user-001",
      date: "2024-01-14",
      description: "Document Processing - Project Proposal",
      amount: 151.0,
      status: "pending",
      type: "document_processing",
      paymentMethod: "upi",
      documentIds: ["doc-003"],
    },
    {
      id: "txn-006",
      userId: "user-002",
      date: "2024-01-12",
      description: "Document Processing - Invoice Analysis",
      amount: 125.75,
      status: "completed",
      type: "document_processing",
      paymentMethod: "paypal",
      documentIds: ["doc-004"],
    },
    {
      id: "txn-007",
      userId: "user-002",
      date: "2024-01-10",
      description: "Subscription - Standard Plan",
      amount: 199.0,
      status: "completed",
      type: "subscription",
      paymentMethod: "credit_card",
    },
    {
      id: "txn-008",
      userId: "user-002",
      date: "2024-01-08",
      description: "Express Processing Fee",
      amount: 101.0,
      status: "completed",
      type: "fee",
      paymentMethod: "credit_card",
    },
  ]);

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const currentUser = users.find((user) => user.id === selectedUserId);
  const currentUserDocuments = documents.filter(
    (doc) => doc.userId === selectedUserId,
  );
  const currentUserTransactions = transactions.filter(
    (txn) => txn.userId === selectedUserId,
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "uploaded":
        return (
          <Badge variant="secondary" className="text-blue-700 bg-blue-50">
            <Upload className="h-3 w-3 mr-1" />
            Uploaded
          </Badge>
        );
      case "downloaded_by_admin":
        return (
          <Badge variant="secondary" className="text-orange-700 bg-orange-50">
            <Download className="h-3 w-3 mr-1" />
            Downloaded
          </Badge>
        );
      case "in_review":
        return (
          <Badge variant="secondary" className="text-yellow-700 bg-yellow-50">
            <Clock className="h-3 w-3 mr-1" />
            In Review
          </Badge>
        );
      case "signed_uploaded":
        return (
          <Badge variant="secondary" className="text-purple-700 bg-purple-50">
            <CheckCircle className="h-3 w-3 mr-1" />
            Signed Uploaded
          </Badge>
        );
      case "completed":
        return (
          <Badge variant="secondary" className="text-green-700 bg-green-50">
            <CheckCircle className="h-3 w-3 mr-1" />
            Completed
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

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            <CheckCircle className="h-3 w-3 mr-1" />
            Paid
          </Badge>
        );
      case "pending":
        return (
          <Badge variant="secondary">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
      case "failed":
        return (
          <Badge variant="destructive">
            <AlertCircle className="h-3 w-3 mr-1" />
            Failed
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTransactionStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge variant="secondary" className="text-green-700 bg-green-50">
            <CheckCircle className="h-3 w-3 mr-1" />
            Completed
          </Badge>
        );
      case "pending":
        return (
          <Badge variant="secondary" className="text-yellow-700 bg-yellow-50">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
      case "failed":
        return (
          <Badge variant="destructive">
            <AlertCircle className="h-3 w-3 mr-1" />
            Failed
          </Badge>
        );
      case "refunded":
        return (
          <Badge variant="secondary" className="text-blue-700 bg-blue-50">
            <TrendingUp className="h-3 w-3 mr-1" />
            Refunded
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPaymentMethodBadge = (method: string) => {
    switch (method) {
      case "credit_card":
        return <Badge variant="outline">Credit Card</Badge>;
      case "paypal":
        return <Badge variant="outline">PayPal</Badge>;
      case "bank_transfer":
        return <Badge variant="outline">Bank Transfer</Badge>;
      case "upi":
        return <Badge variant="outline">UPI</Badge>;
      default:
        return <Badge variant="outline">{method}</Badge>;
    }
  };

  const handleUserClick = (userId: string) => {
    setSelectedUserId(userId);
    setCurrentView("user-detail");
    setActiveTab("documents");
  };

  const handleBackToUsers = () => {
    setCurrentView("users");
    setSelectedUserId(null);
  };

  const handleDownloadDocument = (document: Document) => {
    // Simulate document download
    console.log("Admin downloading:", document.name);

    setDocuments((prev) =>
      prev.map((doc) =>
        doc.id === document.id
          ? {
              ...doc,
              status: "downloaded_by_admin",
              downloadedByAdmin: true,
              adminDownloadDate: new Date().toISOString().split("T")[0],
              notes: "Downloaded by admin for processing",
            }
          : doc,
      ),
    );

    alert(
      `Downloaded ${document.name} successfully. Document status updated to "Downloaded by Admin".`,
    );
  };

  const handleStatusChange = (document: Document) => {
    setSelectedDocument(document);
    setNewStatus(document.status);
    setStatusNotes(document.notes || "");
    setIsStatusModalOpen(true);
  };

  const handleUploadSigned = (document: Document) => {
    setSelectedDocument(document);
    setUploadedFiles([]);
    setIsUploadSignedModalOpen(true);
  };

  const handleViewNotes = (document: Document) => {
    setSelectedDocument(document);
    setIsNotesModalOpen(true);
  };

  const handleStatusUpdate = () => {
    if (selectedDocument && newStatus) {
      setDocuments((prev) =>
        prev.map((doc) =>
          doc.id === selectedDocument.id
            ? { ...doc, status: newStatus as any, notes: statusNotes }
            : doc,
        ),
      );
      setIsStatusModalOpen(false);
      alert(`Status updated to "${newStatus}" for ${selectedDocument.name}`);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      processFiles(selectedFiles);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    processFiles(droppedFiles);
  };

  const processFiles = (newFiles: File[]) => {
    const files: UploadedFile[] = newFiles.map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      type: file.type,
      status: "uploading",
      progress: 0,
    }));

    setUploadedFiles(files);

    // Simulate upload progress
    files.forEach((file) => {
      const interval = setInterval(() => {
        setUploadedFiles((prev) =>
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
      uploadedFiles.some((f) => f.status === "completed")
    ) {
      setDocuments((prev) =>
        prev.map((doc) =>
          doc.id === selectedDocument.id
            ? {
                ...doc,
                status: "signed_uploaded",
                signedDocumentUrl: `/signed/${uploadedFiles[0].name}`,
                signedDocumentUploadDate: new Date()
                  .toISOString()
                  .split("T")[0],
                notes: "Signed document uploaded by backoffice",
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  // Calculate stats
  const totalUsers = users.length;
  const totalDocuments = documents.length;
  const pendingDocuments = documents.filter(
    (d) => d.status === "uploaded" || d.status === "in_review",
  ).length;
  const signedDocuments = documents.filter(
    (d) => d.status === "signed_uploaded" || d.status === "completed",
  ).length;

  return (
    <Layout title="Admin Dashboard">
      <div className="space-y-6 lg:space-y-8">
        {/* Main Content */}
        {currentView === "users" ? (
          <div className="space-y-6 lg:space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-2">
                  User Management
                </h2>
                <p className="text-gray-600 text-sm lg:text-base">
                  Manage users and their document workflow
                </p>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs lg:text-sm font-medium text-gray-500 flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Total Users
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xl lg:text-2xl font-bold">
                    {totalUsers}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs lg:text-sm font-medium text-gray-500 flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Total Documents
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xl lg:text-2xl font-bold">
                    {totalDocuments}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs lg:text-sm font-medium text-gray-500 flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Pending Review
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xl lg:text-2xl font-bold text-orange-600">
                    {pendingDocuments}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs lg:text-sm font-medium text-gray-500 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    Signed Documents
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xl lg:text-2xl font-bold text-green-600">
                    {signedDocuments}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Users Table */}
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      Users
                      <Badge variant="secondary" className="text-xs">
                        {filteredUsers.length} of {users.length}
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      Click on a user to view their documents and manage
                      workflow
                    </CardDescription>
                  </div>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search users..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-full sm:w-64"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Join Date</TableHead>
                        <TableHead className="text-center">Documents</TableHead>
                        <TableHead className="text-center">Pending</TableHead>
                        <TableHead className="text-center">Signed</TableHead>
                        <TableHead className="text-right">
                          Total Spent
                        </TableHead>
                        <TableHead>Last Activity</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.map((user) => (
                        <TableRow
                          key={user.id}
                          className="cursor-pointer hover:bg-gray-50"
                          onClick={() => handleUserClick(user.id)}
                        >
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                                <User className="h-4 w-4 text-gray-600" />
                              </div>
                              <div>
                                <div className="font-medium">{user.name}</div>
                                <div className="text-sm text-gray-500">
                                  {user.email}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{formatDate(user.joinDate)}</TableCell>
                          <TableCell className="text-center">
                            <Badge variant="outline">
                              {user.totalDocuments}
                            </Badge>
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
                            {formatCurrency(user.totalSpent)}
                          </TableCell>
                          <TableCell className="text-sm text-gray-600">
                            {formatDate(user.lastActivity)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          /* User Detail View */
          <div className="space-y-6 lg:space-y-8">
            {/* User Header */}
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={handleBackToUsers}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Users
              </Button>
              <div>
                <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-2">
                  {currentUser?.name}
                </h2>
                <p className="text-gray-600 text-sm lg:text-base">
                  {currentUser?.email}
                </p>
              </div>
            </div>

            {/* Enhanced User Stats */}
            {currentUser && (
              <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 lg:gap-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs lg:text-sm font-medium text-gray-500">
                      Total Documents
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-xl lg:text-2xl font-bold">
                      {currentUser.totalDocuments}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs lg:text-sm font-medium text-gray-500">
                      Pending Review
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-xl lg:text-2xl font-bold text-orange-600">
                      {currentUser.pendingDocuments}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs lg:text-sm font-medium text-gray-500">
                      Completed
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-xl lg:text-2xl font-bold text-blue-600">
                      {currentUser.completedDocuments}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs lg:text-sm font-medium text-gray-500">
                      Signed
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-xl lg:text-2xl font-bold text-green-600">
                      {currentUser.signedDocuments}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs lg:text-sm font-medium text-gray-500 flex items-center gap-1">
                      <DollarSign className="h-3 w-3" />
                      Total Spent
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-xl lg:text-2xl font-bold text-purple-600">
                      {formatCurrency(currentUser.totalSpent)}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs lg:text-sm font-medium text-gray-500">
                      Avg Order
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-xl lg:text-2xl font-bold text-indigo-600">
                      {formatCurrency(currentUser.averageOrderValue)}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Tabs for Documents and Transactions */}
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="space-y-6"
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="documents">
                  Documents ({currentUserDocuments.length})
                </TabsTrigger>
                <TabsTrigger value="transactions">
                  Transactions ({currentUserTransactions.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="documents">
                {/* Documents Table */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      Documents
                      <Badge variant="secondary" className="text-xs">
                        {currentUserDocuments.length}
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      Manage document workflow and upload signed documents
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Document</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Upload Date</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Payment Status</TableHead>
                            <TableHead>Size</TableHead>
                            <TableHead className="text-right">Cost</TableHead>
                            <TableHead className="text-right">
                              Actions
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {currentUserDocuments.map((document) => (
                            <TableRow key={document.id}>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <FileText className="h-4 w-4 text-gray-500 flex-shrink-0" />
                                  <div className="min-w-0">
                                    <div className="font-medium truncate">
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
                                  {document.category}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-sm">
                                {formatDate(document.uploadDate)}
                                {document.adminDownloadDate && (
                                  <div className="text-xs text-gray-500">
                                    Downloaded:{" "}
                                    {formatDate(document.adminDownloadDate)}
                                  </div>
                                )}
                              </TableCell>
                              <TableCell>
                                {getStatusBadge(document.status)}
                              </TableCell>
                              <TableCell>
                                {getPaymentStatusBadge(document.paymentStatus)}
                              </TableCell>
                              <TableCell className="text-sm">
                                {document.size}
                              </TableCell>
                              <TableCell className="text-right font-medium">
                                {formatCurrency(document.cost)}
                              </TableCell>
                              <TableCell className="text-right">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm">
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    {document.status === "uploaded" && (
                                      <DropdownMenuItem
                                        onClick={() =>
                                          handleDownloadDocument(document)
                                        }
                                      >
                                        <Download className="h-4 w-4 mr-2" />
                                        Download
                                      </DropdownMenuItem>
                                    )}
                                    {(document.status ===
                                      "downloaded_by_admin" ||
                                      document.status === "in_review") && (
                                      <DropdownMenuItem
                                        onClick={() =>
                                          handleUploadSigned(document)
                                        }
                                      >
                                        <Upload className="h-4 w-4 mr-2" />
                                        Upload Signed
                                      </DropdownMenuItem>
                                    )}
                                    <DropdownMenuItem
                                      onClick={() =>
                                        handleStatusChange(document)
                                      }
                                    >
                                      <Edit3 className="h-4 w-4 mr-2" />
                                      Change Status
                                    </DropdownMenuItem>
                                    {document.notes && (
                                      <DropdownMenuItem
                                        onClick={() =>
                                          handleViewNotes(document)
                                        }
                                      >
                                        <Eye className="h-4 w-4 mr-2" />
                                        View Notes
                                      </DropdownMenuItem>
                                    )}
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

              <TabsContent value="transactions">
                {/* Transactions Table */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      Recent Transactions
                      <Badge variant="secondary" className="text-xs">
                        {currentUserTransactions.length}
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      Payment history and transaction details
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                            <TableHead>Payment Method</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {currentUserTransactions.map((transaction) => (
                            <TableRow key={transaction.id}>
                              <TableCell className="text-sm">
                                {formatDate(transaction.date)}
                              </TableCell>
                              <TableCell>
                                <div className="font-medium">
                                  {transaction.description}
                                </div>
                                {transaction.documentIds &&
                                  transaction.documentIds.length > 0 && (
                                    <div className="text-xs text-gray-500">
                                      Documents:{" "}
                                      {transaction.documentIds.length}
                                    </div>
                                  )}
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant="outline"
                                  className="text-xs capitalize"
                                >
                                  {transaction.type.replace("_", " ")}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right font-medium">
                                {formatCurrency(transaction.amount)}
                              </TableCell>
                              <TableCell>
                                {getPaymentMethodBadge(
                                  transaction.paymentMethod,
                                )}
                              </TableCell>
                              <TableCell>
                                {getTransactionStatusBadge(transaction.status)}
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
      </div>

      {/* Status Change Modal */}
      <Dialog open={isStatusModalOpen} onOpenChange={setIsStatusModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Change Document Status</DialogTitle>
            <DialogDescription>
              Update the status for {selectedDocument?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>New Status</Label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="uploaded">Uploaded</SelectItem>
                  <SelectItem value="downloaded_by_admin">
                    Downloaded by Admin
                  </SelectItem>
                  <SelectItem value="in_review">In Review</SelectItem>
                  <SelectItem value="signed_uploaded">
                    Signed Uploaded
                  </SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                placeholder="Add notes about this status change..."
                value={statusNotes}
                onChange={(e) => setStatusNotes(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsStatusModalOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleStatusUpdate}>Update Status</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Upload Signed Document Modal */}
      <Dialog
        open={isUploadSignedModalOpen}
        onOpenChange={setIsUploadSignedModalOpen}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Upload Signed Document</DialogTitle>
            <DialogDescription>
              Upload the signed version of {selectedDocument?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                isDragOver
                  ? "border-primary bg-primary/5"
                  : "border-gray-300 hover:border-primary/50"
              }`}
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
              <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
              <p className="text-sm font-medium mb-1">
                Drag and drop your signed document here
              </p>
              <p className="text-xs text-gray-500 mb-3">or click to browse</p>
              <input
                type="file"
                multiple
                className="hidden"
                id="signed-file-upload"
                onChange={handleFileSelect}
                accept=".pdf,.doc,.docx"
              />
              <Button asChild size="sm">
                <label htmlFor="signed-file-upload" className="cursor-pointer">
                  Select Files
                </label>
              </Button>
            </div>

            {uploadedFiles.length > 0 && (
              <div className="space-y-2">
                <Label>Uploaded Files</Label>
                {uploadedFiles.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center gap-3 p-3 border rounded-lg"
                  >
                    <FileText className="h-4 w-4 text-gray-500" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {file.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatFileSize(file.size)}
                      </p>
                      {file.status === "uploading" && (
                        <Progress value={file.progress} className="mt-1 h-1" />
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      {file.status === "completed" && (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsUploadSignedModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCompleteSignedUpload}
              disabled={!uploadedFiles.some((f) => f.status === "completed")}
            >
              Complete Upload
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Notes Modal */}
      <Dialog open={isNotesModalOpen} onOpenChange={setIsNotesModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Document Notes</DialogTitle>
            <DialogDescription>
              Notes for {selectedDocument?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm whitespace-pre-wrap">
                {selectedDocument?.notes || "No notes available"}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setIsNotesModalOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
