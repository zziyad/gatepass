import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import RecentActivityItem from "./RecentActivityItem";
import { useRouter } from "next/navigation";

interface RemovalRequest {
  id: string | number;
  status: string;
  dateFrom: string | Date;
  dateTo?: string | Date;
  employee?: string;
  department?: string;
  createdAt: string | Date;
  items?: { description: string }[];
  itemDescription?: string;
  removalTerms?: string;
}

interface DashboardRecentActivityProps {
  recentRequests: RemovalRequest[];
}

const DashboardRecentActivity: React.FC<DashboardRecentActivityProps> = ({
  recentRequests = []
}) => {
  const router = useRouter();

  const handleViewRequest = (id: string | number) => {
    router.push(`/requests/${id}`);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Recent Activity</CardTitle>
        <p className="text-sm text-gray-500">Latest updates on removal requests</p>
      </CardHeader>
      <CardContent>
        {recentRequests.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            No recent activity
          </div>
        ) : (
          <div className="space-y-4">
            {recentRequests.map((request) => (
              <RecentActivityItem
                key={request.id}
                {...request}
                onView={() => handleViewRequest(request.id)}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DashboardRecentActivity; 