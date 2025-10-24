import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight, Trophy, Calendar, FileText, Package, RotateCcw, Truck, Receipt } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface WinCategory {
  name: string;
  count: number;
  value: number;
  icon: React.ReactNode;
}

interface WinPeriod {
  totalValue: number;
  count: number;
  categories: WinCategory[];
}

interface WinsData {
  thisWeekWins: WinPeriod;
  thisMonthWins: WinPeriod;
}

interface DetailedWinItem {
  id: string;
  roNumber: string;
  partNumber?: string;
  partDescription?: string;
  vendor?: string;
  amount: number;
  date: string;
  location: string;
}

// Mock detailed data - in real app this would come from your API
const getDetailedWinData = (category: string, period: 'week' | 'month'): DetailedWinItem[] => {
  const baseData = {
    "Invoices Scanned": [
      { id: "1", roNumber: "RO-2024-001", vendor: "AutoZone", amount: 450, date: "Jan 15", location: "Downtown" },
      { id: "2", roNumber: "RO-2024-002", vendor: "NAPA", amount: 320, date: "Jan 14", location: "Northside" },
      { id: "3", roNumber: "RO-2024-003", vendor: "O'Reilly", amount: 680, date: "Jan 13", location: "West End" },
      { id: "4", roNumber: "RO-2024-004", vendor: "Advance Auto", amount: 400, date: "Jan 12", location: "South Bay" },
    ],
    "Parts Added to ROs": [
      { id: "5", roNumber: "RO-2024-005", partNumber: "BP-1234", partDescription: "Brake Pads - Front Set", amount: 180, date: "Jan 15", location: "Downtown" },
      { id: "6", roNumber: "RO-2024-006", partNumber: "OF-5678", partDescription: "Oil Filter", amount: 25, date: "Jan 14", location: "Northside" },
      { id: "7", roNumber: "RO-2024-007", partNumber: "TF-9012", partDescription: "Transmission Fluid", amount: 475, date: "Jan 13", location: "West End" },
    ],
    "Returns Processed": [
      { id: "8", roNumber: "RA-001", partNumber: "WP-3456", partDescription: "Wrong Water Pump", vendor: "AutoZone", amount: 280, date: "Jan 15", location: "Downtown" },
      { id: "9", roNumber: "RA-002", partNumber: "SF-7890", partDescription: "Surplus Filter", vendor: "NAPA", amount: 170, date: "Jan 14", location: "Northside" },
    ],
    "Cores Collected": [
      { id: "10", roNumber: "RO-2024-008", partNumber: "ALT-123", partDescription: "Alternator Core", amount: 125, date: "Jan 15", location: "Downtown" },
      { id: "11", roNumber: "RO-2024-009", partNumber: "STR-456", partDescription: "Starter Core", amount: 165, date: "Jan 14", location: "Northside" },
    ],
    "Shipping Charged": [
      { id: "12", roNumber: "RO-2024-010", partDescription: "Express Delivery Fee", amount: 45, date: "Jan 15", location: "Downtown" },
      { id: "13", roNumber: "RO-2024-011", partDescription: "Same Day Delivery", amount: 105, date: "Jan 14", location: "Northside" },
    ],
    "Sales Tax Fixed": [
      { id: "14", roNumber: "RO-2024-012", partDescription: "Sales Tax Correction", amount: 350, date: "Jan 10", location: "West End" },
    ]
  };

  // For month view, multiply the data
  if (period === 'month') {
    const monthData = baseData[category as keyof typeof baseData] || [];
    return monthData.concat(
      monthData.map((item, index) => ({
        ...item,
        id: `${item.id}_${index + 100}`,
        roNumber: `RO-2024-${parseInt(item.roNumber.split('-')[2]) + 100}`,
        date: `Jan ${parseInt(item.date.split(' ')[1]) - 7}`,
      }))
    );
  }

  return baseData[category as keyof typeof baseData] || [];
};

interface WinsSectionProps {
  winsData: WinsData;
}

