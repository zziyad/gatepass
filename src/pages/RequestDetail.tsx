import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useApp } from "@/contexts/AppContext";
import AppLayout from "@/components/AppLayout";
import PageHeader from "@/components/PageHeader";
import RequestDetails from "@/components/RequestDetails";
import ApprovalActions from "@/components/ApprovalActions";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Printer } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

const RequestDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { getRequest, removalReasons } = useApp();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  const request = id ? getRequest(id) : undefined;
  
  useEffect(() => {
    if (!request && id) {
      // Request not found, redirect to dashboard
      navigate("/dashboard");
    }
  }, [request, id, navigate]);
  
  if (!request) {
    return null;
  }
  
  // Handle print
  const handlePrint = () => {
    window.print();
  };
  
  return (
    <AppLayout>
      <div className={isMobile ? "space-y-5 px-2 pb-6" : "space-y-8 max-w-7xl mx-auto pb-10 px-4"}>
        <div className="flex items-center mb-4">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate(-1)}
            className="flex items-center gap-1 mr-4"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </Button>
        </div>
        
        <PageHeader title="Request Details" description={`Request ID: ${id}`}>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handlePrint}
            className="flex items-center gap-1"
          >
            <Printer className="h-4 w-4" />
            <span>Print</span>
          </Button>
        </PageHeader>
        
        <RequestDetails request={request} removalReasons={removalReasons} />
        
        <ApprovalActions request={request} />
      </div>
    </AppLayout>
  );
};

export default RequestDetail;
