import { useAuth, useRequests } from "@/contexts";
import AppLayout from "@/components/AppLayout";
import PageHeader from "@/components/PageHeader";
import { canUserApprove } from "@/lib/mockData";
import { useIsMobile } from "@/hooks/use-mobile";
import MyRequestsSummaryCard from "@/components/MyRequestsSummaryCard";
import PendingApprovalsCard from "@/components/PendingApprovalsCard";
import QuickActionsCard from "@/components/QuickActionsCard";
import RecentActivityList from "@/components/RecentActivityList";

const Dashboard = () => {
  const { user } = useAuth();
  const { requests } = useRequests();
  const isMobile = useIsMobile();

  // Calculate pending approvals count needed for QuickActionsCard
  const pendingApprovalsCount = requests.filter(
    (req) => user && canUserApprove(user.role, req.status)
  ).length;

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
            requests={requests}
            isMobile={isMobile}
          />
          <PendingApprovalsCard
            user={user}
            requests={requests}
            isMobile={isMobile}
          />
          <QuickActionsCard
            pendingApprovalsCount={pendingApprovalsCount}
            isMobile={isMobile}
          />
        </div>

        <RecentActivityList requests={requests} isMobile={isMobile} />
      </div>
    </AppLayout>
  );
};

export default Dashboard;
