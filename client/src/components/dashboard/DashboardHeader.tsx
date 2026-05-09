"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface DashboardHeaderProps {
  title: string;
  description?: string;
  children?: ReactNode;
  className?: string;
}

export function DashboardHeader({
  title,
  description,
  children,
  className,
}: DashboardHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-10",
        className
      )}
    >
      <div className="space-y-1">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
          {title}
        </h1>
        {description && (
          <p className="text-lg text-muted-foreground font-medium">
            {description}
          </p>
        )}
      </div>
      <div className="flex items-center gap-3">{children}</div>
    </div>
  );
}
