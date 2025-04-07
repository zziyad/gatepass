import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts";
import { useQuery } from "@tanstack/react-query";
import AppLayout from "@/components/AppLayout";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CheckCircle, Clock, XCircle, Plus, Search, Loader2 } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { getRemovalRequests } from "@/api/removalService";
import { format } from "date-fns";

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

interface User {
  id: string | number;
  role: string;
}

interface Removal {
  id: number;
  status: string;
  createdAt: string;
  userId: number;
  userName: string;
  itemDescription: string;
  items?: Array<{ description: string; removalReason?: string }>;
  removalTerms: string;
  dateFrom: string;
  dateTo?: string;
  departmentName: string;
  rejectionReason?: string;
}

const MyRequests = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [searchTerm, setSearchTerm] = useState("");
  
  const { data: removalData, isLoading } = useQuery({
    queryKey: ["my-removals"],
    queryFn: async () => {
      if (!user?.id) throw new Error("User ID is required");
      const userId = Number(user.id);
      if (isNaN(userId)) throw new Error("Invalid user ID");
      
      const response = await getRemovalRequests({ userId });
      if (response.result?.status === 'success') {
        return response.result.response.removals as Removal[];
      }
      throw new Error(response.result?.error || "Failed to load removals");
    },
    enabled: !!user?.id
  });

  const removals = removalData || [];
  
  // Filter removals by search term
  const filteredRemovals = removals.filter((removal) => {
    const searchLower = searchTerm.toLowerCase();
    return searchTerm === "" || (
      (removal.items?.some(item => 
        item.description.toLowerCase().includes(searchLower) ||
        item.removalReason?.toLowerCase().includes(searchLower)
      )) ||
      (removal.itemDescription?.toLowerCase().includes(searchLower)) ||
      removal.departmentName.toLowerCase().includes(searchLower)
    );
  });
  
  // Group removals by status
  const pendingRemovals = filteredRemovals.filter(
    (removal) => !["APPROVED", "REJECTED"].includes(removal.status)
  );
  const approvedRemovals = filteredRemovals.filter(
    (removal) => removal.status === "APPROVED"
  );
  const rejectedRemovals = filteredRemovals.filter(
    (removal) => removal.status === "REJECTED"
  );

  const renderTermBadge = (term: string) => {
    return (
      <Badge className={term === "returnable" ? "bg-blue-500" : "bg-amber-500"}>
        {term === "returnable" ? "Returnable" : "Non-Returnable"}
      </Badge>
    );
  };

  const RemovalTable = ({ removals }: { removals: Removal[] }) => {
    return (
      <div className="rounded-md border">
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
                  {format(new Date(removal.createdAt), "MMM d, yyyy")}
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
                    onClick={() => navigate(`/request/${removal.id}`)}
                  >
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  };
  
  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex justify-center items-center h-full py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-3">Loading your requests...</span>
        </div>
      </AppLayout>
    );
  }
  
  return (
    <AppLayout>
      <div className={isMobile ? "space-y-5 px-2 pb-6" : "space-y-8 max-w-7xl mx-auto pb-10 px-4"}>
        <PageHeader title="My Requests" description="Review and manage your removal requests">
          <Button onClick={() => navigate("/new-request")}>
            <Plus className="mr-2 h-4 w-4" />
            New Request
          </Button>
        </PageHeader>
        
        <div className="flex items-center space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="search"
              placeholder="Search requests..."
              className="pl-8 h-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <Tabs defaultValue="pending" className={isMobile ? "pb-6" : ""}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pending" className={isMobile ? "text-sm py-1.5" : ""}>
              Pending ({pendingRemovals.length})
            </TabsTrigger>
            <TabsTrigger value="approved" className={isMobile ? "text-sm py-1.5" : ""}>
              Approved ({approvedRemovals.length})
            </TabsTrigger>
            <TabsTrigger value="rejected" className={isMobile ? "text-sm py-1.5" : ""}>
              Rejected ({rejectedRemovals.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="pending" className="mt-6">
            {pendingRemovals.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Clock className="mx-auto h-8 w-8 text-gray-400" />
                <p className="mt-2">No pending requests found</p>
              </div>
            ) : (
              <RemovalTable removals={pendingRemovals} />
            )}
          </TabsContent>
          
          <TabsContent value="approved" className="mt-6">
            {approvedRemovals.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <CheckCircle className="mx-auto h-8 w-8 text-gray-400" />
                <p className="mt-2">No approved requests found</p>
              </div>
            ) : (
              <RemovalTable removals={approvedRemovals} />
            )}
          </TabsContent>
          
          <TabsContent value="rejected" className="mt-6">
            {rejectedRemovals.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <XCircle className="mx-auto h-8 w-8 text-gray-400" />
                <p className="mt-2">No rejected requests found</p>
              </div>
            ) : (
              <RemovalTable removals={rejectedRemovals} />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default MyRequests;
