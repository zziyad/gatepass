import React from "react";
import { User } from "@/types";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getRoleDisplayName, getRoleBadgeColor } from "@/utils/roleUtils";

interface UserCardProps {
  user: User;
  className?: string;
  variant?: "default" | "compact" | "inline";
}

export function UserCard({ user, className = "", variant = "default" }: UserCardProps) {
  // Check if user exists before proceeding
  if (!user) return null;
  console.log({ CARD_USER: user });
  // Create initials for avatar fallback with safe access
  const fullName = user.fullName || (user.email ? user.email.split('@')[0] : "User");
  const initials = fullName
    .split(" ")
    .slice(0, 2)
    .map(name => name[0] || "")
    .join("")
    .toUpperCase();

  // Handle either department or departmentName property
  const departmentDisplay = user.departmentName || user.department || "Default Department";

  if (variant === "inline") {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Avatar className="h-6 w-6">
          <AvatarFallback className="bg-primary/10 text-primary text-xs">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <span className="text-sm font-medium leading-none">{fullName}</span>
          <span
            className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] leading-none font-medium mt-1 ${getRoleBadgeColor(
              user.role
            )}`}
          >
            {getRoleDisplayName(user.role)}
          </span>
        </div>
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <Card className={`overflow-hidden ${className}`}>
        <CardContent className="p-4 flex items-center space-x-4">
          <Avatar>
            <AvatarFallback className="bg-primary/10 text-primary">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium truncate">{fullName}</h3>
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            <span
              className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium mt-1 ${getRoleBadgeColor(
                user.role
              )}`}
            >
              {getRoleDisplayName(user.role)}
            </span>
            {user.position && (
              <p className="text-xs text-muted-foreground mt-1 truncate">{user.position}</p>
            )}
            <p className="text-xs text-muted-foreground truncate">{departmentDisplay}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`overflow-hidden ${className}`}>
      <CardHeader className="bg-gradient-to-r from-primary-50 to-primary-100 pb-2">
        <div className="flex items-center gap-4">
          <Avatar className="h-12 w-12 border-2 border-white">
            <AvatarFallback className="bg-primary/10 text-primary">
              {initials}
            </AvatarFallback>
          </Avatar>
          <CardTitle className="flex flex-col">
            <span className="text-xl font-bold truncate">{fullName}</span>
            <span className="text-sm font-normal text-muted-foreground">
              {user.email}
            </span>
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="grid grid-cols-[1fr_2fr] items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground">Department:</span>
            <span className="text-sm font-semibold">{departmentDisplay}</span>
          </div>

          {user.position && (
            <div className="grid grid-cols-[1fr_2fr] items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground">Position:</span>
              <span className="text-sm font-semibold">{user.position}</span>
            </div>
          )}

          <div className="grid grid-cols-[1fr_2fr] items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground">Role:</span>
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getRoleBadgeColor(
                user.role
              )}`}
            >
              {getRoleDisplayName(user.role)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 