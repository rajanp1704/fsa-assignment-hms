"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number | undefined;
  icon: React.ElementType; // Changed from LucideIcon
  description?: string;
  loading?: boolean;
  className?: string;
  iconClassName?: string;
  iconColor?: string; // Added
  iconBgColor?: string; // Added based on usage in the provided diff
}

export function StatCard({
  title,
  value,
  icon: Icon,
  description,
  loading,
  className,
  iconClassName,
  iconColor, // Added
  iconBgColor, // Added
}: StatCardProps) {
  if (loading) {
    return (
      <Card
        className={cn(
          "overflow-hidden backdrop-blur-md bg-white/50 border-white/20",
          className
        )}
      >
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-4 rounded-full" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-16 mb-1" />
          <Skeleton className="h-3 w-32" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className={cn(
        "overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 backdrop-blur-md bg-secondary border-white/20",
        className
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          {title}
        </CardTitle>
        <div
          className={cn(
            "p-2 rounded-xl transition-colors",
            iconClassName,
            iconBgColor || "bg-primary/10",
            iconColor || "text-primary"
          )}
        >
          <Icon className="h-5 w-5" />{" "}
          {/* Changed icon size from h-4 w-4 to h-5 w-5 */}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold tracking-tight">
          {value !== undefined ? value : 0}
        </div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
            {description}
          </p>
        )}
      </CardContent>
      <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
        <Icon className="h-24 w-24" />
      </div>
    </Card>
  );
}
