import { Activity } from "@/types"; 

export const getStatusColor = (status: string) => {
  const upperStatus = status.toUpperCase();
  if (upperStatus === "APPROVED") return "bg-green-100 text-green-800";
  if (upperStatus === "REJECTED") return "bg-red-100 text-red-800";
  return "bg-yellow-100 text-yellow-800";
};

export const formatStatus = (status: string) => {
  return status
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (l) => l.toUpperCase());
};

export const getItemsDescription = (activity: Activity) => {
  console.log({ activity });
  if (activity.items && activity.items.length > 0) {
    const descriptions = activity.items.map((item) => item.description);
    if (descriptions.length === 1) return descriptions[0];
    return `${descriptions[0]} +${descriptions.length - 1} more`;
  }
  return activity.description || "No description";
};