
import { RemovalRequest, RemovalReason } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ApprovalFlow from "./ApprovalFlow";

interface RequestDetailsProps {
  request: RemovalRequest;
  removalReasons: RemovalReason[];
}

const RequestDetails: React.FC<RequestDetailsProps> = ({ request, removalReasons }) => {
  // Find the removal reason
  const removalReason = removalReasons.find(
    (reason) => reason.id === request.removalReasonId
  );

  // Format status for display
  const formatStatus = (status: string) => {
    return status
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, (l) => l.toUpperCase());
  };

  // Get status color
  const getStatusColor = (status: string) => {
    if (status === "APPROVED") return "bg-green-100 text-green-800 border-green-200";
    if (status === "REJECTED") return "bg-red-100 text-red-800 border-red-200";
    if (status.startsWith("PENDING")) return "bg-yellow-100 text-yellow-800 border-yellow-200";
    return "bg-gray-100 text-gray-800 border-gray-200";
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>Removal Request #{request.id.slice(0, 8)}</CardTitle>
              <p className="text-sm text-gray-500 mt-1">
                Submitted by {request.userName} ({request.department}) on{" "}
                {request.createdAt.toLocaleDateString()}
              </p>
            </div>
            <Badge className={getStatusColor(request.status)}>
              {formatStatus(request.status)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Item Description</h3>
                <p className="mt-1">{request.itemDescription}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Removal Term</h3>
                <p className="mt-1">
                  {request.term === "RETURNABLE" ? "Returnable" : "Non-Returnable"}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Dates</h3>
                <p className="mt-1">
                  From: {request.dateFrom.toLocaleDateString()}
                  {request.dateTo && (
                    <span> - To: {request.dateTo.toLocaleDateString()}</span>
                  )}
                </p>
              </div>

              {request.term === "RETURNABLE" && request.targetDepartment && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Target Department</h3>
                  <p className="mt-1">{request.targetDepartment}</p>
                </div>
              )}

              {request.term === "NON_RETURNABLE" && request.employee && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Employee (Sender)</h3>
                  <p className="mt-1">{request.employee}</p>
                </div>
              )}

              <div>
                <h3 className="text-sm font-medium text-gray-500">Removal Reason</h3>
                <p className="mt-1">{removalReason?.name || "Unknown"}</p>
                {request.customReason && (
                  <p className="text-sm text-gray-500 mt-1">{request.customReason}</p>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-500">Images</h3>
              {request.images.length > 0 ? (
                <div className="grid grid-cols-2 gap-2">
                  {request.images.map((image) => (
                    <img
                      key={image.id}
                      src={image.url}
                      alt="Item"
                      className="h-32 w-full object-cover rounded border"
                    />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No images uploaded</p>
              )}

              {request.approvals.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Approval History</h3>
                  <div className="space-y-2 mt-1">
                    {request.approvals.map((approval, index) => (
                      <div key={index} className="text-sm border rounded-md p-2 bg-gray-50">
                        <div className="flex justify-between">
                          <span className="font-medium">
                            {approval.stage}{" "}
                            <span className={approval.approved ? "text-green-600" : "text-red-600"}>
                              {approval.approved ? "Approved" : "Rejected"}
                            </span>
                          </span>
                          <span className="text-gray-500">
                            {approval.timestamp.toLocaleDateString()}
                          </span>
                        </div>
                        {approval.approvedBy && (
                          <div className="text-gray-600 mt-1">By: {approval.approvedBy}</div>
                        )}
                        {approval.rejectionReason && (
                          <div className="text-gray-600 mt-1">
                            Reason: {approval.rejectionReason}
                          </div>
                        )}
                        {approval.signature && approval.approved && (
                          <div className="mt-1">
                            <span className="text-xs text-gray-500">Signature:</span>
                            <img
                              src={approval.signature}
                              alt="Signature"
                              className="h-8 mt-1"
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <ApprovalFlow request={request} />
    </div>
  );
};

export default RequestDetails;
