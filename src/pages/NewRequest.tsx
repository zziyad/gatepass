import AppLayout from "@/components/AppLayout";
import RemovalRequestForm from "@/components/RemovalRequestForm";
import PageHeader from "@/components/PageHeader";
import { useIsMobile } from "@/hooks/use-mobile";

const NewRequest = () => {
  const isMobile = useIsMobile();
  
  return (
    <AppLayout>
      <div className={isMobile ? "space-y-4 px-2 pb-6" : "space-y-6 max-w-4xl mx-auto pb-10"}>
        <PageHeader
          title="New Removal Request"
          description="Fill out the form below to submit a new item removal request."
        />
        <RemovalRequestForm />
      </div>
    </AppLayout>
  );
};

export default NewRequest;
