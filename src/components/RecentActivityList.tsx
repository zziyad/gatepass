import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RemovalRequest } from "@/types";

interface RecentActivityListProps {
  requests: RemovalRequest[];
  isMobile: boolean;
}

const RecentActivityList = ({
  requests,
  isMobile,
}: RecentActivityListProps) => {
  const navigate = useNavigate();

  // Safely sort requests by updated date
  const sortedRequests = [...requests]
    .sort((a, b) => {
      // Check if updatedAt is a Date object or needs to be converted
      const dateA = a.updatedAt instanceof Date ? a.updatedAt : new Date(a.updatedAt);
      const dateB = b.updatedAt instanceof Date ? b.updatedAt : new Date(b.updatedAt);
      
      return dateB.getTime() - dateA.getTime();
    })
    .slice(0, 5);

  const formatDate = (date: Date | string): string => {
    try {
      if (date instanceof Date) {
        return date.toLocaleDateString();
      } else if (typeof date === 'string') {
        // Try to convert string date to Date object
        return new Date(date).toLocaleDateString();
      } else {
        return 'Unknown date';
      }
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
          {sortedRequests.length > 0 ? (
            sortedRequests.map((request) => (
              <div
                key={request.id}
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
                    {request.itemDescription}
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
                        request.status === "APPROVED"
                          ? "text-green-600 font-medium"
                          : request.status === "REJECTED"
                          ? "text-red-600 font-medium"
                          : "text-amber-600 font-medium"
                      }
                    >
                      {request.status.replace("_", " ")}
                    </span>
                  </p>
                  <p
                    className={
                      isMobile
                        ? "text-xs text-gray-400"
                        : "text-xs text-gray-400"
                    }
                  >
                    Updated: {formatDate(request.updatedAt)}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 whitespace-nowrap"
                  onClick={() => navigate(`/request/${request.id}`)}
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
