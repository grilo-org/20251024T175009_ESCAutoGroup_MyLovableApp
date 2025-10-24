import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, TrendingUp, TrendingDown, AlertTriangle, Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string;
  subtitle: string;
  trend?: "up" | "down" | "neutral";
  status?: "critical" | "warning" | "success" | "info";
  onClick?: () => void;
  className?: string;
  urgentCount?: number;
  showInvestigateButton?: boolean;
}

export function MetricCard({
  title,
  value,
  subtitle,
  trend = "neutral",
  status = "info",
  onClick,
  className,
  urgentCount = 0,
  showInvestigateButton = false
}: MetricCardProps) {
  const statusStyles = {
    critical: "border-l-4 border-l-status-critical bg-gradient-to-r from-red-50 to-white",
    warning: "border-l-4 border-l-status-warning bg-gradient-to-r from-amber-50 to-white",
    success: "border-l-4 border-l-status-success bg-gradient-to-r from-green-50 to-white",
    info: "border-l-4 border-l-brand-primary bg-gradient-to-r from-blue-50 to-white"
  };

  const getTrendIcon = () => {
    if (trend === "up") return <TrendingUp className="w-4 h-4 text-status-critical" />;
    if (trend === "down") return <TrendingDown className="w-4 h-4 text-status-success" />;
    return null;
  };

  const getTrendColor = () => {
    if (trend === "up") return "text-status-critical";
    if (trend === "down") return "text-status-success";
    return "text-muted-foreground";
  };

  return (
    <Card 
      className={cn(
        "transition-all duration-300 hover:shadow-lg cursor-pointer transform hover:-translate-y-1",
        statusStyles[status],
        className
      )}
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {title}
            </CardTitle>
            {urgentCount > 0 && (
              <Badge variant="destructive" className="px-1.5 py-0.5 text-xs">
                <AlertTriangle className="w-3 h-3 mr-1" />
                {urgentCount}
              </Badge>
            )}
          </div>
          {onClick && <ArrowUpRight className="w-4 h-4 text-muted-foreground" />}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-2xl font-bold text-foreground">{value}</span>
          {getTrendIcon()}
        </div>
        <p className={cn("text-sm mb-3", getTrendColor())}>
          {subtitle}
        </p>
        {showInvestigateButton && (
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full"
            onClick={(e) => {
              e.stopPropagation();
              onClick?.();
            }}
          >
            <Search className="w-4 h-4 mr-2" />
            Investigate Now
          </Button>
        )}
      </CardContent>
    </Card>
  );
}