export function WinsSection({ winsData }: WinsSectionProps) {
  const [isWeekOpen, setIsWeekOpen] = useState(false);
  const [isMonthOpen, setIsMonthOpen] = useState(false);
  const [detailModal, setDetailModal] = useState<{
    isOpen: boolean;
    category: string;
    period: 'week' | 'month';
    items: DetailedWinItem[];
  }>({ isOpen: false, category: '', period: 'week', items: [] });

  const handleCategoryClick = (category: string, period: 'week' | 'month') => {
    const items = getDetailedWinData(category, period);
    setDetailModal({
      isOpen: true,
      category,
      period,
      items
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* This Week's Wins */}
        <Card className="border-2 border-success/20 bg-gradient-to-br from-success/5 to-transparent">
          <Collapsible open={isWeekOpen} onOpenChange={setIsWeekOpen}>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-success/5 transition-colors">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-success/10 rounded-lg">
                      <Trophy className="w-5 h-5 text-success" />
                    </div>
                    <div>
                      <div className="text-lg font-bold text-success">This Week's Wins</div>
                      <div className="text-2xl font-bold text-foreground">
                        {formatCurrency(winsData.thisWeekWins.totalValue)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                      {winsData.thisWeekWins.count} issues resolved
                    </Badge>
                    {isWeekOpen ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                  </div>
                </CardTitle>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  {winsData.thisWeekWins.categories.map((category, index) => (
                    <Button
                      key={index}
                      variant="ghost"
                      className="w-full justify-between h-auto p-3 hover:bg-success/10"
                      onClick={() => handleCategoryClick(category.name, 'week')}
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-1.5 bg-success/10 rounded">
                          {category.icon}
                        </div>
                        <div className="text-left">
                          <div className="font-medium">{category.name}</div>
                          <div className="text-sm text-muted-foreground">{category.count} items</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-success">{formatCurrency(category.value)}</div>
                      </div>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>

        {/* This Month's Wins */}
        <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
          <Collapsible open={isMonthOpen} onOpenChange={setIsMonthOpen}>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-primary/5 transition-colors">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Calendar className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <div className="text-lg font-bold text-primary">This Month's Wins</div>
                      <div className="text-2xl font-bold text-foreground">
                        {formatCurrency(winsData.thisMonthWins.totalValue)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                      {winsData.thisMonthWins.count} issues resolved
                    </Badge>
                    {isMonthOpen ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                  </div>
                </CardTitle>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  {winsData.thisMonthWins.categories.map((category, index) => (
                    <Button
                      key={index}
                      variant="ghost"
                      className="w-full justify-between h-auto p-3 hover:bg-primary/10"
                      onClick={() => handleCategoryClick(category.name, 'month')}
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-1.5 bg-primary/10 rounded">
                          {category.icon}
                        </div>
                        <div className="text-left">
                          <div className="font-medium">{category.name}</div>
                          <div className="text-sm text-muted-foreground">{category.count} items</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-primary">{formatCurrency(category.value)}</div>
                      </div>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>
      </div>

      {/* Detail Modal */}
      <Dialog open={detailModal.isOpen} onOpenChange={(open) => setDetailModal(prev => ({ ...prev, isOpen: open }))}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              {detailModal.category} - {detailModal.period === 'week' ? 'This Week' : 'This Month'}
            </DialogTitle>
          </DialogHeader>
          <div className="max-h-96 overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>RO Number</TableHead>
                  {detailModal.category === "Parts Added to ROs" && (
                    <>
                      <TableHead>Part Number</TableHead>
                      <TableHead>Description</TableHead>
                    </>
                  )}
                  {(detailModal.category === "Invoices Scanned" || detailModal.category === "Returns Processed") && (
                    <TableHead>Vendor</TableHead>
                  )}
                  {detailModal.category === "Returns Processed" && (
                    <>
                      <TableHead>Part Number</TableHead>
                      <TableHead>Description</TableHead>
                    </>
                  )}
                  {detailModal.category === "Cores Collected" && (
                    <>
                      <TableHead>Part Number</TableHead>
                      <TableHead>Description</TableHead>
                    </>
                  )}
                  {detailModal.category === "Shipping Charged" && (
                    <TableHead>Description</TableHead>
                  )}
                  <TableHead>Amount</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Location</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {detailModal.items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.roNumber}</TableCell>
                    {detailModal.category === "Parts Added to ROs" && (
                      <>
                        <TableCell>{item.partNumber}</TableCell>
                        <TableCell>{item.partDescription}</TableCell>
                      </>
                    )}
                    {(detailModal.category === "Invoices Scanned" || detailModal.category === "Returns Processed") && (
                      <TableCell>{item.vendor}</TableCell>
                    )}
                    {detailModal.category === "Returns Processed" && (
                      <>
                        <TableCell>{item.partNumber}</TableCell>
                        <TableCell>{item.partDescription}</TableCell>
                      </>
                    )}
                    {detailModal.category === "Cores Collected" && (
                      <>
                        <TableCell>{item.partNumber}</TableCell>
                        <TableCell>{item.partDescription}</TableCell>
                      </>
                    )}
                    {detailModal.category === "Shipping Charged" && (
                      <TableCell>{item.partDescription}</TableCell>
                    )}
                    <TableCell className="font-semibold text-success">
                      {formatCurrency(item.amount)}
                    </TableCell>
                    <TableCell>{item.date}</TableCell>
                    <TableCell>{item.location}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}