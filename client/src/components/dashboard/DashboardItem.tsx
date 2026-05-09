"use client";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface DashboardItemProps {
  title: string;
  subtitle: string;
  icon: React.ElementType;
  iconBgColor?: string;
  iconColor?: string;
  status?: string;
  statusVariant?: "default" | "secondary" | "destructive" | "outline";
  action?: React.ReactNode;
  className?: string;
  onClick?: () => void;
  token?: string | number;
}

export function DashboardItem({
  title,
  subtitle,
  icon: Icon,
  iconBgColor,
  iconColor,
  status,
  statusVariant = "secondary",
  action,
  className,
  onClick,
  token,
}: DashboardItemProps) {
  return (
    <div
      className={cn(
        "group flex items-center gap-4 p-5 rounded-2xl border border-transparent transition-all duration-300 hover:bg-secondary/80 hover:cursor-pointer hover:border-white/50 hover:shadow-md",
        onClick && "cursor-pointer",
        className
      )}
      onClick={onClick}
    >
      <div className="flex items-center gap-4 flex-1">
        <div
          className={cn(
            "p-3 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 min-w-[52px] h-[52px]",
            iconBgColor || "bg-primary/10",
            iconColor || "text-primary"
          )}
        >
          {token ? (
            <span className="text-sm font-black tracking-tighter">{token}</span>
          ) : (
            <Icon className="h-6 w-6" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3">
            <p className="font-bold text-lg text-foreground truncate group-hover:text-primary transition-colors">
              {title}
            </p>
            {status && (
              <Badge
                variant={statusVariant}
                className="rounded-full px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider"
              >
                {status}
              </Badge>
            )}
          </div>
          {subtitle && (
            <p className="text-sm text-muted-foreground font-medium truncate mt-0.5">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {action && (
        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
          {action}
        </div>
      )}
    </div>
  );
}
