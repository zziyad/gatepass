// components/RequestDetails/RequestDetails.tsx
import { useState } from "react";
import { Removal, RemovalReason } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ImageModal from "@/components/ui/ImageModal";
import ApprovalFlow from "../ApprovalFlow";
import { formatStatus, getStatusColor, isReturnable } from "@/utils/removalUtils";
import RemovalTerms from "./RemovalTerms";
import RequestFormField from "./RequestFormField";
import ItemsTable from "./ItemsTable";
import ImagesSection from "./ImagesSection";
import ApprovalHistory from "./ApprovalHistory";

interface RequestDetailsProps {
  request: Removal;
  removalReasons: RemovalReason[];
}

const RequestDetails: React.FC<RequestDetailsProps> = ({ request, removalReasons = [] }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Log request properties for debugging
  console.log("Request object:", request);
  console.log("Has items array:", request.items && request.items.length > 0);
  console.log("Items data:", request.items);

  if (!request) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-lg">Request data not available</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 print:p-4">
      <Card className="print:shadow-none">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>Removal Request #{request.id}</CardTitle>
            </div>
            <Badge className={getStatusColor(request.status)}>{formatStatus(request.status)}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <RemovalTerms request={request} />

            {/* Main Form Grid */}
            <div className="grid grid-cols-2 gap-8">
              {/* Left Column */}
              <div className="space-y-4">
                <RequestFormField
                  label="Date From / Tarixindən"
                  value={request.dateFrom ? new Date(request.dateFrom).toLocaleDateString() : ""}
                />
                <RequestFormField label="Employee / İşçi" value={request.employee || ""} />
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                {isReturnable(request) && (
                  <>
                    <RequestFormField
                      label="Date To / Tarixinədək"
                      value={request.dateTo ? new Date(request.dateTo).toLocaleDateString() : ""}
                    />
                    <RequestFormField
                      label="Department / Şöbə"
                      value={request.department?.name || ""}
                    />
                  </>
                )}
              </div>
            </div>

            <ItemsTable request={request} removalReasons={removalReasons} />

            {request.images && request.images.length > 0 && (
              <ImagesSection images={request.images} onImageClick={setSelectedImage} />
            )}

            <ImageModal
              isOpen={!!selectedImage}
              onClose={() => setSelectedImage(null)}
              imageUrl={selectedImage || ""}
            />

            {request.approvals && request.approvals.length > 0 && (
              <ApprovalHistory approvals={request.approvals} />
            )}
          </div>
        </CardContent>
      </Card>

      <ApprovalFlow request={request} />
    </div>
  );
};

export default RequestDetails;