import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
  Calendar,
  X,
  Tag,
  LayoutDashboard,
  User,
  CreditCard,
  LogOut,
  Menu
} from 'lucide-react';

interface Document {
  id: string;
  name: string;
  type: string;
  uploadDate: string;
  status: 'processing' | 'completed' | 'signed' | 'error';
  size: string;
  category: string;
}

interface UploadFile {
  id: string;
  name: string;
  size: number;
  type: string;
  status: 'uploading' | 'completed' | 'error';
  progress: number;
  category: string;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [documents] = useState<Document[]>([
    {
      id: '1',
      name: 'Contract_Agreement.pdf',
      type: 'PDF',
      uploadDate: '2024-01-15',
      status: 'completed',
      size: '2.4 MB',
      category: 'contracts'
    },
    {
      id: '2',
      name: 'Financial_Statement.docx',
      type: 'DOCX',
      uploadDate: '2024-01-14',
      status: 'signed',
      size: '1.8 MB',
      category: 'financial-records'
    },
    {
      id: '3',
      name: 'Project_Proposal.pdf',
      type: 'PDF',
      uploadDate: '2024-01-13',
      status: 'processing',
      size: '3.2 MB',
      category: 'business-documents'
    },
    {
      id: '4',
      name: 'Terms_Conditions.txt',
      type: 'TXT',
      uploadDate: '2024-01-12',
      status: 'error',
      size: '45 KB',
      category: 'legal-documents'
    },
    {
      id: '5',
      name: 'Invoice_2024.pdf',
      type: 'PDF',
      uploadDate: '2024-01-11',
      status: 'completed',
      size: '890 KB',
      category: 'financial-records'
    }
  ]);

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || doc.status === statusFilter;
    const matchesType = typeFilter === 'all' || doc.type === typeFilter;
    const matchesCategory = categoryFilter === 'all' || doc.category === categoryFilter;

    let matchesDate = true;
    if (dateFilter !== 'all') {
      const docDate = new Date(doc.uploadDate);
      const now = new Date();
      const daysDiff = Math.floor((now.getTime() - docDate.getTime()) / (1000 * 60 * 60 * 24));

      switch (dateFilter) {
        case 'today':
          matchesDate = daysDiff === 0;
          break;
        case 'week':
          matchesDate = daysDiff <= 7;
          break;
        case 'month':
          matchesDate = daysDiff <= 30;
          break;
        default:
          matchesDate = true;
      }
    }

