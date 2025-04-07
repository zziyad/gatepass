// utils/removalUtils.ts
import { Removal, RemovalReason, RemovalStatus, RemovalTerm } from "@/types";

export const formatStatus = (status?: RemovalStatus): string => {
  if (!status) return "Unknown";
  return status
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (l) => l.toUpperCase());
};

export const getStatusColor = (status?: RemovalStatus): string => {
  if (!status) return "bg-gray-100 text-gray-800 border-gray-200";
  const upperStatus = status.toUpperCase();
  if (upperStatus === "APPROVED") return "bg-green-100 text-green-800 border-green-200";
  if (upperStatus === "REJECTED") return "bg-red-100 text-red-800 border-red-200";
  if (upperStatus.startsWith("PENDING") || upperStatus === "PENDING") return "bg-yellow-100 text-yellow-800 border-yellow-200";
  return "bg-gray-100 text-gray-800 border-gray-200";
};

export const getRemovalReasonName = (reasonId: string | number, removalReasons: RemovalReason[]): string => {
  const reason = removalReasons?.find((r) => r?.id === Number(reasonId));
  return reason?.name || "Unknown";
};

export const isReasonOther = (reasonId?: string | number, reasonName?: string, removalReasons: RemovalReason[] = []): boolean => {
  if (reasonName) {
    return reasonName.toUpperCase() === "OTHER";
  }
  if (reasonId) {
    const reason = removalReasons?.find((r) => r?.id === Number(reasonId));
    return reason?.name?.toUpperCase() === "OTHER";
  }
  return false;
};

export const isReturnable = (request: Removal): boolean => {
  if (!request) return false;
  return request.removalTerms === "RETURNABLE";
};