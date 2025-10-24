import { useParams, useNavigate } from "react-router-dom";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from "recharts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, ChevronDown, ChevronUp } from "lucide-react";
import { useState, useCallback } from "react";

interface MonthlyData {
  period: string;
  currentYear: number | null;
  previousYear1: number | null;
  previousYear2: number | null;
  // New fields for profit margins and car count
  currentYearMargin: number | null;
  previousYear1Margin: number | null;
  previousYear2Margin: number | null;
  currentYearCarCount: number | null;
  previousYear1CarCount: number | null;
  previousYear2CarCount: number | null;
}

// Generate mock monthly sales data for a location
const generateLocationMonthlyData = (locationName: string): MonthlyData[] => {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth(); // 0-based (0 = January, 5 = June)
  
  // Base monthly progression (simulating business cycles)
  const monthlyMultipliers = [0.8, 0.85, 0.95, 1.0, 1.1, 1.15, 1.2, 1.1, 1.05, 1.0, 0.9, 0.85];
  
  // Different locations have different base performance
  const locationMultipliers: { [key: string]: number } = {
    "Downtown Location": 1.25,
    "Northside Shop": 1.0,
    "West End Auto": 1.4,
    "South Bay Service": 1.1,
  };
  
  const baseMultiplier = locationMultipliers[locationName] || 1.0;
  const baseMonthlyRevenue = 45000 * baseMultiplier;
  
  const data: MonthlyData[] = [];
  
  // Generate data for 12 individual months
  for (let month = 0; month < 12; month++) {
    const monthMultiplier = monthlyMultipliers[month];
    const monthName = getMonthName(month);
    
    // Current year data (only up to current month)
    let currentYearValue: number | null = null;
    if (month <= currentMonth) {
      currentYearValue = Math.round(baseMonthlyRevenue * monthMultiplier * 1.0);
    }
    
    // Previous year data (full year)
    const previousYear1Value = Math.round(baseMonthlyRevenue * monthMultiplier * 0.85);
    
    // Two years ago data (full year)
    const previousYear2Value = Math.round(baseMonthlyRevenue * monthMultiplier * 0.75);
    
    // Calculate profit margins (35-45% range with some variation)
    const marginBase = 38; // Base margin percentage
    const marginVariation = (Math.sin(month) * 3) + (Math.random() * 2 - 1); // ±5% variation
    
    const currentYearMargin = currentYearValue !== null ? marginBase + marginVariation : null;
    const previousYear1Margin = marginBase + marginVariation - 2; // Slightly lower for previous years
    const previousYear2Margin = marginBase + marginVariation - 4;
    
    // Calculate car counts (based on revenue / average RO value)
    const avgROValue = 850; // Average repair order value
    const currentYearCarCount = currentYearValue !== null ? Math.round(currentYearValue / avgROValue) : null;
    const previousYear1CarCount = Math.round(previousYear1Value / avgROValue);
    const previousYear2CarCount = Math.round(previousYear2Value / avgROValue);

    data.push({
      period: monthName,
      currentYear: currentYearValue,
      previousYear1: previousYear1Value,
      previousYear2: previousYear2Value,
      currentYearMargin,
      previousYear1Margin,
      previousYear2Margin,
      currentYearCarCount,
      previousYear1CarCount,
      previousYear2CarCount,
    });
  }
  
  return data;
};

const getMonthName = (monthIndex: number): string => {
  const monthNames = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];
  return monthNames[monthIndex];
};

const getPeriodName = (periodIndex: number): string => {
  const periodNames = [
    "Jan-Feb",
    "Mar-Apr", 
    "May-Jun",
    "Jul-Aug",
    "Sep-Oct",
    "Nov-Dec"
  ];
  return periodNames[periodIndex];
};

