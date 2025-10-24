import React from "react";
import { useNavigate } from "react-router-dom";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

interface HistoricalData {
  location: string;
  partsGross: number;
  partsProfit: number;
  partsMargin: number;
  partsPiecesSold: number;
  partsAvgTicket: number;
  laborGross: number;
  laborProfit: number;
  laborMargin: number;
  laborHours: number;
  laborAvgHour: number;
  subletGross: number;
  subletProfit: number;
  subletMargin: number;
  totalGross: number;
  totalProfit: number;
  totalMargin: number;
  carCount: number;
  avgRO: number;
}

interface HistoricalDataTableProps {
  title: string;
  currentYearData: HistoricalData[];
  previousYear1Data: HistoricalData[];
  previousYear2Data: HistoricalData[];
  totals: {
    current: HistoricalData;
    previous1: HistoricalData;
    previous2: HistoricalData;
  };
}

export function HistoricalDataTable({ 
  title, 
  currentYearData, 
  previousYear1Data, 
  previousYear2Data,
  totals 
}: HistoricalDataTableProps) {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();
  
  // Color coding based on year-over-year performance
  const getPerformanceClass = (current: number, previous: number) => {
    if (!previous || previous === 0) return "";
    const change = ((current - previous) / previous) * 100;
    
    if (change >= 20) return "bg-status-success/30 text-status-success font-semibold"; // Green: 20%+ growth
    if (change >= 10) return "bg-status-info/30 text-status-info font-semibold"; // Blue: 10-20% growth
    if (change >= 0) return "bg-status-warning/30 text-status-warning font-medium"; // Yellow: 0-10% growth
    return "bg-status-critical/30 text-status-critical font-semibold"; // Red: negative growth
  };

  const formatCurrency = (value: number) => `$${value.toLocaleString()}`;
  const formatPercentage = (value: number) => `${value.toFixed(1)}%`;

  const handleLocationClick = (locationName: string) => {
    navigate(`/location/${encodeURIComponent(locationName)}`);
  };

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      <div className="border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <Table className="w-full text-xs border-collapse">
            <TableHeader>
              {/* Year Headers */}
              <TableRow className="h-8 bg-muted/50">
                <TableHead className="sticky left-0 bg-background border-r font-semibold text-xs p-2 min-w-[120px] z-20">
                  Location
                </TableHead>
                <TableHead colSpan={5} className="text-center font-semibold bg-primary/10 text-xs p-1 border-b border-r">
                  {currentYear}
                </TableHead>
                <TableHead colSpan={5} className="text-center font-semibold bg-muted text-xs p-1 border-b border-r">
                  {currentYear - 1}
                </TableHead>
                <TableHead colSpan={5} className="text-center font-semibold bg-muted text-xs p-1 border-b">
                  {currentYear - 2}
                </TableHead>
              </TableRow>
              
              {/* Column Headers */}
              <TableRow className="h-6 bg-muted/30">
                <TableHead className="sticky left-0 bg-background border-r p-1 z-20"></TableHead>
                {[...Array(3)].map((_, yearIndex) => (
                  <React.Fragment key={yearIndex}>
                    <TableHead className="text-center text-xs p-1 w-20 border-r">Gross</TableHead>
                    <TableHead className="text-center text-xs p-1 w-20 border-r">Profit</TableHead>
                    <TableHead className="text-center text-xs p-1 w-16 border-r">%</TableHead>
                    <TableHead className="text-center text-xs p-1 w-16 border-r">#ROs</TableHead>
                    <TableHead className="text-center text-xs p-1 w-20 border-r">Avg RO</TableHead>
                  </React.Fragment>
                ))}
              </TableRow>
            </TableHeader>
            
            <TableBody>
              {currentYearData.map((locationData, index) => (
                <React.Fragment key={locationData.location}>
                  {/* Parts Sales Row */}
                  <TableRow className="h-5 border-b">
                    <TableCell 
                      className="text-xs p-1 pl-2 sticky left-0 bg-background border-r font-medium z-10 cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => handleLocationClick(locationData.location)}
                    >
                      <div className="font-semibold text-primary hover:text-primary/80">{locationData.location}</div>
                      <div className="text-muted-foreground">Parts Sales</div>
                    </TableCell>
                    
                    {/* Current Year Parts */}
                    <TableCell className={cn("text-right p-1 text-xs",
                      previousYear1Data[index] ? getPerformanceClass(locationData.partsGross, previousYear1Data[index].partsGross) : ""
                    )}>{formatCurrency(locationData.partsGross)}</TableCell>
                    <TableCell className={cn("text-right p-1 text-xs",
                      previousYear1Data[index] ? getPerformanceClass(locationData.partsProfit, previousYear1Data[index].partsProfit) : ""
                    )}>{formatCurrency(locationData.partsProfit)}</TableCell>
                    <TableCell className={cn("text-right p-1 text-xs",
                      previousYear1Data[index] ? getPerformanceClass(locationData.partsMargin, previousYear1Data[index].partsMargin) : ""
                    )}>{formatPercentage(locationData.partsMargin)}</TableCell>
                    <TableCell className="text-right p-1 text-xs">{locationData.partsPiecesSold.toLocaleString()}</TableCell>
                    <TableCell className="text-right p-1 text-xs">{formatCurrency(locationData.partsAvgTicket)}</TableCell>
                    
                    {/* Previous Year 1 Parts */}
                    {previousYear1Data[index] && (
                      <>
                        <TableCell className={cn("text-right p-1 text-xs",
                          getPerformanceClass(locationData.partsGross, previousYear1Data[index].partsGross)
                        )}>{formatCurrency(previousYear1Data[index].partsGross)}</TableCell>
                        <TableCell className={cn("text-right p-1 text-xs",
                          getPerformanceClass(locationData.partsProfit, previousYear1Data[index].partsProfit)
                        )}>{formatCurrency(previousYear1Data[index].partsProfit)}</TableCell>
                        <TableCell className={cn("text-right p-1 text-xs",
                          getPerformanceClass(locationData.partsMargin, previousYear1Data[index].partsMargin)
                        )}>{formatPercentage(previousYear1Data[index].partsMargin)}</TableCell>
                        <TableCell className="text-right p-1 text-xs">{previousYear1Data[index].partsPiecesSold.toLocaleString()}</TableCell>
                        <TableCell className="text-right p-1 text-xs">{formatCurrency(previousYear1Data[index].partsAvgTicket)}</TableCell>
                      </>
                    )}
                    
                    {/* Previous Year 2 Parts */}
                    {previousYear2Data[index] && (
                      <>
                        <TableCell className={cn("text-right p-1 text-xs",
                          getPerformanceClass(previousYear1Data[index]?.partsGross || 0, previousYear2Data[index].partsGross)
                        )}>{formatCurrency(previousYear2Data[index].partsGross)}</TableCell>
                        <TableCell className={cn("text-right p-1 text-xs",
                          getPerformanceClass(previousYear1Data[index]?.partsProfit || 0, previousYear2Data[index].partsProfit)
                        )}>{formatCurrency(previousYear2Data[index].partsProfit)}</TableCell>
                        <TableCell className={cn("text-right p-1 text-xs",
                          getPerformanceClass(previousYear1Data[index]?.partsMargin || 0, previousYear2Data[index].partsMargin)
                        )}>{formatPercentage(previousYear2Data[index].partsMargin)}</TableCell>
                        <TableCell className="text-right p-1 text-xs">{previousYear2Data[index].partsPiecesSold.toLocaleString()}</TableCell>
                        <TableCell className="text-right p-1 text-xs">{formatCurrency(previousYear2Data[index].partsAvgTicket)}</TableCell>
                      </>
                    )}
                  </TableRow>
                  
                  {/* Labor Sales Row */}
                  <TableRow className="h-5 border-b">
                    <TableCell className="text-xs p-1 pl-2 sticky left-0 bg-background border-r font-medium z-10">
                      <div className="text-muted-foreground">Labor Sales</div>
                    </TableCell>
                    
                    {/* Current Year Labor */}
                    <TableCell className={cn("text-right p-1 text-xs",
                      previousYear1Data[index] ? getPerformanceClass(locationData.laborGross, previousYear1Data[index].laborGross) : ""
                    )}>{formatCurrency(locationData.laborGross)}</TableCell>
                    <TableCell className={cn("text-right p-1 text-xs",
                      previousYear1Data[index] ? getPerformanceClass(locationData.laborProfit, previousYear1Data[index].laborProfit) : ""
                    )}>{formatCurrency(locationData.laborProfit)}</TableCell>
                    <TableCell className={cn("text-right p-1 text-xs",
                      previousYear1Data[index] ? getPerformanceClass(locationData.laborMargin, previousYear1Data[index].laborMargin) : ""
                    )}>{formatPercentage(locationData.laborMargin)}</TableCell>
                    <TableCell className="text-right p-1 text-xs">{locationData.laborHours.toFixed(1)}</TableCell>
                    <TableCell className="text-right p-1 text-xs">{formatCurrency(locationData.laborAvgHour)}</TableCell>
                    
                    {/* Previous Year 1 Labor */}
                    {previousYear1Data[index] && (
                      <>
                        <TableCell className={cn("text-right p-1 text-xs",
                          getPerformanceClass(locationData.laborGross, previousYear1Data[index].laborGross)
                        )}>{formatCurrency(previousYear1Data[index].laborGross)}</TableCell>
                        <TableCell className={cn("text-right p-1 text-xs",
                          getPerformanceClass(locationData.laborProfit, previousYear1Data[index].laborProfit)
                        )}>{formatCurrency(previousYear1Data[index].laborProfit)}</TableCell>
                        <TableCell className={cn("text-right p-1 text-xs",
                          getPerformanceClass(locationData.laborMargin, previousYear1Data[index].laborMargin)
                        )}>{formatPercentage(previousYear1Data[index].laborMargin)}</TableCell>
                        <TableCell className="text-right p-1 text-xs">{previousYear1Data[index].laborHours.toFixed(1)}</TableCell>
                        <TableCell className="text-right p-1 text-xs">{formatCurrency(previousYear1Data[index].laborAvgHour)}</TableCell>
                      </>
                    )}
                    
                    {/* Previous Year 2 Labor */}
                    {previousYear2Data[index] && (
                      <>
                        <TableCell className={cn("text-right p-1 text-xs",
                          getPerformanceClass(previousYear1Data[index]?.laborGross || 0, previousYear2Data[index].laborGross)
                        )}>{formatCurrency(previousYear2Data[index].laborGross)}</TableCell>
                        <TableCell className={cn("text-right p-1 text-xs",
                          getPerformanceClass(previousYear1Data[index]?.laborProfit || 0, previousYear2Data[index].laborProfit)
                        )}>{formatCurrency(previousYear2Data[index].laborProfit)}</TableCell>
                        <TableCell className={cn("text-right p-1 text-xs",
                          getPerformanceClass(previousYear1Data[index]?.laborMargin || 0, previousYear2Data[index].laborMargin)
                        )}>{formatPercentage(previousYear2Data[index].laborMargin)}</TableCell>
                        <TableCell className="text-right p-1 text-xs">{previousYear2Data[index].laborHours.toFixed(1)}</TableCell>
                        <TableCell className="text-right p-1 text-xs">{formatCurrency(previousYear2Data[index].laborAvgHour)}</TableCell>
                      </>
                    )}
                  </TableRow>
                  
                  {/* Sublet Row */}
                  <TableRow className="h-5 border-b">
                    <TableCell className="text-xs p-1 pl-2 sticky left-0 bg-background border-r font-medium z-10">
                      <div className="text-muted-foreground">Sublet</div>
                    </TableCell>
                    
                    {/* Current Year Sublet */}
                    <TableCell className={cn("text-right p-1 text-xs",
                      previousYear1Data[index] ? getPerformanceClass(locationData.subletGross, previousYear1Data[index].subletGross) : ""
                    )}>{formatCurrency(locationData.subletGross)}</TableCell>
                    <TableCell className={cn("text-right p-1 text-xs",
                      previousYear1Data[index] ? getPerformanceClass(locationData.subletProfit, previousYear1Data[index].subletProfit) : ""
                    )}>{formatCurrency(locationData.subletProfit)}</TableCell>
                    <TableCell className={cn("text-right p-1 text-xs",
                      previousYear1Data[index] ? getPerformanceClass(locationData.subletMargin, previousYear1Data[index].subletMargin) : ""
                    )}>{formatPercentage(locationData.subletMargin)}</TableCell>
                    <TableCell className="text-right p-1 text-xs">-</TableCell>
                    <TableCell className="text-right p-1 text-xs">-</TableCell>
                    
                    {/* Previous Year 1 Sublet */}
                    {previousYear1Data[index] && (
                      <>
                        <TableCell className={cn("text-right p-1 text-xs",
                          getPerformanceClass(locationData.subletGross, previousYear1Data[index].subletGross)
                        )}>{formatCurrency(previousYear1Data[index].subletGross)}</TableCell>
                        <TableCell className={cn("text-right p-1 text-xs",
                          getPerformanceClass(locationData.subletProfit, previousYear1Data[index].subletProfit)
                        )}>{formatCurrency(previousYear1Data[index].subletProfit)}</TableCell>
                        <TableCell className={cn("text-right p-1 text-xs",
                          getPerformanceClass(locationData.subletMargin, previousYear1Data[index].subletMargin)
                        )}>{formatPercentage(previousYear1Data[index].subletMargin)}</TableCell>
                        <TableCell className="text-right p-1 text-xs">-</TableCell>
                        <TableCell className="text-right p-1 text-xs">-</TableCell>
                      </>
                    )}
                    
                    {/* Previous Year 2 Sublet */}
                    {previousYear2Data[index] && (
                      <>
                        <TableCell className={cn("text-right p-1 text-xs",
                          getPerformanceClass(previousYear1Data[index]?.subletGross || 0, previousYear2Data[index].subletGross)
                        )}>{formatCurrency(previousYear2Data[index].subletGross)}</TableCell>
                        <TableCell className={cn("text-right p-1 text-xs",
                          getPerformanceClass(previousYear1Data[index]?.subletProfit || 0, previousYear2Data[index].subletProfit)
                        )}>{formatCurrency(previousYear2Data[index].subletProfit)}</TableCell>
                        <TableCell className={cn("text-right p-1 text-xs",
                          getPerformanceClass(previousYear1Data[index]?.subletMargin || 0, previousYear2Data[index].subletMargin)
                        )}>{formatPercentage(previousYear2Data[index].subletMargin)}</TableCell>
                        <TableCell className="text-right p-1 text-xs">-</TableCell>
                        <TableCell className="text-right p-1 text-xs">-</TableCell>
                      </>
                    )}
                  </TableRow>
                  
                  {/* Total Row */}
                  <TableRow className="h-5 border-b-2 border-muted bg-muted/10">
                    <TableCell className="text-xs p-1 pl-2 font-bold sticky left-0 bg-background border-r z-10">
                      <div className="text-foreground font-bold">Total</div>
                    </TableCell>
                    
                    {/* Current Year Total */}
                    <TableCell className={cn("text-right p-1 text-xs font-bold",
                      previousYear1Data[index] ? getPerformanceClass(locationData.totalGross, previousYear1Data[index].totalGross) : ""
                    )}>{formatCurrency(locationData.totalGross)}</TableCell>
                    <TableCell className={cn("text-right p-1 text-xs font-bold",
                      previousYear1Data[index] ? getPerformanceClass(locationData.totalProfit, previousYear1Data[index].totalProfit) : ""
                    )}>{formatCurrency(locationData.totalProfit)}</TableCell>
                    <TableCell className={cn("text-right p-1 text-xs font-bold",
                      previousYear1Data[index] ? getPerformanceClass(locationData.totalMargin, previousYear1Data[index].totalMargin) : ""
                    )}>{formatPercentage(locationData.totalMargin)}</TableCell>
                    <TableCell className="text-right p-1 text-xs font-bold">{locationData.carCount.toLocaleString()}</TableCell>
                    <TableCell className="text-right p-1 text-xs font-bold">{formatCurrency(locationData.avgRO)}</TableCell>
                    
                    {/* Previous Year 1 Total */}
                    {previousYear1Data[index] && (
                      <>
                        <TableCell className={cn("text-right p-1 text-xs font-bold",
                          getPerformanceClass(locationData.totalGross, previousYear1Data[index].totalGross)
                        )}>{formatCurrency(previousYear1Data[index].totalGross)}</TableCell>
                        <TableCell className={cn("text-right p-1 text-xs font-bold",
                          getPerformanceClass(locationData.totalProfit, previousYear1Data[index].totalProfit)
                        )}>{formatCurrency(previousYear1Data[index].totalProfit)}</TableCell>
                        <TableCell className={cn("text-right p-1 text-xs font-bold",
                          getPerformanceClass(locationData.totalMargin, previousYear1Data[index].totalMargin)
                        )}>{formatPercentage(previousYear1Data[index].totalMargin)}</TableCell>
                        <TableCell className="text-right p-1 text-xs font-bold">{previousYear1Data[index].carCount.toLocaleString()}</TableCell>
                        <TableCell className="text-right p-1 text-xs font-bold">{formatCurrency(previousYear1Data[index].avgRO)}</TableCell>
                      </>
                    )}
                    
                    {/* Previous Year 2 Total */}
                    {previousYear2Data[index] && (
                      <>
                        <TableCell className={cn("text-right p-1 text-xs font-bold",
                          getPerformanceClass(previousYear1Data[index]?.totalGross || 0, previousYear2Data[index].totalGross)
                        )}>{formatCurrency(previousYear2Data[index].totalGross)}</TableCell>
                        <TableCell className={cn("text-right p-1 text-xs font-bold",
                          getPerformanceClass(previousYear1Data[index]?.totalProfit || 0, previousYear2Data[index].totalProfit)
                        )}>{formatCurrency(previousYear2Data[index].totalProfit)}</TableCell>
                        <TableCell className={cn("text-right p-1 text-xs font-bold",
                          getPerformanceClass(previousYear1Data[index]?.totalMargin || 0, previousYear2Data[index].totalMargin)
                        )}>{formatPercentage(previousYear2Data[index].totalMargin)}</TableCell>
                        <TableCell className="text-right p-1 text-xs font-bold">{previousYear2Data[index].carCount.toLocaleString()}</TableCell>
                        <TableCell className="text-right p-1 text-xs font-bold">{formatCurrency(previousYear2Data[index].avgRO)}</TableCell>
                      </>
                    )}
                  </TableRow>
                </React.Fragment>
              ))}
              
              {/* Company Totals Section */}
              <TableRow className="h-8 bg-primary/20 border-t-4 border-primary">
                <TableCell className="text-xs p-1 pl-2 font-bold sticky left-0 bg-background border-r z-10">
                  <div className="font-bold text-primary">{totals.current.location}</div>
                </TableCell>
                <TableCell colSpan={15} className="font-bold text-sm p-2 text-center">
                  {/* This cell spans the data columns */}
                </TableCell>
              </TableRow>
              
              {/* Company Totals Content */}
              <TableRow className="h-6 bg-primary/10 border-b-2 border-primary">
                <TableCell className="text-xs p-1 pl-2 font-bold sticky left-0 bg-background border-r z-10">
                  <div className="text-foreground font-bold">TOTALS</div>
                </TableCell>
                
                {/* Current Year Company Total */}
                <TableCell className={cn("text-right p-1 text-xs font-bold bg-primary/10",
                  getPerformanceClass(totals.current.totalGross, totals.previous1.totalGross)
                )}>{formatCurrency(totals.current.totalGross)}</TableCell>
                <TableCell className={cn("text-right p-1 text-xs font-bold bg-primary/10",
                  getPerformanceClass(totals.current.totalProfit, totals.previous1.totalProfit)
                )}>{formatCurrency(totals.current.totalProfit)}</TableCell>
                <TableCell className={cn("text-right p-1 text-xs font-bold bg-primary/10",
                  getPerformanceClass(totals.current.totalMargin, totals.previous1.totalMargin)
                )}>{formatPercentage(totals.current.totalMargin)}</TableCell>
                <TableCell className="text-right p-1 text-xs font-bold bg-primary/10">{totals.current.carCount.toLocaleString()}</TableCell>
                <TableCell className="text-right p-1 text-xs font-bold bg-primary/10">{formatCurrency(totals.current.avgRO)}</TableCell>
                
                {/* Previous Year 1 Company Total */}
                <TableCell className={cn("text-right p-1 text-xs font-bold",
                  getPerformanceClass(totals.current.totalGross, totals.previous1.totalGross)
                )}>{formatCurrency(totals.previous1.totalGross)}</TableCell>
                <TableCell className={cn("text-right p-1 text-xs font-bold",
                  getPerformanceClass(totals.current.totalProfit, totals.previous1.totalProfit)
                )}>{formatCurrency(totals.previous1.totalProfit)}</TableCell>
                <TableCell className={cn("text-right p-1 text-xs font-bold",
                  getPerformanceClass(totals.current.totalMargin, totals.previous1.totalMargin)
                )}>{formatPercentage(totals.previous1.totalMargin)}</TableCell>
                <TableCell className="text-right p-1 text-xs font-bold">{totals.previous1.carCount.toLocaleString()}</TableCell>
                <TableCell className="text-right p-1 text-xs font-bold">{formatCurrency(totals.previous1.avgRO)}</TableCell>
                
                {/* Previous Year 2 Company Total */}
                <TableCell className={cn("text-right p-1 text-xs font-bold",
                  getPerformanceClass(totals.previous1.totalGross, totals.previous2.totalGross)
                )}>{formatCurrency(totals.previous2.totalGross)}</TableCell>
                <TableCell className={cn("text-right p-1 text-xs font-bold",
                  getPerformanceClass(totals.previous1.totalProfit, totals.previous2.totalProfit)
                )}>{formatCurrency(totals.previous2.totalProfit)}</TableCell>
                <TableCell className={cn("text-right p-1 text-xs font-bold",
                  getPerformanceClass(totals.previous1.totalMargin, totals.previous2.totalMargin)
                )}>{formatPercentage(totals.previous2.totalMargin)}</TableCell>
                <TableCell className="text-right p-1 text-xs font-bold">{totals.previous2.carCount.toLocaleString()}</TableCell>
                <TableCell className="text-right p-1 text-xs font-bold">{formatCurrency(totals.previous2.avgRO)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}