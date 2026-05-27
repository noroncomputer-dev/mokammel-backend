"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  fallback?: string;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
};

export const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, src, alt, fallback, size = "md", children, ...props }, ref) => {
    const [imgError, setImgError] = React.useState(false);

    return (
      <div
        ref={ref}
        className={cn(
          "relative flex shrink-0 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800",
          sizeClasses[size],
          className,
        )}
        {...props}
      >
        {src && !imgError ? (
          <img
            src={src}
            alt={alt || "avatar"}
            className="aspect-square h-full w-full object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center font-medium text-gray-600 dark:text-gray-300">
            {fallback || (children as string)?.charAt(0)?.toUpperCase() || "?"}
          </div>
        )}
      </div>
    );
  },
);

Avatar.displayName = "Avatar";

export const AvatarImage = ({ src, alt }: { src?: string; alt?: string }) =>
  null;
export const AvatarFallback = ({ children }: { children: React.ReactNode }) => (
  <>{children}</>
);
