import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, FileText, Filter, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { getRemovalRequests } from "@/api/removalService";
import { toast } from "@/hooks/use-toast";
import { RemovalStatus, RemovalTerm } from "@/types";
import { useAuth } from "@/contexts";
import { api } from "@/services/api";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Mapping for status badges
const statusColors: Record<string, string> = {
  "pending": "bg-blue-400",
  "DRAFT": "bg-gray-400",
  "PENDING_LEVEL_2": "bg-blue-400",
  "PENDING_LEVEL_3": "bg-indigo-400",
  "PENDING_LEVEL_4": "bg-purple-400",
  "PENDING_SECURITY": "bg-orange-400",
  "APPROVED": "bg-green-400",
  "REJECTED": "bg-red-400"
};

// Format status for display
const formatStatus = (status: string): string => {
  if (status === "pending") return "Pending";
  
  return status
    .replace("PENDING_", "Pending ")
    .replace("_", " ")
    .replace(/([A-Z])/g, " $1")
    .trim();
};

interface Removal {
  id: number;
  userId: number;
  userName: string;
  departmentName: string;
  removalTerms: string;
  dateFrom: string;
  dateTo?: string;
  itemDescription: string;
  status: string;
  createdAt: string;
}

interface PaginationData {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

interface RemovalResponse {
  msg: string;
  removals: Removal[];
  pagination: PaginationData;
}

const RemovalsPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState<string>("_all");
  const [departmentFilter, setDepartmentFilter] = useState<string>("_all");
  
  // Fetch departments using React Query
  const { data: departments = [] } = useQuery({
    queryKey: ["departments"],
    queryFn: async () => {
      try {
        const response = await api.admin.getDepartments();
        if (response.result?.status === 'success' && response.result.response?.departments) {
          return response.result.response.departments;
        }
        return [];
      } catch (error) {
        console.error('Error fetching departments:', error);
        return [];
      }
    }
  });
  
  // Fetch removals using React Query
  const { 
    data: removalData, 
    isLoading, 
    isError, 
    error 
  } = useQuery({
    queryKey: ["removals", page, statusFilter, departmentFilter],
    queryFn: async () => {
      // Build filters object
      const filters: any = {};
      if (statusFilter && statusFilter !== "_all") filters.status = statusFilter;
      if (departmentFilter && departmentFilter !== "_all") filters.departmentId = parseInt(departmentFilter);
      
      // Get removals
      const response = await getRemovalRequests(filters, page, limit);
      
      if (response.result?.status === 'success') {
        return response.result.response as RemovalResponse;
      } else {
        throw new Error(response.result?.error || "Failed to load removal requests");
      }
    }
  });

  // Prepare removals and pagination data
  const removals = removalData?.removals || [];
  const totalPages = removalData?.pagination?.pages || 1;
  
  // Navigate to removal details
  const handleViewRemoval = (id: number) => {
    navigate(`/request/${id}`);
  };
  
  // Handle status filter change
  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    setPage(1); // Reset to first page when filter changes
  };
  
  // Handle department filter change
  const handleDepartmentFilterChange = (value: string) => {
    setDepartmentFilter(value);
    setPage(1); // Reset to first page when filter changes
  };
  
  // Clear filters
  const clearFilters = () => {
    setStatusFilter("_all");
    setDepartmentFilter("_all");
    setPage(1);
  };
  
  // Render removal term badge
  const renderTermBadge = (term: string) => {
    return (
      <Badge className={term === "returnable" ? "bg-blue-500" : "bg-amber-500"}>
        {term === "returnable" ? "Returnable" : "Non-Returnable"}
      </Badge>
    );
  };
  
  return (
    <div className="container mx-auto py-6">
      <Card className="mb-8">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
            <div>
              <CardTitle className="text-2xl font-bold">All Removal Requests</CardTitle>
              <CardDescription>
                View and manage all removal requests in the system
              </CardDescription>
            </div>
            <div className="mt-4 sm:mt-0">
              <Button onClick={() => navigate("/new-request")}>
                Create New Request
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {/* Filters */}
          <div className="mb-6 flex flex-col sm:flex-row gap-4">
            <div className="flex flex-col w-full sm:w-auto">
              <span className="text-sm font-medium mb-2">Status Filter</span>
              <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="DRAFT">Draft</SelectItem>
                  <SelectItem value="PENDING_LEVEL_2">Pending Level 2</SelectItem>
                  <SelectItem value="PENDING_LEVEL_3">Pending Level 3</SelectItem>
                  <SelectItem value="PENDING_LEVEL_4">Pending Level 4</SelectItem>
                  <SelectItem value="PENDING_SECURITY">Pending Security</SelectItem>
                  <SelectItem value="APPROVED">Approved</SelectItem>
                  <SelectItem value="REJECTED">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex flex-col w-full sm:w-auto">
              <span className="text-sm font-medium mb-2">Department Filter</span>
              <Select 
                value={departmentFilter} 
                onValueChange={handleDepartmentFilterChange}
              >
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="All Departments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_all">All Departments</SelectItem>
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id.toString()}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-end">
              <Button 
                variant="outline" 
                onClick={clearFilters}
                className="w-full sm:w-auto"
              >
                <Filter className="w-4 h-4 mr-2" />
                Clear Filters
              </Button>
            </div>
          </div>
          
          {/* Error display */}
          {isError && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                {error instanceof Error ? error.message : "Failed to load removal requests"}
              </AlertDescription>
            </Alert>
          )}
          
          {/* Removals Table */}
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <span className="ml-2">Loading removal requests...</span>
            </div>
          ) : removals.length === 0 ? (
            <div className="text-center py-8 border rounded-md">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <h3 className="text-lg font-medium">No removal requests found</h3>
              <p className="text-gray-500">
                {statusFilter !== "_all" || departmentFilter !== "_all" 
                  ? "Try clearing your filters to see more results" 
                  : "Create your first removal request to get started"}
              </p>
            </div>
          ) : (
            <>
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Created By</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Created Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  
                  <TableBody>
                    {removals.map((removal) => (
                      <TableRow key={removal.id}>
                        <TableCell className="font-medium">#{removal.id}</TableCell>
                        <TableCell>{removal.userName || "N/A"}</TableCell>
                        <TableCell>{removal.departmentName || "N/A"}</TableCell>
                        <TableCell>
                          {removal.createdAt 
                            ? format(new Date(removal.createdAt), "MMM d, yyyy") 
                            : "N/A"}
                        </TableCell>
                        <TableCell>{renderTermBadge(removal.removalTerms)}</TableCell>
                        <TableCell>
                          <Badge className={statusColors[removal.status] || "bg-gray-400"}>
                            {formatStatus(removal.status)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleViewRemoval(removal.id)}
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
              {totalPages > 1 && (
                <Pagination className="mt-6">
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        className={page === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                    
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                      <PaginationItem key={pageNum}>
                        <PaginationLink
                          onClick={() => setPage(pageNum)}
                          isActive={page === pageNum}
                          className="cursor-pointer"
                        >
                          {pageNum}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    
                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        className={page === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default RemovalsPage; 