import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { DashboardHeader } from "@/components/DashboardHeader";
import { MetricCard } from "@/components/MetricCard";
import { DetailModal } from "@/components/DetailModal";
import { HistoricalPerformanceTab } from "@/components/HistoricalPerformanceTab";
import { FinancialBreakdownModal } from "@/components/FinancialBreakdownModal";
import { AgingWIPTab } from "@/components/AgingWIPTab";
import { WinsSection } from "@/components/WinsSection";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RefreshCw, TrendingUp, AlertTriangle, DollarSign, Target, FileText, Package, RotateCcw, Truck, Receipt, Trophy, CheckCircle, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Mock data - in real app this would come from your API
const mockData = {
  locations: [
    { id: "loc1", name: "Downtown Location", manager: "Sarah Johnson", phone: "(555) 123-4567", email: "sarah.j@wickedfile.com" },
    { id: "loc2", name: "Northside Shop", manager: "Mike Chen", phone: "(555) 234-5678", email: "mike.c@wickedfile.com" },
    { id: "loc3", name: "West End Auto", manager: "David Rodriguez", phone: "(555) 345-6789", email: "david.r@wickedfile.com" },
    { id: "loc4", name: "South Bay Service", manager: "Lisa Thompson", phone: "(555) 456-7890", email: "lisa.t@wickedfile.com" }
  ],
  unscannedInvoices: [
    { id: "1", title: "AutoZone Invoice #AZ-2024-001", amount: 2450, date: "Jan 15", status: "critical" as const, description: "Parts order from 3 days ago, no scan record", locationId: "loc2" },
    { id: "2", title: "NAPA Invoice #NP-5678", amount: 1200, date: "Jan 14", status: "warning" as const, description: "Overdue scan by 2 days", locationId: "loc2" },
    { id: "3", title: "O'Reilly Parts #OR-9012", amount: 890, date: "Jan 13", status: "critical" as const, description: "High-value parts order unprocessed", locationId: "loc1" },
    { id: "9", title: "Advance Auto #AA-1234", amount: 1500, date: "Jan 12", status: "critical" as const, description: "Major parts order unscanned", locationId: "loc3" },
    { id: "10", title: "CarQuest #CQ-5678", amount: 750, date: "Jan 11", status: "warning" as const, description: "Pending scan for 2 days", locationId: "loc4" }
  ],
  unmatchedParts: [
    { id: "4", title: "Brake Pads Set - Customer RO#4567", amount: 340, date: "Jan 15", status: "warning" as const, description: "Part purchased but not on customer invoice", locationId: "loc1" },
    { id: "5", title: "Oil Filter - RO#4568", amount: 45, date: "Jan 14", status: "info" as const, description: "Small discrepancy in part charging", locationId: "loc3" },
    { id: "6", title: "Transmission Fluid - RO#4569", amount: 180, date: "Jan 13", status: "warning" as const, description: "Quantity mismatch between purchase and charge", locationId: "loc2" },
    { id: "11", title: "Air Filter - RO#4570", amount: 120, date: "Jan 12", status: "warning" as const, description: "Part not reflected on customer RO", locationId: "loc4" }
  ],
  pendingReturns: [
    { id: "7", title: "Return Auth #RA-001 - Wrong Part", amount: 780, date: "Jan 12", status: "critical" as const, description: "Return authorized 4 days ago, no credit processed", locationId: "loc1" },
    { id: "8", title: "Return Auth #RA-002 - Excess Inventory", amount: 250, date: "Jan 10", status: "warning" as const, description: "Customer credit pending for unused parts", locationId: "loc3" },
    { id: "12", title: "Return Auth #RA-003 - Defective Part", amount: 420, date: "Jan 9", status: "critical" as const, description: "Warranty return not processed", locationId: "loc2" }
  ],
  unreturnedCores: [
    { id: "13", title: "Alternator Core - RO#4571", amount: 125, date: "Jan 15", status: "warning" as const, description: "Core deposit not returned after 5 days", locationId: "loc1" },
    { id: "14", title: "Brake Caliper Core - RO#4572", amount: 75, date: "Jan 14", status: "critical" as const, description: "Core overdue by 7 days", locationId: "loc2" },
    { id: "15", title: "Starter Core - RO#4573", amount: 90, date: "Jan 13", status: "warning" as const, description: "Customer has not returned core", locationId: "loc3" },
    { id: "16", title: "Battery Core - RO#4574", amount: 15, date: "Jan 12", status: "info" as const, description: "Core return reminder needed", locationId: "loc4" }
  ],
  shippingNotCharged: [
    { id: "17", title: "Parts Delivery - RO#4575", amount: 25, date: "Jan 15", status: "warning" as const, description: "Express shipping not charged to customer", locationId: "loc2" },
    { id: "18", title: "Rush Order Fee - RO#4576", amount: 45, date: "Jan 14", status: "critical" as const, description: "Overnight shipping cost not passed through", locationId: "loc1" },
    { id: "19", title: "Special Delivery - RO#4577", amount: 35, date: "Jan 13", status: "warning" as const, description: "Saturday delivery fee missed", locationId: "loc3" },
    { id: "20", title: "Freight Charge - RO#4578", amount: 85, date: "Jan 12", status: "critical" as const, description: "Heavy item shipping not billed", locationId: "loc4" },
    { id: "21", title: "Emergency Parts - RO#4579", amount: 55, date: "Jan 11", status: "warning" as const, description: "Same-day delivery not charged", locationId: "loc2" }
  ],
  chargedSalesTax: [
    { id: "22", title: "Sales Tax - RO#4580", amount: 180, date: "Jan 15", status: "warning" as const, description: "Tax charged but not remitted to state", locationId: "loc1" },
    { id: "23", title: "Sales Tax - RO#4581", amount: 245, date: "Jan 14", status: "critical" as const, description: "Overdue tax remittance - 30 days", locationId: "loc2" },
    { id: "24", title: "Sales Tax - RO#4582", amount: 95, date: "Jan 13", status: "warning" as const, description: "Tax collected, pending remittance", locationId: "loc3" },
    { id: "25", title: "Sales Tax - RO#4583", amount: 320, date: "Jan 12", status: "critical" as const, description: "Quarterly tax payment due", locationId: "loc4" },
    { id: "26", title: "Sales Tax - RO#4584", amount: 155, date: "Jan 11", status: "info" as const, description: "Tax collected, 15 days to remit", locationId: "loc2" }
  ],
  thisWeekWins: {
    totalValue: 3420,
    count: 12,
    categories: [
      { name: "Invoices Scanned", count: 4, value: 1850, icon: <FileText className="w-4 h-4" /> },
      { name: "Parts Added to ROs", count: 3, value: 680, icon: <Package className="w-4 h-4" /> },
      { name: "Returns Processed", count: 2, value: 450, icon: <RotateCcw className="w-4 h-4" /> },
      { name: "Cores Collected", count: 2, value: 290, icon: <RotateCcw className="w-4 h-4" /> },
      { name: "Shipping Charged", count: 1, value: 150, icon: <Truck className="w-4 h-4" /> }
    ]
  },
  thisMonthWins: {
    totalValue: 14650,
    count: 38,
    categories: [
      { name: "Invoices Scanned", count: 15, value: 6240, icon: <FileText className="w-4 h-4" /> },
      { name: "Parts Added to ROs", count: 8, value: 3150, icon: <Package className="w-4 h-4" /> },
      { name: "Returns Processed", count: 6, value: 2840, icon: <RotateCcw className="w-4 h-4" /> },
      { name: "Cores Collected", count: 5, value: 1450, icon: <RotateCcw className="w-4 h-4" /> },
      { name: "Shipping Charged", count: 3, value: 620, icon: <Truck className="w-4 h-4" /> },
      { name: "Sales Tax Fixed", count: 1, value: 350, icon: <Receipt className="w-4 h-4" /> }
    ]
  }
};

export default function Dashboard() {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedModal, setSelectedModal] = useState<{
    type: "invoices" | "parts" | "returns" | "cores" | "shipping";
    title: string;
    items: any[];
    locations: any[];
  } | null>(null);
  
  const [financialBreakdownModal, setFinancialBreakdownModal] = useState<{
    isOpen: boolean;
    type: "at-risk-now" | "monthly-risk" | "recovery-potential";
    breakdown: {
      categories: {
        name: string;
        amount: number;
        count: number;
        items: any[];
        description: string;
        icon: React.ReactNode;
        severity: "critical" | "warning" | "info";
      }[];
      total: number;
      explanation: string;
    };
  }>({
    isOpen: false,
    type: "at-risk-now",
    breakdown: { categories: [], total: 0, explanation: "" }
  });

  // Set active tab based on URL parameter
  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam === "historical") {
      setActiveTab("historical");
    }
  }, [searchParams]);

  const closeModal = () => setSelectedModal(null);
  
  const closeFinancialModal = () => setFinancialBreakdownModal(prev => ({ ...prev, isOpen: false }));

  const totalAtRisk = mockData.unscannedInvoices.reduce((sum, item) => sum + item.amount, 0) +
                    mockData.unmatchedParts.reduce((sum, item) => sum + item.amount, 0) +
                    mockData.pendingReturns.reduce((sum, item) => sum + item.amount, 0) +
                    mockData.unreturnedCores.reduce((sum, item) => sum + item.amount, 0) +
                    mockData.shippingNotCharged.reduce((sum, item) => sum + item.amount, 0);

  // Calculate theft prevention metrics (excluding sales tax which is separate)
  const monthlyTheftEstimate = totalAtRisk * 1.8; // Estimated monthly exposure
  const potentialRecovery = (mockData.unmatchedParts.reduce((sum, item) => sum + item.amount, 0) +
                           mockData.pendingReturns.reduce((sum, item) => sum + item.amount, 0) +
                           mockData.unreturnedCores.reduce((sum, item) => sum + item.amount, 0) +
                           mockData.shippingNotCharged.reduce((sum, item) => sum + item.amount, 0) +
                           mockData.chargedSalesTax.reduce((sum, item) => sum + item.amount, 0)) * 0.85; // Realistic recovery if fixed
  const criticalIssues = mockData.unscannedInvoices.filter(item => item.status === "critical").length +
                        mockData.pendingReturns.filter(item => item.status === "critical").length +
                        mockData.shippingNotCharged.filter(item => item.status === "critical").length;

  // Helper function to create financial breakdown data
  const createBreakdownData = (type: "at-risk-now" | "monthly-risk" | "recovery-potential") => {
    const baseCategories = [
      {
        name: "Unscanned Invoices",
        amount: mockData.unscannedInvoices.reduce((sum, item) => sum + item.amount, 0),
        count: mockData.unscannedInvoices.length,
        items: mockData.unscannedInvoices,
        description: "Vendor invoices not yet processed - highest theft risk",
        icon: <FileText className="w-4 h-4" />,
        severity: "critical" as const
      },
      {
        name: "Unmatched Parts",
        amount: mockData.unmatchedParts.reduce((sum, item) => sum + item.amount, 0),
        count: mockData.unmatchedParts.length,
        items: mockData.unmatchedParts,
        description: "Parts purchased but not charged to customers",
        icon: <Package className="w-4 h-4" />,
        severity: "warning" as const
      },
      {
        name: "Pending Returns",
        amount: mockData.pendingReturns.reduce((sum, item) => sum + item.amount, 0),
        count: mockData.pendingReturns.length,
        items: mockData.pendingReturns,
        description: "Returns authorized but credits not processed",
        icon: <RotateCcw className="w-4 h-4" />,
        severity: "warning" as const
      },
      {
        name: "Unreturned Cores",
        amount: mockData.unreturnedCores.reduce((sum, item) => sum + item.amount, 0),
        count: mockData.unreturnedCores.length,
        items: mockData.unreturnedCores,
        description: "Core deposits not returned to customers",
        icon: <RotateCcw className="w-4 h-4" />,
        severity: "info" as const
      },
      {
        name: "Shipping Not Charged",
        amount: mockData.shippingNotCharged.reduce((sum, item) => sum + item.amount, 0),
        count: mockData.shippingNotCharged.length,
        items: mockData.shippingNotCharged,
        description: "Delivery fees not passed to customers",
        icon: <Truck className="w-4 h-4" />,
        severity: "critical" as const
      }
    ].filter(category => category.amount > 0);

    // For recovery potential, exclude unscanned invoices (already covered in At Risk Now)
    // and add sales tax which refreshes every 30 days
    const recoveryCategories = [
      {
        name: "Unmatched Parts",
        amount: mockData.unmatchedParts.reduce((sum, item) => sum + item.amount, 0),
        count: mockData.unmatchedParts.length,
        items: mockData.unmatchedParts,
        description: "Parts purchased but not charged to customers",
        icon: <Package className="w-4 h-4" />,
        severity: "warning" as const
      },
      {
        name: "Pending Returns",
        amount: mockData.pendingReturns.reduce((sum, item) => sum + item.amount, 0),
        count: mockData.pendingReturns.length,
        items: mockData.pendingReturns,
        description: "Returns authorized but credits not processed",
        icon: <RotateCcw className="w-4 h-4" />,
        severity: "warning" as const
      },
      {
        name: "Unreturned Cores",
        amount: mockData.unreturnedCores.reduce((sum, item) => sum + item.amount, 0),
        count: mockData.unreturnedCores.length,
        items: mockData.unreturnedCores,
        description: "Core deposits not returned to customers",
        icon: <RotateCcw className="w-4 h-4" />,
        severity: "info" as const
      },
      {
        name: "Shipping Not Charged",
        amount: mockData.shippingNotCharged.reduce((sum, item) => sum + item.amount, 0),
        count: mockData.shippingNotCharged.length,
        items: mockData.shippingNotCharged,
        description: "Delivery fees not passed to customers",
        icon: <Truck className="w-4 h-4" />,
        severity: "critical" as const
      },
      {
        name: "Charged Sales Tax",
        amount: mockData.chargedSalesTax.reduce((sum, item) => sum + item.amount, 0),
        count: mockData.chargedSalesTax.length,
        items: mockData.chargedSalesTax,
        description: "Tax collected but not yet remitted (30-day cycle)",
        icon: <Receipt className="w-4 h-4" />,
        severity: "warning" as const
      }
    ].filter(category => category.amount > 0);

    const baseTotalAtRisk = baseCategories.reduce((sum, cat) => sum + cat.amount, 0);
    const recoveryTotal = recoveryCategories.reduce((sum, cat) => sum + cat.amount, 0);
    
    let adjustedCategories = baseCategories;
    let total = baseTotalAtRisk;
    let explanation = "";

    if (type === "monthly-risk") {
      adjustedCategories = baseCategories.map(cat => ({
        ...cat,
        amount: Math.round(cat.amount * 1.8)
      }));
      total = Math.round(baseTotalAtRisk * 1.8);
      explanation = "If current issues continue at this rate";
    } else if (type === "recovery-potential") {
      adjustedCategories = recoveryCategories.map(cat => ({
        ...cat,
        amount: Math.round(cat.amount * 0.85)
      })) as any;
      total = Math.round(recoveryTotal * 0.85);
      explanation = "Realistic recovery if fixed this week (excludes unscanned invoices - see At Risk Now)";
    } else {
      explanation = "Current exposure from unresolved issues";
    }

    return {
      categories: adjustedCategories,
      total,
      explanation
    };
  };

  const handleFinancialCardClick = (type: "at-risk-now" | "monthly-risk" | "recovery-potential") => {
    setFinancialBreakdownModal({
      isOpen: true,
      type,
      breakdown: createBreakdownData(type)
    });
  };

  const handleCategoryClick = (categoryType: "invoices" | "parts" | "returns" | "cores" | "shipping" | "sales-tax") => {
    const modalConfig = {
      invoices: { items: mockData.unscannedInvoices, title: "Unscanned Invoices by Location" },
      parts: { items: mockData.unmatchedParts, title: "Unmatched Parts by Location" },
      returns: { items: mockData.pendingReturns, title: "Pending Returns by Location" },
      cores: { items: mockData.unreturnedCores, title: "Unreturned Cores by Location" },
      shipping: { items: mockData.shippingNotCharged, title: "Shipping Not Charged by Location" },
      "sales-tax": { items: mockData.chargedSalesTax, title: "Charged Sales Tax by Location" }
    };

    const config = modalConfig[categoryType];
    if (config) {
      setSelectedModal({
        type: categoryType === "sales-tax" ? "shipping" : categoryType as "invoices" | "parts" | "returns" | "cores" | "shipping", // Temporary workaround for modal type
        title: config.title,
        items: config.items,
        locations: mockData.locations
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader userName="Shop Owner" alertCount={8} />
      
      <div className="p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 h-16 bg-gradient-to-r from-card via-card/95 to-card border-2 border-brand-primary/20 rounded-xl p-1 shadow-xl backdrop-blur-sm">
            <TabsTrigger 
              value="dashboard" 
              className="group relative h-12 font-bold text-sm transition-all duration-300 ease-out rounded-lg overflow-hidden
                hover:scale-105 hover:shadow-lg cursor-pointer
                data-[state=active]:bg-gradient-to-r data-[state=active]:from-brand-primary data-[state=active]:to-brand-secondary 
                data-[state=active]:text-white data-[state=active]:shadow-2xl data-[state=active]:scale-105
                data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-brand-primary data-[state=inactive]:hover:bg-brand-primary/5
                before:absolute before:inset-0 before:bg-gradient-to-r before:from-brand-primary/20 before:to-brand-secondary/20 before:opacity-0 before:transition-opacity before:duration-300
                hover:before:opacity-100 data-[state=active]:before:opacity-0"
            >
              <span className="relative z-10 flex items-center gap-2">
                📊 Dashboard
              </span>
            </TabsTrigger>
            <TabsTrigger 
              value="historical" 
              className="group relative h-12 font-bold text-sm transition-all duration-300 ease-out rounded-lg overflow-hidden
                hover:scale-105 hover:shadow-lg cursor-pointer
                data-[state=active]:bg-gradient-to-r data-[state=active]:from-brand-primary data-[state=active]:to-brand-secondary 
                data-[state=active]:text-white data-[state=active]:shadow-2xl data-[state=active]:scale-105
                data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-brand-primary data-[state=inactive]:hover:bg-brand-primary/5
                before:absolute before:inset-0 before:bg-gradient-to-r before:from-brand-primary/20 before:to-brand-secondary/20 before:opacity-0 before:transition-opacity before:duration-300
                hover:before:opacity-100 data-[state=active]:before:opacity-0"
            >
              <span className="relative z-10 flex items-center gap-1">
                📈 <span className="hidden sm:inline">Historical Performance</span>
                <span className="sm:hidden flex flex-col items-center leading-tight">
                  <span className="text-xs">Historical</span>
                  <span className="text-xs">Performance</span>
                </span>
              </span>
            </TabsTrigger>
            <TabsTrigger 
              value="aging-wip" 
              className="group relative h-12 font-bold text-sm transition-all duration-300 ease-out rounded-lg overflow-hidden
                hover:scale-105 hover:shadow-lg cursor-pointer
                data-[state=active]:bg-gradient-to-r data-[state=active]:from-brand-primary data-[state=active]:to-brand-secondary 
                data-[state=active]:text-white data-[state=active]:shadow-2xl data-[state=active]:scale-105
                data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-brand-primary data-[state=inactive]:hover:bg-brand-primary/5
                before:absolute before:inset-0 before:bg-gradient-to-r before:from-brand-primary/20 before:to-brand-secondary/20 before:opacity-0 before:transition-opacity before:duration-300
                hover:before:opacity-100 data-[state=active]:before:opacity-0"
            >
              <span className="relative z-10 flex items-center gap-2">
                ⏰ Aging WIP
              </span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="dashboard" className="space-y-6">
        {/* Critical Alert Banner */}
        {criticalIssues > 0 && (
          <Card className="border-l-4 border-l-status-critical bg-gradient-to-r from-red-50 to-white">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-6 h-6 text-status-critical" />
                <div>
                  <h3 className="font-semibold text-foreground">Urgent Action Required</h3>
                  <p className="text-sm text-muted-foreground">{criticalIssues} critical issues need immediate attention</p>
                </div>
                <Badge variant="destructive" className="ml-auto">
                  {criticalIssues} Issues
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Financial Impact Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card 
            className="bg-gradient-to-r from-brand-primary to-brand-secondary text-white cursor-pointer hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
            onClick={() => handleFinancialCardClick("at-risk-now")}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-5 h-5" />
                <div>
                  <h3 className="font-semibold">At Risk Now</h3>
                  <p className="text-xs opacity-75">Current unresolved issues</p>
                </div>
              </div>
              <div className="text-2xl font-bold">${totalAtRisk.toLocaleString()}</div>
              <p className="text-sm opacity-90">Money tied up right now</p>
              <p className="text-xs opacity-75 mt-1">📅 Issues from past 30 days • Click for details</p>
            </CardContent>
          </Card>
          
          <Card 
            className="bg-gradient-to-r from-status-warning to-amber-500 text-white cursor-pointer hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
            onClick={() => handleFinancialCardClick("monthly-risk")}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5" />
                <div>
                  <h3 className="font-semibold">Trending 30 Day Future Risk</h3>
                  <p className="text-xs opacity-75">If current rate continues</p>
                </div>
              </div>
              <div className="text-2xl font-bold">${monthlyTheftEstimate.toLocaleString()}</div>
              <p className="text-sm opacity-90">Projected next 30 days</p>
              <p className="text-xs opacity-75 mt-1">📈 Current rate + new issues • Click for breakdown</p>
            </CardContent>
          </Card>
          
          <Card 
            className="bg-gradient-to-r from-status-success to-green-500 text-white cursor-pointer hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
            onClick={() => handleFinancialCardClick("recovery-potential")}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-5 h-5" />
                <div>
                  <h3 className="font-semibold">Recovery Potential</h3>
                  <p className="text-xs opacity-75">If fixed within 7 days</p>
                </div>
              </div>
              <div className="text-2xl font-bold">${potentialRecovery.toLocaleString()}</div>
              <p className="text-sm opacity-90">Realistic recovery amount</p>
              <p className="text-xs opacity-75 mt-1">⚡ Quick action needed • Click for opportunities</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">Quick Action Items</h3>
          <Button variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Quick Action Items */}
        <Card className="bg-gradient-to-r from-green-50 to-white border-l-4 border-l-status-success">
          <CardContent className="p-4">
            <h4 className="font-medium text-card-foreground mb-3 flex items-center gap-2">
              <Target className="w-4 h-4 text-status-success" />
              Today's Priority Actions
            </h4>
            <div className="space-y-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full justify-start text-left"
                onClick={() => {/* Navigate to critical invoices */}}
              >
                📄 Review 3 high-value unscanned invoices
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full justify-start text-left"
                onClick={() => {/* Navigate to team training */}}
              >
                👥 Schedule return process training for Sarah
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full justify-start text-left"
                onClick={() => {/* Navigate to automation */}}
              >
                🔧 Set up automated invoice scanning
              </Button>
            </div>
          </CardContent>
        </Card>

            {/* Wins Section */}
            <WinsSection winsData={{ thisWeekWins: mockData.thisWeekWins, thisMonthWins: mockData.thisMonthWins }} />
          </TabsContent>
          
          <TabsContent value="historical">
            <HistoricalPerformanceTab />
          </TabsContent>
          
          <TabsContent value="aging-wip">
            <AgingWIPTab />
          </TabsContent>
        </Tabs>
      </div>

      {/* Detail Modal */}
      {selectedModal && (
        <DetailModal
          isOpen={true}
          onClose={closeModal}
          title={selectedModal.title}
          items={selectedModal.items}
          locations={selectedModal.locations}
          type={selectedModal.type}
        />
      )}
      
      {/* Financial Breakdown Modal */}
      <FinancialBreakdownModal
        isOpen={financialBreakdownModal.isOpen}
        onClose={closeFinancialModal}
        type={financialBreakdownModal.type}
        breakdown={financialBreakdownModal.breakdown}
        onCategoryClick={handleCategoryClick}
      />
    </div>
  );
}