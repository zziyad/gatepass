import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RemovalRequest } from "@/types";
import { User } from "@/types";
import { canUserApprove } from "@/lib/mockData"; // Assuming this helper exists

interface PendingApprovalsCardProps {
  user: User | null;
  requests: RemovalRequest[];
  isMobile: boolean;
}

const PendingApprovalsCard = ({
  user,
  requests,
  isMobile,
}: PendingApprovalsCardProps) => {
  const navigate = useNavigate();

  if (!user) return null;

  const pendingApprovals = requests.filter(
    (req) => user && canUserApprove(user.role, req.status)
  );

  return (
    <Card className="shadow-sm border-t-2 border-t-amber-100">
      <CardHeader className={isMobile ? "pb-2 px-4 pt-4" : "pb-3 px-6 pt-5"}>
        <CardTitle className={isMobile ? "text-lg" : "text-xl"}>
          Pending Approvals
        </CardTitle>
        <CardDescription className={isMobile ? "text-xs" : "text-sm"}>
          Requests waiting for your approval
        </CardDescription>
      </CardHeader>
      <CardContent className={isMobile ? "px-4 py-2" : "px-6 py-3"}>
        <div className="space-y-3">
          {pendingApprovals.length > 0 ? (
            pendingApprovals.slice(0, 3).map((request) => (
              <div
                key={request.id}
                className="flex justify-between items-center"
              >
                <div className="truncate max-w-[180px] text-sm">
                  {request.itemDescription}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 ml-2 whitespace-nowrap"
                  onClick={() => navigate(`/request/${request.id}`)}
                >
                  Review
                </Button>
              </div>
            ))
          ) : (
            <div className="text-gray-500 text-center py-3">
              No pending approvals
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className={isMobile ? "px-4 py-3" : "px-6 py-4"}>
        <Button
          variant="outline"
          className="w-full h-10"
          onClick={() => navigate("/approvals")}
          disabled={pendingApprovals.length === 0}
        >
          View All Approvals
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PendingApprovalsCard;
