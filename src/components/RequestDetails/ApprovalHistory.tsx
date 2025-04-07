// components/RequestDetails/ApprovalHistory.tsx
import { Approval } from "@/types";

interface ApprovalHistoryProps {
  approvals: Approval[];
}

const ApprovalHistory: React.FC<ApprovalHistoryProps> = ({ approvals }) => (
  <div className="mt-6">
    <h3 className="text-sm font-medium mb-2">Approval History</h3>
    <div className="space-y-2">
      {approvals.map((approval: Approval, index: number) => (
        <div key={approval.id} className="border p-2 rounded">
          <div className="flex justify-between">
            <span>
              {approval.level} - {approval.approval.toUpperCase()}
            </span>
            <span>{approval.signatureDate ? new Date(approval.signatureDate).toLocaleDateString() : ""}</span>
          </div>
          {approval.signature && (
            <div className="mt-2">
              <img src={approval.signature} alt={`Signature for ${approval.level}`} className="h-12" />
            </div>
          )}
        </div>
      ))}
    </div>
  </div>
);

export default ApprovalHistory;