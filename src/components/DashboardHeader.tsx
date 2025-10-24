import { Bell, Settings, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface DashboardHeaderProps {
  userName?: string;
  alertCount?: number;
}

export function DashboardHeader({ userName = "Owner", alertCount = 0 }: DashboardHeaderProps) {
  return (
    <header className="bg-white border-b border-border px-4 py-3">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">WickedFile</h1>
          <p className="text-sm text-muted-foreground">Executive Dashboard</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="relative">
            <Bell className="w-5 h-5" />
            {alertCount > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 w-5 h-5 text-xs p-0 flex items-center justify-center"
              >
                {alertCount > 9 ? "9+" : alertCount}
              </Badge>
            )}
          </Button>
          
          <Button variant="ghost" size="sm">
            <Settings className="w-5 h-5" />
          </Button>
          
          <div className="flex items-center gap-2 ml-2 pl-2 border-l border-border">
            <div className="w-8 h-8 bg-brand-primary rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-medium text-foreground">{userName}</span>
          </div>
        </div>
      </div>
    </header>
  );
}