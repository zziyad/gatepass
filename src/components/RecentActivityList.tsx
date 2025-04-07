import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { memo } from "react";
import { getStatusColor, formatStatus, getItemsDescription } from "@/utils/activityUtils";
import { Activity } from "@/types";



interface RecentActivityListProps {
  activities: Activity[];
  isMobile: boolean;
  isLoading?: boolean;
  error?: string | null;
}

const ActivityItem = memo(({ activity }: { activity: Activity }) => {
  const navigate = useNavigate();
  const description = getItemsDescription(activity);

  return (
    <div className="flex items-center justify-between gap-3 border-b pb-2 last:border-0">
      <div className="flex-grow min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge
            variant="outline"
            className={`${getStatusColor(activity.status)} truncate`}
          >
            {formatStatus(activity.status)}
          </Badge>
          <span
            className="font-medium truncate relative group"
            title={description}
          >
            Request #{activity.id}: {description}
          </span>
          <span className="text-sm text-gray-500 flex-shrink-0">
            {formatDistanceToNow(activity.createdAt, { addSuffix: true })}
          </span>
        </div>
      </div>
      <Button
        variant="outline"
        size="sm"
        className="shrink-0"
        onClick={() => navigate(`/request/${activity.id}`)}
      >
        View Details
      </Button>
    </div>
  );
});

const RecentActivityList = ({
  activities,
  isMobile,
  isLoading = false,
  error = null,
}: RecentActivityListProps) => {
  return (
    <Card className="shadow-sm border-t-2 border-t-purple-100">
      <CardHeader className={isMobile ? "pb-2 px-4 pt-4" : "pb-3 px-6 pt-5"}>
        <CardTitle className={isMobile ? "text-lg" : "text-xl"}>
          Recent Activity
        </CardTitle>
        <CardDescription className={isMobile ? "text-xs" : "text-sm"}>
          Latest updates on removal requests
        </CardDescription>
      </CardHeader>
      <CardContent className={isMobile ? "px-4 py-2" : "px-6 py-3"}>
        <div className="space-y-3">
          {isLoading ? (
            <div className="text-center py-4 text-gray-500">Loading...</div>
          ) : error ? (
            <div className="text-center py-4 text-red-500">
              Error: {error}
            </div>
          ) : activities.length > 0 ? (
            activities.map((activity) => (
              <ActivityItem key={activity.id} activity={activity} />
            ))
          ) : (
            <div className="text-center py-4 text-gray-500">
              No recent activity
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentActivityList;