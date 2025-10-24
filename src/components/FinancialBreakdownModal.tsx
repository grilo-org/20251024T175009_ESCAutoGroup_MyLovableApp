import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, DollarSign, TrendingUp, Target, FileText, Package, RotateCcw, Truck, Info } from "lucide-react";

interface BreakdownCategory {
  name: string;
  amount: number;
  count: number;
  items: any[];
  description: string;
  icon: React.ReactNode;
  severity: "critical" | "warning" | "info";
}

interface FinancialBreakdownModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: "at-risk-now" | "monthly-risk" | "recovery-potential";
  breakdown: {
    categories: BreakdownCategory[];
    total: number;
    explanation: string;
  };
  onCategoryClick: (categoryType: "invoices" | "parts" | "returns" | "cores" | "shipping" | "sales-tax") => void;
}

export function FinancialBreakdownModal({ 
  isOpen, 
  onClose, 
  type, 
  breakdown, 
  onCategoryClick 
}: FinancialBreakdownModalProps) {
  const getModalConfig = () => {
    switch (type) {
      case "at-risk-now":
        return {
          title: "At Risk Now - Current Exposure",
          icon: <AlertTriangle className="w-6 h-6 text-status-critical" />,
          description: "Money tied up in unresolved issues from the past 30 days. This is what you could lose RIGHT NOW if these problems aren't addressed.",
          color: "from-status-critical to-red-500",
          timeline: "📅 Current issues (past 30 days)"
        };
      case "monthly-risk":
        return {
          title: "Trending 30 Day Future Risk - Projection", 
          icon: <TrendingUp className="w-6 h-6 text-status-warning" />,
          description: "Projected total exposure if current issues remain unresolved AND new issues continue accumulating at the current rate over the next 30 days.",
          color: "from-status-warning to-amber-500",
          timeline: "📈 Next 30 days (existing + projected new issues)"
        };
      case "recovery-potential":
        return {
          title: "Recovery Potential - 7-Day Window",
          icon: <Target className="w-6 h-6 text-status-success" />,
          description: "Realistic amount you can recover if you resolve current issues within the next 7 days. After that, recovery rates drop significantly.",
          color: "from-status-success to-green-500", 
          timeline: "⚡ Must act within 7 days for full recovery"
        };
      default:
        return {
          title: "Financial Breakdown",
          icon: <DollarSign className="w-6 h-6" />,
          description: "",
          color: "from-brand-primary to-brand-secondary",
          timeline: ""
        };
    }
  };

  const config = getModalConfig();

  const getSeverityBadge = (severity: "critical" | "warning" | "info") => {
    const styles = {
      critical: "bg-status-critical text-white",
      warning: "bg-status-warning text-white",
      info: "bg-status-info text-white"
    };
    
    return (
      <Badge className={styles[severity]}>
        {severity === "critical" ? "Urgent" : severity === "warning" ? "Attention" : "Monitor"}
      </Badge>
    );
  };

  const getCategoryClickHandler = (categoryName: string) => {
    const categoryMap: { [key: string]: "invoices" | "parts" | "returns" | "cores" | "shipping" | "sales-tax" } = {
      "Unscanned Invoices": "invoices",
      "Unmatched Parts": "parts", 
      "Pending Returns": "returns",
      "Unreturned Cores": "cores",
      "Shipping Not Charged": "shipping",
      "Charged Sales Tax": "sales-tax"
    };
    
    return categoryMap[categoryName];
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg mx-auto max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            {config.icon}
            <div>
              <div>{config.title}</div>
              <div className="text-sm font-normal text-muted-foreground mt-1">
                ${breakdown.total.toLocaleString()}
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>
        
        {/* Explanation Card */}
        <Card className={`bg-gradient-to-r ${config.color} text-white mb-4`}>
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium mb-1">What this means:</p>
                <p className="text-sm opacity-90 mb-2">{config.description}</p>
                <p className="text-xs opacity-75 bg-white/10 rounded px-2 py-1 inline-block">
                  {config.timeline}
                </p>
                {type === "monthly-risk" && (
                  <p className="text-xs opacity-75 mt-2">
                    💡 Why higher than "At Risk Now": Includes current issues PLUS estimated new issues that will accumulate if patterns continue
                  </p>
                )}
                {type === "recovery-potential" && (
                  <p className="text-xs opacity-75 mt-2">
                    💡 Why lower than "At Risk Now": 15% typically becomes unrecoverable after 7+ days
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Breakdown by Category */}
        <div className="space-y-3">
          <h4 className="font-semibold text-sm text-foreground">Contributing Issues:</h4>
          
          {breakdown.categories
            .sort((a, b) => b.amount - a.amount) // Sort by highest impact
            .map((category, index) => (
            <Card 
              key={index}
              className="cursor-pointer hover:bg-accent transition-colors border-l-4 border-l-border hover:border-l-brand-primary"
              onClick={() => {
                const categoryType = getCategoryClickHandler(category.name);
                if (categoryType) {
                  onClose();
                  onCategoryClick(categoryType);
                }
              }}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {category.icon}
                    <h5 className="font-medium text-sm">{category.name}</h5>
                  </div>
                  {getSeverityBadge(category.severity)}
                </div>
                
                <div className="flex items-center justify-between mb-2">
                  <span className="text-lg font-bold text-foreground">
                    ${category.amount.toLocaleString()}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {category.count} {category.count === 1 ? 'issue' : 'issues'}
                  </span>
                </div>
                
                <p className="text-xs text-muted-foreground">{category.description}</p>
                
                {/* Percentage of Total */}
                <div className="mt-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Impact on total:</span>
                    <span className="font-medium">
                      {((category.amount / breakdown.total) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-1.5 mt-1">
                    <div 
                      className="bg-brand-primary h-1.5 rounded-full transition-all duration-500"
                      style={{ width: `${(category.amount / breakdown.total) * 100}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Action Footer */}
        <Card className="bg-gradient-to-r from-blue-50 to-white border-l-4 border-l-brand-primary mt-4">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 mb-1">
              <Target className="w-4 h-4 text-brand-primary" />
              <span className="text-sm font-medium">Quick Action</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Click any category above to see the specific issues and take immediate action.
            </p>
          </CardContent>
        </Card>

        <div className="flex gap-2 mt-4">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}