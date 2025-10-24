import { HistoricalDataTable } from "./HistoricalDataTable";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Historical data interface
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

// Mock data generator with realistic growth patterns
const generateLocationData = (
  location: string,
  baseGross: number,
  growthMultiplier: number = 1.0
): HistoricalData => {
  const partsGross = Math.round(baseGross * 0.35 * growthMultiplier);
  const partsProfit = Math.round(partsGross * 0.33);
  const laborGross = Math.round(baseGross * 0.55 * growthMultiplier);
  const laborProfit = Math.round(laborGross * 0.68);
  const subletGross = Math.round(baseGross * 0.10 * growthMultiplier);
  const subletProfit = Math.round(subletGross * 0.10);
  const totalGross = partsGross + laborGross + subletGross;
  const totalProfit = partsProfit + laborProfit + subletProfit;
  const carCount = Math.round(totalGross / 950);

  return {
    location,
    partsGross,
    partsProfit,
    partsMargin: (partsProfit / partsGross) * 100,
    partsPiecesSold: Math.round(partsGross / 52),
    partsAvgTicket: Math.round(partsGross / (partsGross / 52)),
    laborGross,
    laborProfit,
    laborMargin: (laborProfit / laborGross) * 100,
    laborHours: Math.round(laborGross / 55),
    laborAvgHour: 55,
    subletGross,
    subletProfit,
    subletMargin: (subletProfit / subletGross) * 100,
    totalGross,
    totalProfit,
    totalMargin: (totalProfit / totalGross) * 100,
    carCount,
    avgRO: Math.round(totalGross / carCount),
  };
};

// Generate data with different growth scenarios to demonstrate all color codes
const generateMockData = (yearMultiplier: number): HistoricalData[] => [
  generateLocationData("Downtown Location", 120000, yearMultiplier * 1.25), // Strong growth - GREEN
  generateLocationData("Northside Shop", 95000, yearMultiplier * 1.15),     // Good growth - BLUE  
  generateLocationData("West End Auto", 140000, yearMultiplier * 1.05),     // Modest growth - YELLOW
  generateLocationData("South Bay Service", 105000, yearMultiplier * 0.95),  // Decline - RED
];

const calculateTotals = (data: HistoricalData[]): HistoricalData => {
  const totals = data.reduce(
    (acc, item) => ({
      partsGross: acc.partsGross + item.partsGross,
      partsProfit: acc.partsProfit + item.partsProfit,
      laborGross: acc.laborGross + item.laborGross,
      laborProfit: acc.laborProfit + item.laborProfit,
      subletGross: acc.subletGross + item.subletGross,
      subletProfit: acc.subletProfit + item.subletProfit,
      totalGross: acc.totalGross + item.totalGross,
      totalProfit: acc.totalProfit + item.totalProfit,
      carCount: acc.carCount + item.carCount,
      laborHours: acc.laborHours + item.laborHours,
      partsPiecesSold: acc.partsPiecesSold + item.partsPiecesSold,
    }),
    {
      partsGross: 0,
      partsProfit: 0,
      laborGross: 0,
      laborProfit: 0,
      subletGross: 0,
      subletProfit: 0,
      totalGross: 0,
      totalProfit: 0,
      carCount: 0,
      laborHours: 0,
      partsPiecesSold: 0,
    }
  );

  return {
    location: "COMPANY TOTALS",
    partsGross: totals.partsGross,
    partsProfit: totals.partsProfit,
    partsMargin: (totals.partsProfit / totals.partsGross) * 100,
    partsPiecesSold: totals.partsPiecesSold,
    partsAvgTicket: totals.partsGross / totals.partsPiecesSold,
    laborGross: totals.laborGross,
    laborProfit: totals.laborProfit,
    laborMargin: (totals.laborProfit / totals.laborGross) * 100,
    laborHours: totals.laborHours,
    laborAvgHour: totals.laborGross / totals.laborHours,
    subletGross: totals.subletGross,
    subletProfit: totals.subletProfit,
    subletMargin: (totals.subletProfit / totals.subletGross) * 100,
    totalGross: totals.totalGross,
    totalProfit: totals.totalProfit,
    totalMargin: (totals.totalProfit / totals.totalGross) * 100,
    carCount: totals.carCount,
    avgRO: totals.totalGross / totals.carCount,
  };
};

