
import { CheckCircle, Clock, XCircle } from "lucide-react";
import { RemovalRequest } from "@/types";

interface ApprovalFlowProps {
  request: RemovalRequest;
}

const ApprovalStages = ["HOD", "FINANCE", "MOD", "SECURITY"];

const ApprovalFlow: React.FC<ApprovalFlowProps> = ({ request }) => {
  // Determine status for each approval stage
  const stageStatus = ApprovalStages.map(stage => {
    const approval = request.approvals.find(a => a.stage === stage);
    
    if (!approval) {
      const currentStageIndex = ApprovalStages.indexOf(stage);
      const previousStageIndex = currentStageIndex - 1;
      
      // Check if previous stages are approved (to determine if this stage is pending)
      const isPending = previousStageIndex < 0 || request.approvals.some(a => 
        a.stage === ApprovalStages[previousStageIndex] && a.approved
      );
      
      // Determine if this is the current stage based on request status
      const isCurrent = request.status === `PENDING_${stage}`;
      
      return {
        stage,
        status: isCurrent ? "current" : isPending ? "pending" : "waiting",
      };
    }
    
    return {
      stage,
      status: approval.approved ? "approved" : "rejected",
      approval,
    };
  });

  return (
    <div className="p-4 bg-white rounded-lg shadow-sm border">
      <h3 className="text-lg font-medium mb-4">Approval Workflow</h3>
      
      <div className="flex items-center justify-between relative">
        {/* Line connecting all steps */}
        <div className="absolute top-4 left-6 right-6 h-0.5 bg-gray-200" />
        
        {/* Approval stages */}
        {stageStatus.map((status, index) => (
          <div key={status.stage} className="flex flex-col items-center relative z-10">
            {/* Stage icon */}
            <div className={`
              w-8 h-8 rounded-full flex items-center justify-center
              ${status.status === 'approved' ? 'bg-green-100 text-green-600' : ''}
              ${status.status === 'rejected' ? 'bg-red-100 text-red-600' : ''}
              ${status.status === 'current' ? 'bg-blue-100 text-blue-600' : ''}
              ${status.status === 'pending' ? 'bg-gray-100 text-gray-600' : ''}
              ${status.status === 'waiting' ? 'bg-gray-100 text-gray-400' : ''}
              border-2
              ${status.status === 'approved' ? 'border-green-500' : ''}
              ${status.status === 'rejected' ? 'border-red-500' : ''}
              ${status.status === 'current' ? 'border-blue-500' : ''}
              ${status.status === 'pending' ? 'border-gray-300' : ''}
              ${status.status === 'waiting' ? 'border-gray-200' : ''}
            `}>
              {status.status === 'approved' && <CheckCircle className="w-4 h-4" />}
              {status.status === 'rejected' && <XCircle className="w-4 h-4" />}
              {status.status === 'current' && <Clock className="w-4 h-4" />}
              {status.status === 'pending' && <span className="text-xs font-bold">{index + 1}</span>}
              {status.status === 'waiting' && <span className="text-xs font-bold">{index + 1}</span>}
            </div>
            
            {/* Stage name */}
            <div className="mt-2 text-sm font-medium">
              {status.stage}
            </div>
            
            {/* Stage status */}
            <div className={`
              text-xs mt-1
              ${status.status === 'approved' ? 'text-green-600' : ''}
              ${status.status === 'rejected' ? 'text-red-600' : ''}
              ${status.status === 'current' ? 'text-blue-600' : ''}
              ${status.status === 'pending' ? 'text-gray-600' : ''}
              ${status.status === 'waiting' ? 'text-gray-400' : ''}
            `}>
              {status.status === 'approved' && 'Approved'}
              {status.status === 'rejected' && 'Rejected'}
              {status.status === 'current' && 'Pending'}
              {status.status === 'pending' && 'Waiting'}
              {status.status === 'waiting' && '-'}
            </div>
            
            {/* Approval date if available */}
            {status.approval && (
              <div className="text-xs text-gray-500 mt-1">
                {status.approval.timestamp.toLocaleDateString()}
              </div>
            )}
          </div>
        ))}
      </div>
      
      {/* Final status */}
      {(request.status === 'APPROVED' || request.status === 'REJECTED') && (
        <div className={`
          mt-4 p-2 text-center text-sm font-medium rounded
          ${request.status === 'APPROVED' ? 'bg-green-50 text-green-700' : ''}
          ${request.status === 'REJECTED' ? 'bg-red-50 text-red-700' : ''}
        `}>
          {request.status === 'APPROVED' ? 'Final Approval Granted' : 'Request Rejected'}
          {request.approvals.find(a => !a.approved)?.rejectionReason && (
            <div className="text-xs mt-1">
              Reason: {request.approvals.find(a => !a.approved)?.rejectionReason}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ApprovalFlow;