const formatCurrency = (value: number): string => `$${(value / 1000).toFixed(0)}K`;

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
        <p className="font-semibold mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} style={{ color: entry.color }} className="text-sm">
            {entry.name}: {entry.value ? formatCurrency(entry.value) : 'No data'}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const SynchronizedTooltip = ({ active, payload, label, data }: any) => {
  if (active && payload && payload.length && data) {
    const period = data.find((item: any) => item.period === label);
    if (!period) return null;

    return (
      <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
        <p className="font-semibold mb-2">{label}</p>
        
        {/* Sales Performance Data */}
        <div className="mb-2">
          <p className="text-xs font-medium text-muted-foreground">Sales Performance:</p>
          {period.currentYear && (
            <p className="text-sm" style={{ color: "hsl(var(--status-success))" }}>
              {new Date().getFullYear()}: {formatCurrency(period.currentYear)}
            </p>
          )}
          <p className="text-sm" style={{ color: "hsl(var(--status-info))" }}>
            {new Date().getFullYear() - 1}: {formatCurrency(period.previousYear1)}
          </p>
          <p className="text-sm" style={{ color: "hsl(var(--status-warning))" }}>
            {new Date().getFullYear() - 2}: {formatCurrency(period.previousYear2)}
          </p>
        </div>

        {/* Profit Margin & Car Count Data */}
        <div>
          <p className="text-xs font-medium text-muted-foreground">Profit Margin & Car Count:</p>
          {period.currentYearMargin && period.currentYearCarCount && (
            <p className="text-sm" style={{ color: "hsl(var(--status-success))" }}>
              {new Date().getFullYear()}: {period.currentYearMargin.toFixed(1)}% | {period.currentYearCarCount} cars
            </p>
          )}
          <p className="text-sm" style={{ color: "hsl(var(--status-info))" }}>
            {new Date().getFullYear() - 1}: {period.previousYear1Margin.toFixed(1)}% | {period.previousYear1CarCount} cars
          </p>
          <p className="text-sm" style={{ color: "hsl(var(--status-warning))" }}>
            {new Date().getFullYear() - 2}: {period.previousYear2Margin.toFixed(1)}% | {period.previousYear2CarCount} cars
          </p>
        </div>
      </div>
    );
  }
  return null;
};

