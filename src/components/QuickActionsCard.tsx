import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface QuickActionsCardProps {
  pendingApprovalsCount: number;
  isMobile: boolean;
}

const QuickActionsCard = ({
  pendingApprovalsCount,
  isMobile,
}: QuickActionsCardProps) => {
  const navigate = useNavigate();

  return (
    <Card className="shadow-sm border-t-2 border-t-green-100">
      <CardHeader className={isMobile ? "pb-2 px-4 pt-4" : "pb-3 px-6 pt-5"}>
        <CardTitle className={isMobile ? "text-lg" : "text-xl"}>
          Quick Actions
        </CardTitle>
        <CardDescription className={isMobile ? "text-xs" : "text-sm"}>
          Common tasks
        </CardDescription>
      </CardHeader>
      <CardContent
        className={isMobile ? "space-y-3 px-4 py-2" : "space-y-4 px-6 py-3"}
      >
        <Button
          className="w-full justify-start h-10"
          onClick={() => navigate("/new-request")}
        >
          <Plus className="mr-2 h-5 w-5" />
          New Removal Request
        </Button>
        <Button
          variant="outline"
          className="w-full justify-start h-10"
          onClick={() => navigate("/approvals")}
          disabled={pendingApprovalsCount === 0}
        >
          Review Pending Approvals
        </Button>
      </CardContent>
    </Card>
  );
};

export default QuickActionsCard;