    return matchesSearch && matchesStatus && matchesType && matchesCategory && matchesDate;
  });

  const clearFilters = () => {
    setStatusFilter('all');
    setTypeFilter('all');
    setCategoryFilter('all');
    setDateFilter('all');
    setSearchTerm('');
  };

  const hasActiveFilters = statusFilter !== 'all' || typeFilter !== 'all' ||
                          categoryFilter !== 'all' || dateFilter !== 'all' || searchTerm !== '';

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
      alert('Maximum 30 documents allowed');
      return;
    }

    const files: UploadFile[] = newFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      type: file.type,
      status: 'uploading',
      progress: 0,
      category: 'uncategorized'
    }));

    setUploadFiles(prev => [...prev, ...files]);

    // Simulate upload progress
    files.forEach(file => {
      const interval = setInterval(() => {
        setUploadFiles(prev => prev.map(f => {
          if (f.id === file.id) {
            const newProgress = f.progress + Math.random() * 30;
            if (newProgress >= 100) {
              clearInterval(interval);
              return { ...f, progress: 100, status: 'completed' };
            }
            return { ...f, progress: newProgress };
          }
          return f;
        }));
      }, 200);
    });
  };

  const removeUploadFile = (id: string) => {
    setUploadFiles(prev => prev.filter(f => f.id !== id));
  };

  const updateUploadFileCategory = (id: string, category: string) => {
    setUploadFiles(prev => prev.map(f =>
      f.id === id ? { ...f, category } : f
    ));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const fileCategories = [
    'Legal Documents',
    'Financial Records',
    'Contracts',
    'Identity Documents',
    'Insurance Papers',
    'Medical Records',
    'Tax Documents',
    'Business Documents',
    'Personal Documents',
    'Other'
  ];

  const handleContinueToPayment = () => {
    if (uploadFiles.length > 0 && !uploadFiles.some(f => f.category === 'uncategorized')) {
      setShowPayment(true);
    }
  };

  const handlePaymentComplete = () => {
    // Here you would normally process the payment
    setIsUploadModalOpen(false);
    setShowPayment(false);
    setUploadFiles([]);
    // Optionally refresh the documents list or show success message
    alert('Payment completed! Your documents will be processed shortly.');
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

  const handleNavigation = (page: string) => {
    setCurrentPage(page);
    switch (page) {
      case 'profile':
        // Navigate to profile page or show profile modal
        console.log('Navigate to profile');
        break;
      case 'transactions':
        // Navigate to transactions page or show transactions modal
        console.log('Navigate to transactions');
        break;
      case 'logout':
        // Handle logout
        navigate('/');
        break;
      default:
        // Dashboard - already here
        break;
    }
  };

  const sidebarItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      active: currentPage === 'dashboard'
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: User,
      active: currentPage === 'profile'
    },
    {
      id: 'transactions',
      label: 'Transactions',
      icon: CreditCard,
      active: currentPage === 'transactions'
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
          <CheckCircle className="h-3 w-3 mr-1" />
          Completed
        </Badge>;
      case 'signed':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
          <CheckCircle className="h-3 w-3 mr-1" />
          Signed
        </Badge>;
      case 'processing':
        return <Badge variant="secondary">
          <Clock className="h-3 w-3 mr-1" />
          Processing
        </Badge>;
      case 'error':
        return <Badge variant="destructive">
          <AlertCircle className="h-3 w-3 mr-1" />
          Error
        </Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleDownload = (document: Document) => {
    // Simulate download
    console.log('Downloading:', document.name);
  };

  const handleEdit = (document: Document) => {
    console.log('Editing:', document.name);
  };

  const handleDelete = (document: Document) => {
    if (confirm(`Are you sure you want to delete ${document.name}?`)) {
      console.log('Deleting:', document.name);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Document Dashboard
              </h1>
              <p className="text-gray-600">
                Manage and track your uploaded documents
              </p>
            </div>
            <Button onClick={handleUploadMore} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Upload More Documents
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">
                  Total Documents
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">5</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">
                  Completed
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">2</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">
                  Processing
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">1</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">
                  Signed
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">1</div>
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Status</label>
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
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">File Type</label>
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
                  <label className="text-sm font-medium text-gray-700">Category</label>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="legal-documents">Legal Documents</SelectItem>
                      <SelectItem value="financial-records">Financial Records</SelectItem>
                      <SelectItem value="contracts">Contracts</SelectItem>
                      <SelectItem value="business-documents">Business Documents</SelectItem>
                      <SelectItem value="identity-documents">Identity Documents</SelectItem>
                      <SelectItem value="insurance-papers">Insurance Papers</SelectItem>
                      <SelectItem value="medical-records">Medical Records</SelectItem>
                      <SelectItem value="tax-documents">Tax Documents</SelectItem>
                      <SelectItem value="personal-documents">Personal Documents</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Upload Date</label>
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
                      : "View and manage all your uploaded documents"
                    }
                  </CardDescription>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search documents..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {filteredDocuments.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Document</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Upload Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDocuments.map((document) => (
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
                            {document.category.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </Badge>
                        </TableCell>
                        <TableCell>{document.uploadDate}</TableCell>
                        <TableCell>{getStatusBadge(document.status)}</TableCell>
                        <TableCell className="text-gray-500">{document.size}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleDownload(document)}>
                                <Download className="h-4 w-4 mr-2" />
                                Download
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEdit(document)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDelete(document)}
                                className="text-red-600"
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
              ) : (
                <div className="text-center py-12">
                  <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No documents found</h3>
                  <p className="text-gray-500 mb-4">
                    {hasActiveFilters
                      ? "No documents match your current filters. Try adjusting your search criteria."
                      : "You haven't uploaded any documents yet."
                    }
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
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Upload Modal */}
      <Dialog open={isUploadModalOpen} onOpenChange={handleModalClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {showPayment ? 'Complete Payment' : 'Upload More Documents'}
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
                      {uploadFiles.filter(f => f.status === 'completed').length} completed
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
                          {file.status === 'uploading' && (
                            <Progress value={file.progress} className="mb-2 h-1" />
                          )}
                          <div className="flex items-center gap-2">
                            <Select
                              value={file.category}
                              onValueChange={(value) => updateUploadFileCategory(file.id, value)}
                            >
                              <SelectTrigger className="w-40 h-7 text-xs">
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                              <SelectContent>
                                {fileCategories.map((category) => (
                                  <SelectItem key={category} value={category.toLowerCase().replace(/\s+/g, '-')}>
                                    {category}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {file.status === 'completed' && (
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
                    {uploadFiles.some(f => f.category === 'uncategorized')
                      ? "Please select a category for all files to continue"
                      : `Ready to upload ${uploadFiles.length} documents`
                    }
                  </p>
                  <Button
                    onClick={handleContinueToPayment}
                    disabled={
                      uploadFiles.some(f => f.status === 'uploading') ||
                      uploadFiles.some(f => f.category === 'uncategorized')
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
                    <span>$5.00</span>
                  </div>
                  <div className="flex justify-between font-medium border-t pt-2">
                    <span>Total:</span>
                    <span>${(uploadFiles.length * 5).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Payment Actions */}
              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => setShowPayment(false)}
                >
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
    </div>
  );
}
