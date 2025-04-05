import { useAuth } from "@/contexts";
import { useQuery } from "@tanstack/react-query";
import AppLayout from "@/components/AppLayout";
import PageHeader from "@/components/PageHeader";
import { useIsMobile } from "@/hooks/use-mobile";
import MyRequestsSummaryCard from "@/components/MyRequestsSummaryCard";
import PendingApprovalsCard from "@/components/PendingApprovalsCard";
import QuickActionsCard from "@/components/QuickActionsCard";
import RecentActivityList from "@/components/RecentActivityList";
import { UserRole, RemovalStatus } from "@/types";
import { getRemovalRequests } from "@/api/removalService";
import { Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Utility function to determine if a user with a given role can approve a request
const canUserApprove = (userRole: UserRole, requestStatus: RemovalStatus): boolean => {
  const roleStatusMap: Record<UserRole, RemovalStatus[]> = {
    'LEVEL_1': [],
    'LEVEL_2': ['PENDING_LEVEL_2'],
    'LEVEL_3': ['PENDING_LEVEL_3'],
    'LEVEL_4': ['PENDING_LEVEL_4'],
    'SECURITY': ['PENDING_SECURITY'],
    'ADMIN': ['PENDING_LEVEL_2', 'PENDING_LEVEL_3', 'PENDING_LEVEL_4', 'PENDING_SECURITY']
  };
  
  return roleStatusMap[userRole]?.includes(requestStatus) || false;
};

// Interface for removal data
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

interface RemovalResponse {
  msg: string;
  removals: Removal[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

const Dashboard = () => {
  const { user } = useAuth();
  const isMobile = useIsMobile();

  // Fetch all removals for the dashboard
  const { data: removalData, isLoading, isError, error } = useQuery({
    queryKey: ["dashboard-removals"],
    queryFn: async () => {
      // Add any filters based on the current user if needed
      const filters: { userId?: number } = {}; 
      
      if (user && user.role !== "ADMIN") {
        // Convert userId to number if it's a string
        const userId = typeof user.id === 'string' ? parseInt(user.id) : user.id as number;
        filters.userId = userId;
      }
      
      const response = await getRemovalRequests(filters);
      
      if (response.result?.status === 'success') {
        return response.result.response as RemovalResponse;
      } else {
        throw new Error(response.result?.error || "Failed to load removal requests");
      }
    },
    enabled: !!user, // Only run if user is available
  });

  // Get the list of removals
  const removals = removalData?.removals || [];

  // Calculate counts for the dashboard cards
  const pendingCount = removals.filter(req => req.status === "pending" || req.status === "PENDING_LEVEL_2").length;
  const approvedCount = removals.filter(req => req.status === "APPROVED").length;
  const rejectedCount = removals.filter(req => req.status === "REJECTED").length;

  // Calculate pending approvals that the current user can approve
  const pendingApprovalsCount = user ? removals.filter(
    (req) => canUserApprove(user.role as UserRole, req.status as RemovalStatus)
  ).length : 0;

  // Show loading state
  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex justify-center items-center h-full py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-3">Loading dashboard data...</span>
        </div>
      </AppLayout>
    );
  }

  // Show error state
  if (isError) {
    return (
      <AppLayout>
        <div className="max-w-7xl mx-auto p-4">
          <Alert variant="destructive" className="my-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {error instanceof Error ? error.message : "Failed to load dashboard data"}
            </AlertDescription>
          </Alert>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div
        className={
          isMobile
            ? "space-y-5 px-2 pb-6"
            : "space-y-8 max-w-7xl mx-auto pb-10 px-4"
        }
      >
        <PageHeader
          title="Dashboard"
          description="Overview of your removal requests and activities"
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          <MyRequestsSummaryCard
            user={user}
            pendingCount={pendingCount}
            approvedCount={approvedCount}
            rejectedCount={rejectedCount}
            isMobile={isMobile}
          />
          <PendingApprovalsCard
            user={user}
            pendingRequests={removals.filter(req => 
              user && canUserApprove(user.role as UserRole, req.status as RemovalStatus)
            )}
            isMobile={isMobile}
          />
          <QuickActionsCard
            pendingApprovalsCount={pendingApprovalsCount}
            isMobile={isMobile}
          />
        </div>

        <RecentActivityList 
          activities={removals.slice(0, 5).map(removal => ({
            id: removal.id,
            type: "removal",
            status: removal.status,
            createdAt: new Date(removal.createdAt),
            userName: removal.userName,
            description: removal.itemDescription
          }))} 
          isMobile={isMobile} 
        />
      </div>
    </AppLayout>
  );
};

export default Dashboard;
