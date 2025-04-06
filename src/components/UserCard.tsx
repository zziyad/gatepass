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
      <div className={`flex items-center gap-3 ${className}`}>
        <Avatar className="h-8 w-8">
          <AvatarFallback className="bg-primary/10 text-primary text-xs">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col justify-center">
          <span className="text-sm font-semibold leading-tight text-foreground">{fullName}</span>
          <span className="text-xs text-muted-foreground">{user.email}</span>
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
        <CardContent className="p-4">
          <div className="flex items-center gap-4 mb-3">
            <Avatar className="h-10 w-10 flex-shrink-0">
              <AvatarFallback className="bg-primary/10 text-primary text-xs">
                {initials}
              </AvatarFallback>
            </Avatar>
            <h3 className="text-base font-semibold text-primary">{fullName}</h3>
          </div>
          
          <p className="text-xs text-primary mb-3">{user.email}</p>
          
          <div className="space-y-1.5">
            <p className="text-xs">
              <span className="text-muted-foreground">Department: </span>
              <span className="font-medium">{departmentDisplay}</span>
            </p>
            
            {user.position && (
              <p className="text-xs">
                <span className="text-muted-foreground">Position: </span>
                <span className="font-medium">{user.position}</span>
              </p>
            )}
            
            <p className="text-xs">
              <span className="text-muted-foreground">Role: </span>
              <span className={`inline-flex items-center font-medium ${getRoleBadgeColor(user.role)}`}>
                {getRoleDisplayName(user.role)}
              </span>
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`overflow-hidden ${className}`}>
      <CardContent className="p-5">
        <div className="flex items-center gap-4 mb-3">
          <Avatar className="h-14 w-14 border-2 border-primary/10">
            <AvatarFallback className="bg-primary/10 text-primary">
              {initials}
            </AvatarFallback>
          </Avatar>
          <h2 className="text-lg font-bold text-primary">{fullName}</h2>
        </div>
        
        <p className="text-sm text-primary/80 mb-4">{user.email}</p>
        
        <div className="space-y-2">
          <div className="flex flex-col">
            <span className="text-sm font-medium text-muted-foreground">Department:</span>
            <span className="text-sm font-semibold">{departmentDisplay}</span>
          </div>

          {user.position && (
            <div className="flex flex-col">
              <span className="text-sm font-medium text-muted-foreground">Position:</span>
              <span className="text-sm font-semibold">{user.position}</span>
            </div>
          )}

          <div className="flex flex-col">
            <span className="text-sm font-medium text-muted-foreground">Role:</span>
            <span
              className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium mt-1 ${getRoleBadgeColor(
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