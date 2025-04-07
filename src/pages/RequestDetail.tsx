import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import PageHeader from "@/components/PageHeader";
import RequestDetails from "@/components/RequestDetails/RequestDetails";
import ApprovalActions from "@/components/ApprovalActions";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Printer, Loader2 } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useRequests, useConfig } from "@/contexts";
import { getRemovalRequestById } from "@/api/removalService";
import { Removal, RemovalTerm } from "@/types";
import { toast } from "@/hooks/use-toast";

const RequestDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { getRequest } = useRequests();
  const { removalReasons } = useConfig();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  // Add loading and error states
  const [isLoading, setIsLoading] = useState(false);
  const [apiRequest, setApiRequest] = useState<Removal | null>(null);
  
  // First try to get the request from context
  const contextRequest = id ? getRequest(Number(id)) : undefined;
  
  // If not in context, fetch from API
  useEffect(() => {
    const fetchRequestFromApi = async () => {
      if (!id || contextRequest) return;
      
      setIsLoading(true);
      try {
        const response = await getRemovalRequestById(Number(id));
        if (response.result?.status === 'success' && response.result.response) {
          const apiData = response.result.response.removal;
          
          // Transform the API response to match the new Removal type
          const transformedRequest: Removal = {
            id: Number(apiData.id),
            userId: Number(apiData.userId),
            user: {
              id: Number(apiData.userId),
              fullName: apiData.fullName || "Unknown User",
              email: apiData.email || "",
              position: apiData.position || "",
              role: apiData.role,
              departmentId: Number(apiData.departmentId || 0)
            },
            departmentId: Number(apiData.departmentId || 0),
            department: apiData.department ? {
              id: Number(apiData.department.id),
              name: apiData.department.name
            } : undefined,
            removalTerms: (apiData.removalTerms?.toUpperCase() === "RETURNABLE" ? "RETURNABLE" : "NON_RETURNABLE") as RemovalTerm,
            dateFrom: new Date(apiData.dateFrom),
            dateTo: apiData.dateTo ? new Date(apiData.dateTo) : undefined,
            employee: apiData.employee || "",
            items: Array.isArray(apiData.items) ? apiData.items.map((item: any) => ({
              id: Number(item.id || 0),
              removalId: Number(apiData.id),
              description: item.description || "",
              removalReasonId: Number(item.removalReasonId || 0),
              removalReason: item.removalReason ? {
                id: Number(item.removalReason.id),
                name: item.removalReason.name
              } : undefined,
              customReason: item.customReason
            })) : [],
            images: Array.isArray(apiData.images) ? apiData.images.map((img: any) => ({
              id: Number(img.id || 0),
              removalId: Number(apiData.id),
              url: img.url
            })) : [],
            status: apiData.status,
            approvals: Array.isArray(apiData.approvals) ? apiData.approvals.map((approval: any, index: number) => ({
              id: Number(approval.id || index + 1),
              removalId: Number(apiData.id),
              level: approval.level || "LEVEL_2",
              approverId: Number(approval.approverId || 0),
              approval: approval.approval || "PENDING",
              signature: approval.signature,
              signatureDate: approval.signatureDate ? new Date(approval.signatureDate) : undefined
            })) : [],
            createdAt: new Date(apiData.createdAt),
            updatedAt: new Date(apiData.updatedAt || apiData.createdAt)
          };
          
          setApiRequest(transformedRequest);
        } else {
          throw new Error(response.result?.error || "Failed to fetch request details");
        }
      } catch (error) {
        console.error("Error fetching request:", error);
        toast({
          title: "Error",
          description: "Could not load the request details. Please try again.",
          variant: "destructive"
        });
        navigate("/removals");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchRequestFromApi();
  }, [id, contextRequest, navigate]);
  
  // Use API data if context data is not available
  const request = contextRequest || apiRequest;
  
  // If still loading or request not found
  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center h-[60vh]">
          <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
          <p className="text-lg">Loading request details...</p>
        </div>
      </AppLayout>
    );
  }
  
  if (!request && !isLoading) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center h-[60vh]">
          <p className="text-lg mb-4">Request not found</p>
          <Button onClick={() => navigate("/removals")}>Back to Removals</Button>
        </div>
      </AppLayout>
    );
  }
  
  return (
    <AppLayout>
      <div className={isMobile ? "space-y-5 px-2 pb-6" : "space-y-8 max-w-7xl mx-auto pb-10 px-4"}>
        <div className="flex items-center mb-4">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate("/removals")}
            className="flex items-center gap-1 mr-4"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Removals</span>
          </Button>
        </div>
        
        <PageHeader title="Request Details" description={`Request ID: ${request?.id}`}>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => window.print()}
            className="flex items-center gap-1"
          >
            <Printer className="h-4 w-4" />
            <span>Print</span>
          </Button>
        </PageHeader>
        
        {request && (
          <>
            <RequestDetails request={request} removalReasons={removalReasons} />
            <ApprovalActions request={request} />
          </>
        )}
      </div>
    </AppLayout>
  );
};

export default RequestDetail;
