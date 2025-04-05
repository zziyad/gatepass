import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Define an Activity interface that captures the essential information
interface Activity {
  id: number;
  type: string; // "removal", "approval", etc.
  status: string;
  createdAt: Date;
  userName: string;
  description: string;
}

interface RecentActivityListProps {
  activities: Activity[];
  isMobile: boolean;
}

const RecentActivityList = ({
  activities,
  isMobile,
}: RecentActivityListProps) => {
  const navigate = useNavigate();

  const formatDate = (date: Date): string => {
    try {
      return date.toLocaleDateString();
    } catch (error) {
      console.error("Error formatting date:", error);
      return 'Invalid date';
    }
  };

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
        <div className="space-y-4">
          {activities.length > 0 ? (
            activities.map((activity) => (
              <div
                key={activity.id}
                className="flex justify-between items-center border-b pb-3 last:border-0"
              >
                <div className="max-w-[70%]">
                  <h3
                    className={
                      isMobile
                        ? "font-medium text-sm truncate"
                        : "font-medium truncate"
                    }
                  >
                    {activity.description}
                  </h3>
                  <p
                    className={
                      isMobile
                        ? "text-xs text-gray-500"
                        : "text-sm text-gray-500"
                    }
                  >
                    Status:{" "}
                    <span
                      className={
                        activity.status === "APPROVED"
                          ? "text-green-600 font-medium"
                          : activity.status === "REJECTED"
                          ? "text-red-600 font-medium"
                          : "text-amber-600 font-medium"
                      }
                    >
                      {activity.status.replace("_", " ")}
                    </span>
                  </p>
                  <p
                    className={
                      isMobile
                        ? "text-xs text-gray-400"
                        : "text-xs text-gray-400"
                    }
                  >
                    By: {activity.userName} • {formatDate(activity.createdAt)}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 whitespace-nowrap"
                  onClick={() => navigate(`/request/${activity.id}`)}
                >
                  View
                </Button>
              </div>
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
