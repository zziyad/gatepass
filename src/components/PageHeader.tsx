import { useIsMobile } from "@/hooks/use-mobile";
import React from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ 
  title, 
  description, 
  children 
}) => {
  const isMobile = useIsMobile();
  
  return (
    <div className={isMobile ? "mb-5" : "mb-8"}>
      <div className="flex justify-between items-center">
        <div>
          <h1 className={isMobile ? "text-xl font-bold" : "text-3xl font-bold"}>
            {title}
          </h1>
          {description && (
            <p className={isMobile ? "text-sm text-gray-500 mt-1" : "text-base text-gray-500 mt-2"}>
              {description}
            </p>
          )}
        </div>
        {children && (
          <div className="flex items-center space-x-2">
            {children}
          </div>
        )}
      </div>
    </div>
  );
};

export default PageHeader; 