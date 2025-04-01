
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/contexts/AppContext";
import { RemovalRequest } from "@/types";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { canUserApprove } from "@/lib/mockData";
import SignatureCanvas from "react-signature-canvas";

interface ApprovalActionsProps {
  request: RemovalRequest;
}

const ApprovalActions: React.FC<ApprovalActionsProps> = ({ request }) => {
  const { user, updateRequestStatus } = useApp();
  const navigate = useNavigate();
  
  const [signature, setSignature] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectionForm, setShowRejectionForm] = useState(false);
  const [sigCanvas, setSigCanvas] = useState<SignatureCanvas | null>(null);
  
  // Check if current user can approve this request
  const canApprove = user ? canUserApprove(user.role, request.status) : false;
  
  const handleApprove = () => {
    if (!signature) {
      alert("Please sign to approve the request");
      return;
    }
    
    updateRequestStatus(request.id, true, signature);
    navigate("/dashboard");
  };
  
  const handleReject = () => {
    if (!rejectionReason) {
      alert("Please provide a reason for rejection");
      return;
    }
    
    updateRequestStatus(request.id, false, undefined, rejectionReason);
    navigate("/dashboard");
  };
  
  const clearSignature = () => {
    if (sigCanvas) {
      sigCanvas.clear();
      setSignature(null);
    }
  };
  
  const saveSignature = () => {
    if (sigCanvas && !sigCanvas.isEmpty()) {
      setSignature(sigCanvas.toDataURL());
    } else {
      alert("Please sign before saving");
    }
  };
  
  if (!canApprove) {
    return null;
  }
  
  return (
    <div className="p-4 bg-white rounded-lg shadow-sm border mt-4">
      <h3 className="text-lg font-medium mb-4">Approval Actions</h3>
      
      {!showRejectionForm ? (
        <div className="space-y-4">
          <div className="border rounded-lg p-4">
            <Label className="mb-2 block">Your Signature</Label>
            <div className="border rounded bg-gray-50 mb-2">
              <SignatureCanvas
                ref={(ref) => setSigCanvas(ref)}
                canvasProps={{
                  width: 500,
                  height: 200,
                  className: "signature-canvas w-full",
                }}
                backgroundColor="rgba(247, 248, 250, 1)"
              />
            </div>
            <div className="flex space-x-2">
              <Button type="button" variant="outline" size="sm" onClick={clearSignature}>
                Clear
              </Button>
              <Button type="button" size="sm" onClick={saveSignature}>
                Save Signature
              </Button>
            </div>
          </div>
          
          {signature && (
            <div className="border rounded-lg p-4">
              <Label className="mb-2 block">Saved Signature</Label>
              <img src={signature} alt="Your signature" className="h-20 border rounded bg-white" />
            </div>
          )}
          
          <div className="flex space-x-4 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowRejectionForm(true)}
              className="flex-1"
            >
              Reject
            </Button>
            <Button
              type="button"
              disabled={!signature}
              onClick={handleApprove}
              className="flex-1"
            >
              Approve
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <Label htmlFor="rejectionReason">Reason for Rejection</Label>
            <Textarea
              id="rejectionReason"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Please provide a detailed reason for rejection"
              className="mt-1"
              rows={4}
            />
          </div>
          
          <div className="flex space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowRejectionForm(false)}
              className="flex-1"
            >
              Back
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleReject}
              disabled={!rejectionReason}
              className="flex-1"
            >
              Confirm Rejection
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApprovalActions;
