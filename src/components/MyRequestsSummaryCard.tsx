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
import { Clock, CheckCircle, XCircle, FileText } from "lucide-react";
import { RemovalRequest } from "@/types"; // Use RemovalRequest type
import { User } from "@/types"; // Assuming User type is defined in @/types

interface MyRequestsSummaryCardProps {
  user: User | null;
  requests: RemovalRequest[]; // Use RemovalRequest type
  isMobile: boolean;
}

const MyRequestsSummaryCard = ({
  user,
  requests,
  isMobile,
}: MyRequestsSummaryCardProps) => {
  const navigate = useNavigate();

  if (!user) return null; // Or some loading/error state

  const myRequests = requests.filter((req) => req.userId === user.id);
  const pendingCount = myRequests.filter(
    (req) => !["APPROVED", "REJECTED"].includes(req.status)
  ).length;
  const approvedCount = myRequests.filter(
    (req) => req.status === "APPROVED"
  ).length;
  const rejectedCount = myRequests.filter(
    (req) => req.status === "REJECTED"
  ).length;

  return (
    <Card className="shadow-sm border-t-2 border-t-blue-100">
      <CardHeader className={isMobile ? "pb-2 px-4 pt-4" : "pb-3 px-6 pt-5"}>
        <CardTitle className={isMobile ? "text-lg" : "text-xl"}>
          My Requests
        </CardTitle>
        <CardDescription className={isMobile ? "text-xs" : "text-sm"}>
          Summary of your removal requests
        </CardDescription>
      </CardHeader>
      <CardContent className={isMobile ? "px-4 py-2" : "px-6 py-3"}>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Clock className="w-5 h-5 text-amber-500 mr-2" />
              <span className={isMobile ? "text-sm" : "text-base"}>
                Pending
              </span>
            </div>
            <span
              className={
                isMobile ? "text-sm font-semibold" : "text-lg font-semibold"
              }
            >
              {pendingCount}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
              <span className={isMobile ? "text-sm" : "text-base"}>
                Approved
              </span>
            </div>
            <span
              className={
                isMobile ? "text-sm font-semibold" : "text-lg font-semibold"
              }
            >
              {approvedCount}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <XCircle className="w-5 h-5 text-red-500 mr-2" />
              <span className={isMobile ? "text-sm" : "text-base"}>
                Rejected
              </span>
            </div>
            <span
              className={
                isMobile ? "text-sm font-semibold" : "text-lg font-semibold"
              }
            >
              {rejectedCount}
            </span>
          </div>
        </div>
      </CardContent>
      <CardFooter className={isMobile ? "px-4 py-3" : "px-6 py-4"}>
        <Button
          variant="outline"
          className="w-full h-10"
          onClick={() => navigate("/my-requests")}
        >
          <FileText className="mr-2 h-4 w-4" />
          View All Requests
        </Button>
      </CardFooter>
    </Card>
  );
};

export default MyRequestsSummaryCard;
