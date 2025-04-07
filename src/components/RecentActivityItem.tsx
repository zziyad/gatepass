import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";

interface RecentActivityItemProps {
  id: string | number;
  status: string;
  dateFrom: string | Date;
  dateTo?: string | Date;
  employee?: string;
  department?: string;
  createdAt: string | Date;
  items?: { description: string }[];
  itemDescription?: string;
  removalTerms?: string;
  onView?: () => void;
}

const RecentActivityItem: React.FC<RecentActivityItemProps> = ({
  id,
  status,
  dateFrom,
  dateTo,
  employee,
  department,
  createdAt,
  items,
  itemDescription,
  removalTerms,
  onView
}) => {
  const getStatusColor = (status: string) => {
    const upperStatus = status.toUpperCase();
    if (upperStatus === "APPROVED") return "bg-green-100 text-green-800";
    if (upperStatus === "REJECTED") return "bg-red-100 text-red-800";
    if (upperStatus.includes("PENDING")) return "bg-yellow-100 text-yellow-800";
    return "bg-gray-100 text-gray-800";
  };

  const formatStatus = (status: string) => {
    return status
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const getItemsDescription = () => {
    if (items && items.length > 0) {
      return items.map(item => item.description).join(", ");
    }
    return itemDescription || "No items specified";
  };

  return (
    <div className="flex items-start gap-4 p-4 border rounded-lg bg-white hover:bg-gray-50">
      <div className="flex-grow space-y-2">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={getStatusColor(status)}>
            {formatStatus(status)}
          </Badge>
          <span className="text-sm text-gray-500">
            {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
          </span>
        </div>
        
        <div>
          <h4 className="font-medium">Request #{id}</h4>
          <p className="text-sm text-gray-600">{getItemsDescription()}</p>
        </div>
        
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
          <div className="flex items-center gap-1 text-gray-600">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span>{employee || "No employee"}</span>
          </div>
          
          {department && (
            <div className="flex items-center gap-1 text-gray-600">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <span>{department}</span>
            </div>
          )}
          
          <div className="flex items-center gap-1 text-gray-600">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>
              {removalTerms === "returnable" ? (
                <>
                  {new Date(dateFrom).toLocaleDateString()} - {dateTo ? new Date(dateTo).toLocaleDateString() : "No end date"}
                </>
              ) : (
                <>From {new Date(dateFrom).toLocaleDateString()}</>
              )}
            </span>
          </div>
        </div>
      </div>

      <Button
        variant="ghost"
        size="sm"
        onClick={onView}
        className="shrink-0"
      >
        View Details
      </Button>
    </div>
  );
};

export default RecentActivityItem; 