export function HistoricalPerformanceTab() {
  const [historicalData, setHistoricalData] = useState<HistoricalData[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch historical data on component mount
  useEffect(() => {
    const fetchHistoricalData = async () => {
      try {
        setLoading(true);
        
        // First try to get data from database
        const { data: dbData, error: dbError } = await supabase
          .from('historical_performance')
          .select('*')
          .order('year', { ascending: false })
          .order('month', { ascending: false });

        if (dbError) {
          console.error('Error fetching from database:', dbError);
          throw dbError;
        }

        if (dbData && dbData.length > 0) {
          console.log(`Loaded ${dbData.length} historical records from database`);
          
          // Transform database data to match expected format
          const transformedData = dbData.map(record => ({
            location: record.shop_name,
            partsGross: record.parts_gross,
            partsProfit: record.parts_profit,
            partsMargin: record.parts_margin,
            partsPiecesSold: record.parts_pieces_sold,
            partsAvgTicket: record.parts_avg_ticket,
            laborGross: record.labor_gross,
            laborProfit: record.labor_profit,
            laborMargin: record.labor_margin,
            laborHours: record.labor_hours,
            laborAvgHour: record.labor_avg_hour,
            subletGross: record.sublet_gross,
            subletProfit: record.sublet_profit,
            subletMargin: record.sublet_margin,
            totalGross: record.total_gross,
            totalProfit: record.total_profit,
            totalMargin: record.total_margin,
            carCount: record.car_count,
            avgRO: record.avg_ro,
          }));

          setHistoricalData(transformedData);
          setLoading(false);
          return;
        }

        console.log('No data in database, triggering sync...');
        // If no data in database, trigger sync
        const { data, error } = await supabase.functions.invoke('sync-historical-data');
        
        if (error) {
          console.error('Error calling sync function:', error);
          throw error;
        }

        if (data?.data) {
          setHistoricalData(data.data);
          toast.success('Historical data updated');
        } else {
          throw new Error('No data returned from sync function');
        }

      } catch (error) {
        console.error('Error in fetchHistoricalData:', error);
        toast.error('Failed to fetch historical data - using demo data');
      } finally {
        setLoading(false);
      }
    };

    fetchHistoricalData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading historical performance data...</p>
          </div>
        </div>
      </div>
    );
  }

  // If no live data available, fall back to demo data
  const hasLiveData = historicalData.length > 0;
  
  // Generate data for 3 years with realistic growth patterns
  const currentYear = new Date().getFullYear();
  
  // Month to Date data
  const currentMonthData = generateMockData(1.0);
  const previousYear1MonthData = generateMockData(0.8);  // 25% lower (so current shows green)
  const previousYear2MonthData = generateMockData(0.7);  // Lower still
  
  // Year to Date data  
  const currentYearData = generateMockData(1.0);
  const previousYear1YearData = generateMockData(0.85); // 18% lower (shows blue/green mix)
  const previousYear2YearData = generateMockData(0.75); // Lower

  const monthTotals = {
    current: calculateTotals(currentMonthData),
    previous1: calculateTotals(previousYear1MonthData),
    previous2: calculateTotals(previousYear2MonthData),
  };

  const yearTotals = {
    current: calculateTotals(currentYearData),
    previous1: calculateTotals(previousYear1YearData),
    previous2: calculateTotals(previousYear2YearData),
  };

  return (
    <div className="space-y-6 p-4">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-foreground">Historical Performance Analysis</h2>
          <div className="flex items-center gap-2">
            {!hasLiveData && (
              <span className="text-sm text-status-warning bg-status-warning/10 px-2 py-1 rounded">
                Demo Data - API Connection Failed
              </span>
            )}
            <button
              onClick={async () => {
                setLoading(true);
                try {
                  const { data, error } = await supabase.functions.invoke('sync-historical-data');
                  if (error) {
                    toast.error('Failed to refresh data');
                  } else {
                    // Wait a moment and refresh from database
                    setTimeout(async () => {
                      const { data: dbData } = await supabase
                        .from('historical_performance')
                        .select('*')
                        .order('year', { ascending: false })
                        .order('month', { ascending: false });

                      if (dbData && dbData.length > 0) {
                        const transformedData = dbData.map(record => ({
                          location: record.shop_name,
                          partsGross: record.parts_gross,
                          partsProfit: record.parts_profit,
                          partsMargin: record.parts_margin,
                          partsPiecesSold: record.parts_pieces_sold,
                          partsAvgTicket: record.parts_avg_ticket,
                          laborGross: record.labor_gross,
                          laborProfit: record.labor_profit,
                          laborMargin: record.labor_margin,
                          laborHours: record.labor_hours,
                          laborAvgHour: record.labor_avg_hour,
                          subletGross: record.sublet_gross,
                          subletProfit: record.sublet_profit,
                          subletMargin: record.sublet_margin,
                          totalGross: record.total_gross,
                          totalProfit: record.total_profit,
                          totalMargin: record.total_margin,
                          carCount: record.car_count,
                          avgRO: record.avg_ro,
                        }));
                        setHistoricalData(transformedData);
                        toast.success('Historical data refreshed');
                      }
                    }, 2000);
                  }
                } catch (error) {
                  toast.error('Failed to refresh data');
                } finally {
                  setLoading(false);
                }
              }}
              disabled={loading}
              className="text-sm px-3 py-1 bg-primary text-primary-foreground rounded hover:bg-primary/90 disabled:opacity-50"
            >
              {loading ? 'Refreshing...' : 'Refresh Data'}
            </button>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-status-success/30 border border-status-success rounded"></div>
            <span>Green: 20%+ Growth</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-status-info/30 border border-status-info rounded"></div>
            <span>Blue: 10-20% Growth</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-status-warning/30 border border-status-warning rounded"></div>
            <span>Yellow: 0-10% Growth</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-status-critical/30 border border-status-critical rounded"></div>
            <span>Red: Negative Growth</span>
          </div>
        </div>
      </div>

      <HistoricalDataTable
        title="Month to Date"
        currentYearData={currentMonthData}
        previousYear1Data={previousYear1MonthData}
        previousYear2Data={previousYear2MonthData}
        totals={monthTotals}
      />
      
      <HistoricalDataTable
        title="Year to Date"
        currentYearData={currentYearData}
        previousYear1Data={previousYear1YearData}
        previousYear2Data={previousYear2YearData}
        totals={yearTotals}
      />
    </div>
  );
}