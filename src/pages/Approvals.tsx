import { useEffect, useState, useMemo, useCallback, memo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth, useRequests } from "@/contexts";
import AppLayout from "@/components/AppLayout";
import PageHeader from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CheckCircle, Clock, Search } from "lucide-react";
import { canUserApprove } from "@/lib/mockData";
import { useIsMobile } from "@/hooks/use-mobile";
import { RemovalRequest } from "@/types";

// Memoized request card component to prevent unnecessary re-renders
const RequestCard = memo(
  ({
    request,
    isMobile,
    formatStatus,
    onReview,
  }: {
    request: RemovalRequest;
    isMobile: boolean;
    formatStatus: (status: string) => string;
    onReview: (id: string) => void;
  }) => (
    <Card key={request.id} className="p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div className="max-w-[65%]">
          <h3
            className={
              isMobile
                ? "font-medium text-base truncate"
                : "font-medium text-lg truncate"
            }
          >
            {request.itemDescription}
          </h3>
          <div
            className={
              isMobile
                ? "flex flex-col text-xs text-gray-500 mt-1"
                : "flex flex-col sm:flex-row sm:space-x-4 text-sm text-gray-500 mt-1"
            }
          >
            <p>Requested by {request.userName}</p>
            <p>Department: {request.department}</p>
            <p>
              Status:{" "}
              <span className="text-amber-600 font-medium">
                {formatStatus(request.status)}
              </span>
            </p>
          </div>
          <div
            className={
              isMobile
                ? "text-xs text-gray-500 mt-1"
                : "text-sm text-gray-500 mt-1"
            }
          >
            <p>
              {request.term === "RETURNABLE" ? "Returnable" : "Non-Returnable"}{" "}
              • Submitted on {request.createdAt.toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Clock className="w-5 h-5 text-amber-500" />
          <Button
            onClick={() => onReview(request.id)}
            size={isMobile ? "sm" : "default"}
            className={isMobile ? "h-9 text-xs" : ""}
          >
            Review
          </Button>
        </div>
      </div>
    </Card>
  )
);

// Format status for display - memoized to avoid recalculation
const formatStatus = (status: string) => {
  return status
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (l) => l.toUpperCase());
};

const Approvals = () => {
  const { user } = useAuth();
  const { requests } = useRequests();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  if (!user) return null;

  // Memoize the filtered approvals to prevent recalculation on every render
  const pendingApprovals = useMemo(
    () => requests.filter((req) => canUserApprove(user.role, req.status)),
    [requests, user.role]
  );

  // Further filter by search term and status - also memoized
  const filteredApprovals = useMemo(
    () =>
      pendingApprovals.filter((req) => {
        const matchesSearch = searchTerm
          ? req.itemDescription.toLowerCase().includes(searchTerm.toLowerCase())
          : true;
        const matchesStatus =
          filterStatus === "all" || req.status === filterStatus;
        return matchesSearch && matchesStatus;
      }),
    [pendingApprovals, searchTerm, filterStatus]
  );

  // Memoize the statuses array to prevent recreation on every render
  const statuses = useMemo(
    () => ["all", ...new Set(pendingApprovals.map((req) => req.status))],
    [pendingApprovals]
  );

  // Memoize the navigation handler
  const handleReview = useCallback(
    (id: string) => {
      navigate(`/request/${id}`);
    },
    [navigate]
  );

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
          title="Pending Approvals"
          description="Review and process requests waiting for your approval"
        />

        {/* Filters */}
        <div
          className={
            isMobile ? "flex flex-col space-y-3" : "flex items-center space-x-4"
          }
        >
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

          <div className={isMobile ? "w-full" : "w-64"}>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                {statuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status === "all" ? "All Statuses" : formatStatus(status)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Approval List */}
        <div className="space-y-4">
          {filteredApprovals.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <CheckCircle className="mx-auto h-8 w-8 text-gray-400" />
              <p className="mt-2">No pending approvals found</p>
            </div>
          ) : (
            filteredApprovals.map((request) => (
              <Card
                key={request.id}
                className="p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div className="max-w-[65%]">
                    <h3
                      className={
                        isMobile
                          ? "font-medium text-base truncate"
                          : "font-medium text-lg truncate"
                      }
                    >
                      {request.itemDescription}
                    </h3>
                    <div
                      className={
                        isMobile
                          ? "flex flex-col text-xs text-gray-500 mt-1"
                          : "flex flex-col sm:flex-row sm:space-x-4 text-sm text-gray-500 mt-1"
                      }
                    >
                      <p>Requested by {request.userName}</p>
                      <p>Department: {request.department}</p>
                      <p>
                        Status:{" "}
                        <span className="text-amber-600 font-medium">
                          {formatStatus(request.status)}
                        </span>
                      </p>
                    </div>
                    <div
                      className={
                        isMobile
                          ? "text-xs text-gray-500 mt-1"
                          : "text-sm text-gray-500 mt-1"
                      }
                    >
                      <p>
                        {request.term === "RETURNABLE"
                          ? "Returnable"
                          : "Non-Returnable"}{" "}
                        • Submitted on {request.createdAt.toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-5 h-5 text-amber-500" />
                    <Button
                      onClick={() => navigate(`/request/${request.id}`)}
                      size={isMobile ? "sm" : "default"}
                      className={isMobile ? "h-9 text-xs" : ""}
                    >
                      Review
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default Approvals;