export default function LocationPerformance() {
  const { locationName } = useParams<{ locationName: string }>();
  const navigate = useNavigate();
  
  // State for year visibility toggles
  const [showCurrentYear, setShowCurrentYear] = useState(true);
  const [showPreviousYear1, setShowPreviousYear1] = useState(true);
  const [showPreviousYear2, setShowPreviousYear2] = useState(true);
  
  // State for expandable summary cards
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  
  // State for active period (for draggable timeline)
  const [activePeriod, setActivePeriod] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  if (!locationName) {
    return <div>Location not found</div>;
  }
  
  const decodedLocationName = decodeURIComponent(locationName);
  const monthlyData = generateLocationMonthlyData(decodedLocationName);
  const currentYear = new Date().getFullYear();

  // Handler for mouse events on charts
  const handleChartMouseMove = useCallback((state: any) => {
    if (state && state.activeLabel && (isDragging || state.isTooltipActive)) {
      setActivePeriod(state.activeLabel);
    }
  }, [isDragging]);

  const handleMouseDown = useCallback(() => {
    setIsDragging(true);
  }, []);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Get data for active period
  const getActivePeriodData = () => {
    if (!activePeriod) return null;
    return monthlyData.find(item => item.period === activePeriod);
  };

  const activePeriodData = getActivePeriodData();

  // Calculate detailed metrics for each year
  const calculateDetailedMetrics = (yearData: MonthlyData[], year: string) => {
    const totalRevenue = yearData.reduce((sum, item) => {
      if (year === 'current') return sum + (item.currentYear || 0);
      if (year === 'previous1') return sum + (item.previousYear1 || 0);
      return sum + (item.previousYear2 || 0);
    }, 0);

    const totalCarCount = yearData.reduce((sum, item) => {
      if (year === 'current') return sum + (item.currentYearCarCount || 0);
      if (year === 'previous1') return sum + (item.previousYear1CarCount || 0);
      return sum + (item.previousYear2CarCount || 0);
    }, 0);

    const avgMargin = yearData.reduce((sum, item) => {
      if (year === 'current') return sum + (item.currentYearMargin || 0);
      if (year === 'previous1') return sum + (item.previousYear1Margin || 0);
      return sum + (item.previousYear2Margin || 0);
    }, 0) / yearData.length;

    const partsGross = Math.round(totalRevenue * 0.35);
    const laborGross = Math.round(totalRevenue * 0.55);
    const subletGross = Math.round(totalRevenue * 0.10);
    const totalGross = partsGross + laborGross + subletGross;
    const totalProfit = Math.round(totalGross * (avgMargin / 100));
    const avgRO = totalCarCount > 0 ? Math.round(totalGross / totalCarCount) : 0;

    return {
      totalRevenue,
      totalCarCount,
      partsGross,
      laborGross,
      subletGross,
      totalGross,
      totalProfit,
      avgMargin,
      avgRO
    };
  };

  // Calculate projections for current year
  const calculateProjections = () => {
    const currentMonthsCompleted = new Date().getMonth() + 1;
    const projectionMultiplier = 12 / currentMonthsCompleted;
    
    const currentMetrics = calculateDetailedMetrics(monthlyData, 'current');
    const previous1Metrics = calculateDetailedMetrics(monthlyData, 'previous1');
    const previous2Metrics = calculateDetailedMetrics(monthlyData, 'previous2');
    
    // Calculate moving average growth rate from past 2 years
    const avgPreviousRevenue = (previous1Metrics.totalRevenue + previous2Metrics.totalRevenue) / 2;
    const growthRate = currentMetrics.totalRevenue > 0 ? currentMetrics.totalRevenue / avgPreviousRevenue : 1;
    
    return {
      projectedRevenue: Math.round(currentMetrics.totalRevenue * projectionMultiplier * growthRate),
      projectedCarCount: Math.round(currentMetrics.totalCarCount * projectionMultiplier),
      projectedPartsGross: Math.round(currentMetrics.partsGross * projectionMultiplier),
      projectedLaborGross: Math.round(currentMetrics.laborGross * projectionMultiplier),
      projectedSubletGross: Math.round(currentMetrics.subletGross * projectionMultiplier),
      projectedTotalGross: Math.round(currentMetrics.totalGross * projectionMultiplier),
      projectedTotalProfit: Math.round(currentMetrics.totalProfit * projectionMultiplier),
    };
  };

  const currentMetrics = calculateDetailedMetrics(monthlyData, 'current');
  const previous1Metrics = calculateDetailedMetrics(monthlyData, 'previous1');
  const previous2Metrics = calculateDetailedMetrics(monthlyData, 'previous2');
  const projections = calculateProjections();
  
  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            onClick={() => navigate("/dashboard?tab=historical")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Historical Performance
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{decodedLocationName}</h1>
            <p className="text-muted-foreground">Monthly Sales Performance - Last 3 Years</p>
          </div>
        </div>
        
        {/* Legend with toggles */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-3">
                <Checkbox 
                  checked={showCurrentYear}
                  onCheckedChange={(checked) => setShowCurrentYear(checked === true)}
                  id="current-year"
                />
                <label htmlFor="current-year" className="flex items-center gap-2 cursor-pointer">
                  <div className="w-4 h-0.5 bg-status-success"></div>
                  <span>{currentYear} (Current)</span>
                </label>
              </div>
              <div className="flex items-center gap-3">
                <Checkbox 
                  checked={showPreviousYear1}
                  onCheckedChange={(checked) => setShowPreviousYear1(checked === true)}
                  id="previous-year-1"
                />
                <label htmlFor="previous-year-1" className="flex items-center gap-2 cursor-pointer">
                  <div className="w-4 h-0.5 bg-status-info"></div>
                  <span>{currentYear - 1}</span>
                </label>
              </div>
              <div className="flex items-center gap-3">
                <Checkbox 
                  checked={showPreviousYear2}
                  onCheckedChange={(checked) => setShowPreviousYear2(checked === true)}
                  id="previous-year-2"
                />
                <label htmlFor="previous-year-2" className="flex items-center gap-2 cursor-pointer">
                  <div className="w-4 h-0.5 bg-status-warning"></div>
                  <span>{currentYear - 2}</span>
                </label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Active Period Data Display */}
        {activePeriodData && (
          <Card className="bg-accent/50 border-primary/30">
            <CardHeader>
              <CardTitle className="text-lg">Timeline Data: {activePeriodData.period}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Sales Performance Data */}
                <div>
                  <h4 className="font-semibold mb-3 text-primary">Sales Performance</h4>
                  <div className="space-y-2">
                    {showCurrentYear && activePeriodData.currentYear && (
                      <div className="flex justify-between items-center p-2 bg-status-success/10 rounded">
                        <span className="text-status-success font-medium">{currentYear} (Current):</span>
                        <span className="font-bold">{formatCurrency(activePeriodData.currentYear)}</span>
                      </div>
                    )}
                    {showPreviousYear1 && (
                      <div className="flex justify-between items-center p-2 bg-status-info/10 rounded">
                        <span className="text-status-info font-medium">{currentYear - 1}:</span>
                        <span className="font-bold">{formatCurrency(activePeriodData.previousYear1)}</span>
                      </div>
                    )}
                    {showPreviousYear2 && (
                      <div className="flex justify-between items-center p-2 bg-status-warning/10 rounded">
                        <span className="text-status-warning font-medium">{currentYear - 2}:</span>
                        <span className="font-bold">{formatCurrency(activePeriodData.previousYear2)}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Profit Margin & Car Count Data */}
                <div>
                  <h4 className="font-semibold mb-3 text-primary">Profit Margin & Car Count</h4>
                  <div className="space-y-2">
                    {showCurrentYear && activePeriodData.currentYearMargin && activePeriodData.currentYearCarCount && (
                      <div className="p-2 bg-status-success/10 rounded">
                        <div className="flex justify-between items-center">
                          <span className="text-status-success font-medium">{currentYear} Margin:</span>
                          <span className="font-bold">{activePeriodData.currentYearMargin.toFixed(1)}%</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-status-success font-medium">{currentYear} Cars:</span>
                          <span className="font-bold">{activePeriodData.currentYearCarCount}</span>
                        </div>
                      </div>
                    )}
                    {showPreviousYear1 && (
                      <div className="p-2 bg-status-info/10 rounded">
                        <div className="flex justify-between items-center">
                          <span className="text-status-info font-medium">{currentYear - 1} Margin:</span>
                          <span className="font-bold">{activePeriodData.previousYear1Margin.toFixed(1)}%</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-status-info font-medium">{currentYear - 1} Cars:</span>
                          <span className="font-bold">{activePeriodData.previousYear1CarCount}</span>
                        </div>
                      </div>
                    )}
                    {showPreviousYear2 && (
                      <div className="p-2 bg-status-warning/10 rounded">
                        <div className="flex justify-between items-center">
                          <span className="text-status-warning font-medium">{currentYear - 2} Margin:</span>
                          <span className="font-bold">{activePeriodData.previousYear2Margin.toFixed(1)}%</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-status-warning font-medium">{currentYear - 2} Cars:</span>
                          <span className="font-bold">{activePeriodData.previousYear2CarCount}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Sales Performance Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={monthlyData}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 60,
                    bottom: 20,
                  }}
                  onMouseMove={handleChartMouseMove}
                  onMouseDown={handleMouseDown}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={() => setIsDragging(false)}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="period" 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickFormatter={formatCurrency}
                    domain={[0, 250000]}
                    ticks={[0, 50000, 100000, 150000, 200000, 250000]}
                  />
                  {activePeriod && (
                    <ReferenceLine 
                      x={activePeriod} 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      strokeDasharray="4 4"
                    />
                  )}
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  
                  {/* Two years ago - Yellow */}
                  {showPreviousYear2 && (
                    <Line 
                      type="monotone" 
                      dataKey="previousYear2" 
                      stroke="hsl(var(--status-warning))"
                      strokeWidth={3}
                      legendType="line"
                      name={`${currentYear - 2}`}
                      connectNulls={false}
                      dot={false}
                      activeDot={{ r: 6, stroke: "hsl(var(--status-warning))", strokeWidth: 2 }}
                    />
                  )}
                  
                  {/* Previous year - Blue */}
                  {showPreviousYear1 && (
                    <Line 
                      type="monotone" 
                      dataKey="previousYear1" 
                      stroke="hsl(var(--status-info))"
                      strokeWidth={3}
                      legendType="line"
                      name={`${currentYear - 1}`}
                      connectNulls={false}
                      dot={false}
                      activeDot={{ r: 6, stroke: "hsl(var(--status-info))", strokeWidth: 2 }}
                    />
                  )}
                  
                  {/* Current year - Green */}
                  {showCurrentYear && (
                    <Line 
                      type="monotone" 
                      dataKey="currentYear" 
                      stroke="hsl(var(--status-success))"
                      strokeWidth={3}
                      legendType="line"
                      name={`${currentYear} (Current)`}
                      connectNulls={false}
                      dot={false}
                      activeDot={{ r: 6, stroke: "hsl(var(--status-success))", strokeWidth: 2 }}
                    />
                  )}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Profit Margin & Car Count Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Profit Margin & Car Count Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={monthlyData}
                  margin={{
                    top: 20,
                    right: 60,
                    left: 60,
                    bottom: 20,
                  }}
                  onMouseMove={handleChartMouseMove}
                  onMouseDown={handleMouseDown}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={() => setIsDragging(false)}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="period" 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  {/* Left Y-axis for Profit Margin (%) */}
                  <YAxis 
                    yAxisId="margin"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickFormatter={(value) => `${value}%`}
                    domain={[30, 50]}
                    ticks={[30, 35, 40, 45, 50]}
                    label={{ value: 'Profit Margin (%)', angle: -90, position: 'insideLeft' }}
                  />
                  {/* Right Y-axis for Car Count */}
                  <YAxis 
                    yAxisId="cars"
                    orientation="right"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    domain={[0, 300]}
                    ticks={[0, 50, 100, 150, 200, 250, 300]}
                    label={{ value: 'Car Count', angle: 90, position: 'insideRight' }}
                  />
                  {activePeriod && (
                    <ReferenceLine 
                      x={activePeriod} 
                      yAxisId="margin"
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      strokeDasharray="4 4"
                    />
                  )}
                  <Tooltip content={<SynchronizedTooltip data={monthlyData} />} />
                  <Legend />
                  
                  {/* Profit Margin Lines (Solid) */}
                  {showPreviousYear2 && (
                    <Line 
                      yAxisId="margin"
                      type="monotone" 
                      dataKey="previousYear2Margin" 
                      stroke="hsl(var(--status-warning))"
                      strokeWidth={3}
                      strokeDasharray=""
                      legendType="line"
                      name={`${currentYear - 2} Margin`}
                      connectNulls={false}
                      dot={false}
                      activeDot={{ r: 6, stroke: "hsl(var(--status-warning))", strokeWidth: 2 }}
                    />
                  )}
                  
                  {showPreviousYear1 && (
                    <Line 
                      yAxisId="margin"
                      type="monotone" 
                      dataKey="previousYear1Margin" 
                      stroke="hsl(var(--status-info))"
                      strokeWidth={3}
                      strokeDasharray=""
                      legendType="line"
                      name={`${currentYear - 1} Margin`}
                      connectNulls={false}
                      dot={false}
                      activeDot={{ r: 6, stroke: "hsl(var(--status-info))", strokeWidth: 2 }}
                    />
                  )}
                  
                  {showCurrentYear && (
                    <Line 
                      yAxisId="margin"
                      type="monotone" 
                      dataKey="currentYearMargin" 
                      stroke="hsl(var(--status-success))"
                      strokeWidth={3}
                      strokeDasharray=""
                      legendType="line"
                      name={`${currentYear} Margin`}
                      connectNulls={false}
                      dot={false}
                      activeDot={{ r: 6, stroke: "hsl(var(--status-success))", strokeWidth: 2 }}
                    />
                  )}

                  {/* Car Count Lines (Dashed) */}
                  {showPreviousYear2 && (
                    <Line 
                      yAxisId="cars"
                      type="monotone" 
                      dataKey="previousYear2CarCount" 
                      stroke="hsl(var(--status-warning))"
                      strokeWidth={3}
                      strokeDasharray="5 5"
                      legendType="rect"
                      name={`${currentYear - 2} Cars`}
                      connectNulls={false}
                      dot={false}
                      activeDot={{ r: 6, stroke: "hsl(var(--status-warning))", strokeWidth: 2 }}
                    />
                  )}
                  
                  {showPreviousYear1 && (
                    <Line 
                      yAxisId="cars"
                      type="monotone" 
                      dataKey="previousYear1CarCount" 
                      stroke="hsl(var(--status-info))"
                      strokeWidth={3}
                      strokeDasharray="5 5"
                      legendType="rect"
                      name={`${currentYear - 1} Cars`}
                      connectNulls={false}
                      dot={false}
                      activeDot={{ r: 6, stroke: "hsl(var(--status-info))", strokeWidth: 2 }}
                    />
                  )}
                  
                  {showCurrentYear && (
                    <Line 
                      yAxisId="cars"
                      type="monotone" 
                      dataKey="currentYearCarCount" 
                      stroke="hsl(var(--status-success))"
                      strokeWidth={3}
                      strokeDasharray="5 5"
                      legendType="rect"
                      name={`${currentYear} Cars`}
                      connectNulls={false}
                      dot={false}
                      activeDot={{ r: 6, stroke: "hsl(var(--status-success))", strokeWidth: 2 }}
                    />
                  )}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Current Year Card */}
          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setExpandedCard(expandedCard === 'current' ? null : 'current')}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="text-center flex-1">
                  <div className="text-2xl font-bold text-status-success">
                    {formatCurrency(currentMetrics.totalRevenue)}
                  </div>
                  <p className="text-sm text-muted-foreground">{currentYear} YTD Revenue</p>
                </div>
                {expandedCard === 'current' ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </div>
              {expandedCard === 'current' && (
                <div className="mt-4 pt-4 border-t space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Car Count:</span>
                        <span className="font-medium">{currentMetrics.totalCarCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Parts Gross:</span>
                        <span className="font-medium">{formatCurrency(currentMetrics.partsGross)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Labor Gross:</span>
                        <span className="font-medium">{formatCurrency(currentMetrics.laborGross)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Sublet Gross:</span>
                        <span className="font-medium">{formatCurrency(currentMetrics.subletGross)}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Total Gross:</span>
                        <span className="font-medium">{formatCurrency(currentMetrics.totalGross)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Profit:</span>
                        <span className="font-medium">{formatCurrency(currentMetrics.totalProfit)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Avg Margin:</span>
                        <span className="font-medium">{currentMetrics.avgMargin.toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Avg RO:</span>
                        <span className="font-medium">{formatCurrency(currentMetrics.avgRO)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="pt-3 border-t">
                    <h4 className="font-semibold text-primary mb-2">Year-End Projections</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Car Count:</span>
                          <span className="font-medium">{projections.projectedCarCount}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Parts Gross:</span>
                          <span className="font-medium">{formatCurrency(projections.projectedPartsGross)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Labor Gross:</span>
                          <span className="font-medium">{formatCurrency(projections.projectedLaborGross)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Sublet Gross:</span>
                          <span className="font-medium">{formatCurrency(projections.projectedSubletGross)}</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Total Gross:</span>
                          <span className="font-medium">{formatCurrency(projections.projectedTotalGross)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Total Profit:</span>
                          <span className="font-medium text-status-success">{formatCurrency(projections.projectedTotalProfit)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Avg Margin:</span>
                          <span className="font-medium">{currentMetrics.avgMargin.toFixed(1)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Avg RO:</span>
                          <span className="font-medium">{formatCurrency(Math.round(projections.projectedTotalGross / projections.projectedCarCount))}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Previous Year 1 Card */}
          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setExpandedCard(expandedCard === 'previous1' ? null : 'previous1')}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="text-center flex-1">
                  <div className="text-2xl font-bold text-status-info">
                    {formatCurrency(previous1Metrics.totalRevenue)}
                  </div>
                  <p className="text-sm text-muted-foreground">{currentYear - 1} Total Revenue</p>
                </div>
                {expandedCard === 'previous1' ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </div>
              {expandedCard === 'previous1' && (
                <div className="mt-4 pt-4 border-t space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Car Count:</span>
                        <span className="font-medium">{previous1Metrics.totalCarCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Parts Gross:</span>
                        <span className="font-medium">{formatCurrency(previous1Metrics.partsGross)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Labor Gross:</span>
                        <span className="font-medium">{formatCurrency(previous1Metrics.laborGross)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Sublet Gross:</span>
                        <span className="font-medium">{formatCurrency(previous1Metrics.subletGross)}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Total Gross:</span>
                        <span className="font-medium">{formatCurrency(previous1Metrics.totalGross)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Profit:</span>
                        <span className="font-medium">{formatCurrency(previous1Metrics.totalProfit)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Avg Margin:</span>
                        <span className="font-medium">{previous1Metrics.avgMargin.toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Avg RO:</span>
                        <span className="font-medium">{formatCurrency(previous1Metrics.avgRO)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Previous Year 2 Card */}
          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setExpandedCard(expandedCard === 'previous2' ? null : 'previous2')}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="text-center flex-1">
                  <div className="text-2xl font-bold text-status-warning">
                    {formatCurrency(previous2Metrics.totalRevenue)}
                  </div>
                  <p className="text-sm text-muted-foreground">{currentYear - 2} Total Revenue</p>
                </div>
                {expandedCard === 'previous2' ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </div>
              {expandedCard === 'previous2' && (
                <div className="mt-4 pt-4 border-t space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Car Count:</span>
                        <span className="font-medium">{previous2Metrics.totalCarCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Parts Gross:</span>
                        <span className="font-medium">{formatCurrency(previous2Metrics.partsGross)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Labor Gross:</span>
                        <span className="font-medium">{formatCurrency(previous2Metrics.laborGross)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Sublet Gross:</span>
                        <span className="font-medium">{formatCurrency(previous2Metrics.subletGross)}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Total Gross:</span>
                        <span className="font-medium">{formatCurrency(previous2Metrics.totalGross)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Profit:</span>
                        <span className="font-medium">{formatCurrency(previous2Metrics.totalProfit)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Avg Margin:</span>
                        <span className="font-medium">{previous2Metrics.avgMargin.toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Avg RO:</span>
                        <span className="font-medium">{formatCurrency(previous2Metrics.avgRO)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}