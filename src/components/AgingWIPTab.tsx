import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface WIPData {
  id: string;
  roNumber: string;
  dateCreated: string;
  modelYear: number;
  make: string;
  model: string;
  customerName: string;
  depositCollected: number;
  amountOwed: number;
  daysInShop: number;
  status: "urgent" | "warning" | "normal";
  location: string;
}

interface LocationSummary {
  name: string;
  totalCars: number;
  totalDeposits: number;
  totalOwed: number;
  urgentCount: number;
  warningCount: number;
}

// Mock WIP data
const mockWIPData: WIPData[] = [
  {
    id: "1",
    roNumber: "RO-2024-001",
    dateCreated: "2024-12-15",
    modelYear: 2019,
    make: "Toyota",
    model: "Camry",
    customerName: "John Smith",
    depositCollected: 0,
    amountOwed: 1200,
    daysInShop: 21,
    status: "urgent",
    location: "Downtown Shop"
  },
  {
    id: "2",
    roNumber: "RO-2024-002",
    dateCreated: "2024-12-20",
    modelYear: 2021,
    make: "Honda",
    model: "Civic",
    customerName: "Sarah Johnson",
    depositCollected: 0,
    amountOwed: 850,
    daysInShop: 16,
    status: "warning",
    location: "Westside Auto"
  },
  {
    id: "3",
    roNumber: "RO-2024-003",
    dateCreated: "2024-12-28",
    modelYear: 2020,
    make: "Ford",
    model: "F-150",
    customerName: "Mike Davis",
    depositCollected: 0,
    amountOwed: 2100,
    daysInShop: 8,
    status: "normal",
    location: "Downtown Shop"
  },
  {
    id: "4",
    roNumber: "RO-2024-004",
    dateCreated: "2025-01-02",
    modelYear: 2018,
    make: "Chevrolet",
    model: "Silverado",
    customerName: "Lisa Wilson",
    depositCollected: 0,
    amountOwed: 1650,
    daysInShop: 3,
    status: "normal",
    location: "Northside Service"
  },
  {
    id: "5",
    roNumber: "RO-2024-005",
    dateCreated: "2024-12-10",
    modelYear: 2017,
    make: "BMW",
    model: "3 Series",
    customerName: "Robert Brown",
    depositCollected: 0,
    amountOwed: 3200,
    daysInShop: 26,
    status: "urgent",
    location: "Westside Auto"
  },
  {
    id: "6",
    roNumber: "RO-2024-006",
    dateCreated: "2024-12-25",
    modelYear: 2022,
    make: "Nissan",
    model: "Altima",
    customerName: "Jennifer Lee",
    depositCollected: 0,
    amountOwed: 920,
    daysInShop: 11,
    status: "warning",
    location: "Eastside Motors"
  },
  {
    id: "7",
    roNumber: "RO-2024-007",
    dateCreated: "2025-01-01",
    modelYear: 2019,
    make: "Hyundai",
    model: "Elantra",
    customerName: "David Kim",
    depositCollected: 0,
    amountOwed: 680,
    daysInShop: 4,
    status: "normal",
    location: "Northside Service"
  },
  {
    id: "8",
    roNumber: "RO-2024-008",
    dateCreated: "2024-12-18",
    modelYear: 2020,
    make: "Subaru",
    model: "Outback",
    customerName: "Amanda Garcia",
    depositCollected: 0,
    amountOwed: 1400,
    daysInShop: 18,
    status: "warning",
    location: "Eastside Motors"
  }
];

export function AgingWIPTab() {
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [wipData, setWipData] = useState<WIPData[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch aging WIP data on component mount
  useEffect(() => {
    const fetchAgingWIPData = async () => {
      try {
        setLoading(true);
        
        // First try to get data from database
        const { data: dbData, error: dbError } = await supabase
          .from('aging_wip')
          .select('*')
          .order('days_since_created', { ascending: false });

        if (dbError) {
          console.error('Error fetching from database:', dbError);
          throw dbError;
        }

        if (dbData && dbData.length > 0) {
          console.log(`Loaded ${dbData.length} aging WIP records from database`);
          
          // Transform database data to match expected format
          const transformedData = transformApiDataToWipData(dbData.map(record => ({
            repairOrderId: record.repair_order_id,
            repairOrderNumber: record.repair_order_number,
            customerName: record.customer_name,
            vehicleInfo: record.vehicle_info,
            createdDate: record.created_date,
            daysSinceCreated: record.days_since_created,
            agingBucket: record.aging_bucket,
            totalSales: record.total_sales,
            laborSales: record.labor_sales,
            partsSales: record.parts_sales,
            subletSales: record.sublet_sales,
            status: record.status,
            label: record.label || '',
            customLabel: record.custom_label || '',
            technicianId: record.technician_id || '',
            serviceWriterId: record.service_writer_id || '',
            shopName: record.shop_name,
          })));

          setWipData(transformedData);
          setLoading(false);
          return;
        }

        console.log('No data in database, triggering sync...');
        // If no data in database, trigger sync
        const { data, error } = await supabase.functions.invoke('sync-aging-wip');
        
        if (error) {
          console.error('Error calling sync function:', error);
          throw error;
        }

        if (data?.data) {
          const transformedData = transformApiDataToWipData(data.data);
          setWipData(transformedData);
          toast.success('Aging WIP data updated');
        } else {
          throw new Error('No data returned from sync function');
        }

      } catch (error) {
        console.error('Error in fetchAgingWIPData:', error);
        toast.error('Failed to fetch aging WIP data');
        setWipData(mockWIPData); // Fallback to mock data
      } finally {
        setLoading(false);
      }
    };

    fetchAgingWIPData();
  }, []);

  // Transform API data to match WIPData interface
  const transformApiDataToWipData = (apiData: any[]): WIPData[] => {
    return apiData.map((item, index) => ({
      id: item.repairOrderId || index.toString(),
      roNumber: item.repairOrderNumber || 'N/A',
      dateCreated: item.createdDate || new Date().toISOString(),
      modelYear: parseInt(item.vehicleInfo?.split(' ')[0] || '2020'),
      make: item.vehicleInfo?.split(' ')[1] || 'Unknown',
      model: item.vehicleInfo?.split(' ').slice(2).join(' ') || 'Unknown',
      customerName: item.customerName || 'Unknown Customer',
      depositCollected: 0, // No deposit data available from Tekmetric
      amountOwed: item.totalSales || 0,
      daysInShop: item.daysSinceCreated || 0,
      status: item.daysSinceCreated >= 20 ? "urgent" : item.daysSinceCreated >= 10 ? "warning" : "normal",
      location: item.shopName || 'Unknown Location'
    }));
  };

  const formatCurrency = (value: number) => `$${value.toLocaleString()}`;
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const getStatusBadge = (daysInShop: number, status: string) => {
    if (daysInShop >= 20) {
      return <Badge variant="destructive" className="text-xs">URGENT ({daysInShop} days)</Badge>;
    } else if (daysInShop >= 10) {
      return <Badge variant="secondary" className="text-xs bg-status-warning/20 text-status-warning border-status-warning">WARNING ({daysInShop} days)</Badge>;
    } else {
      return <Badge variant="outline" className="text-xs">NORMAL ({daysInShop} days)</Badge>;
    }
  };

  const getRowClass = (status: string) => {
    switch (status) {
      case "urgent":
        return "bg-status-critical/10 hover:bg-status-critical/20";
      case "warning":
        return "bg-status-warning/10 hover:bg-status-warning/20";
      default:
        return "hover:bg-muted/50";
    }
  };

  // Get unique locations and create summaries
  const locations = Array.from(new Set(wipData.map(item => item.location)));
  const locationSummaries: LocationSummary[] = locations.map(location => {
    const locationData = wipData.filter(item => item.location === location);
    return {
      name: location,
      totalCars: locationData.length,
      totalDeposits: locationData.reduce((sum, item) => sum + item.depositCollected, 0),
      totalOwed: locationData.reduce((sum, item) => sum + item.amountOwed, 0),
      urgentCount: locationData.filter(item => item.daysInShop >= 20).length,
      warningCount: locationData.filter(item => item.daysInShop >= 10 && item.daysInShop < 20).length,
    };
  });

  // Filter data by selected location
  const filteredData = selectedLocation 
    ? wipData.filter(item => item.location === selectedLocation)
    : wipData;

  // Sort by days in shop (oldest first)
  const sortedData = [...filteredData].sort((a, b) => b.daysInShop - a.daysInShop);

  // Calculate totals for filtered data
  const totalDeposits = filteredData.reduce((sum, item) => sum + item.depositCollected, 0);
  const totalOwed = filteredData.reduce((sum, item) => sum + item.amountOwed, 0);
  const totalValue = totalDeposits + totalOwed;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading aging WIP data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Aging Work In Progress</h2>
          <p className="text-sm text-muted-foreground">
            {selectedLocation ? `Vehicles at ${selectedLocation}` : "Select a location to view vehicles"}
          </p>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <div className="text-center">
            <div className="font-semibold text-foreground">{filteredData.length}</div>
            <div className="text-muted-foreground">Cars Shown</div>
          </div>
          <Button
            variant="outline"
            onClick={async () => {
              setLoading(true);
              try {
                const { data, error } = await supabase.functions.invoke('sync-aging-wip');
                if (error) {
                  toast.error('Failed to refresh data');
                } else {
                  // Wait a moment and refresh from database
                  setTimeout(async () => {
                    const { data: dbData } = await supabase
                      .from('aging_wip')
                      .select('*')
                      .order('days_since_created', { ascending: false });

                    if (dbData && dbData.length > 0) {
                      const transformedData = transformApiDataToWipData(dbData.map(record => ({
                        repairOrderId: record.repair_order_id,
                        repairOrderNumber: record.repair_order_number,
                        customerName: record.customer_name,
                        vehicleInfo: record.vehicle_info,
                        createdDate: record.created_date,
                        daysSinceCreated: record.days_since_created,
                        agingBucket: record.aging_bucket,
                        totalSales: record.total_sales,
                        laborSales: record.labor_sales,
                        partsSales: record.parts_sales,
                        subletSales: record.sublet_sales,
                        status: record.status,
                        label: record.label,
                        customLabel: record.custom_label,
                        technicianId: record.technician_id,
                        serviceWriterId: record.service_writer_id,
                        shopName: record.shop_name,
                      })));
                      setWipData(transformedData);
                      toast.success('Data refreshed successfully');
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
            className="text-sm"
          >
            {loading ? 'Refreshing...' : 'Refresh Data'}
          </Button>
          {selectedLocation && (
            <Button
              variant="outline"
              onClick={() => setSelectedLocation(null)}
              className="text-sm"
            >
              View All Locations
            </Button>
          )}
        </div>
      </div>

      {/* Location Selection */}
      {!selectedLocation && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {locationSummaries.map((location) => (
            <Card 
              key={location.name} 
              className="cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => setSelectedLocation(location.name)}
            >
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-foreground">{location.name}</h3>
                    <Badge variant="outline" className="text-xs">
                      {location.totalCars} cars
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="text-center p-2 bg-status-success/10 rounded">
                      <div className="font-medium text-status-success">
                        {formatCurrency(location.totalDeposits)}
                      </div>
                      <div className="text-xs text-muted-foreground">Deposits</div>
                    </div>
                    <div className="text-center p-2 bg-status-warning/10 rounded">
                      <div className="font-medium text-status-warning">
                        {formatCurrency(location.totalOwed)}
                      </div>
                      <div className="text-xs text-muted-foreground">Owed</div>
                    </div>
                  </div>

                  {(location.urgentCount > 0 || location.warningCount > 0) && (
                    <div className="flex items-center gap-2 text-xs">
                      {location.urgentCount > 0 && (
                        <Badge variant="destructive" className="text-xs">
                          {location.urgentCount} urgent
                        </Badge>
                      )}
                      {location.warningCount > 0 && (
                        <Badge variant="secondary" className="text-xs bg-status-warning/20 text-status-warning border-status-warning">
                          {location.warningCount} warning
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Show detailed view only when location is selected */}
      {selectedLocation && (
        <div className="space-y-6">

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-status-success">
                {formatCurrency(totalDeposits)}
              </div>
              <p className="text-sm text-muted-foreground">Total Deposits Collected</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-status-warning">
                {formatCurrency(totalOwed)}
              </div>
              <p className="text-sm text-muted-foreground">Total Amount Owed</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-brand-primary">
                {formatCurrency(totalValue)}
              </div>
              <p className="text-sm text-muted-foreground">Total Job Value</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Color Legend */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-status-critical/20 border border-status-critical rounded"></div>
              <span>Urgent: 20+ days in shop</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-status-warning/20 border border-status-warning rounded"></div>
              <span>Warning: 10-19 days in shop</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-border border border-border rounded"></div>
              <span>Normal: Less than 10 days</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* WIP Table */}
      <Card>
        <CardHeader>
          <CardTitle>Work In Progress Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[100px]">RO Date</TableHead>
                  <TableHead className="min-w-[120px]">RO Number</TableHead>
                  <TableHead className="min-w-[80px]">Year</TableHead>
                  <TableHead className="min-w-[100px]">Make/Model</TableHead>
                  <TableHead className="min-w-[120px]">Customer</TableHead>
                  <TableHead className="min-w-[100px] text-right">Deposit</TableHead>
                  <TableHead className="min-w-[100px] text-right">Amount Owed</TableHead>
                  <TableHead className="min-w-[120px]">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedData.map((item) => (
                  <TableRow key={item.id} className={cn("transition-colors", getRowClass(item.status))}>
                    <TableCell className="font-medium">
                      {formatDate(item.dateCreated)}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {item.roNumber}
                    </TableCell>
                    <TableCell>
                      {item.modelYear}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{item.make}</div>
                        <div className="text-sm text-muted-foreground">{item.model}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {item.customerName}
                    </TableCell>
                    <TableCell className="text-right font-medium text-status-success">
                      {formatCurrency(item.depositCollected)}
                    </TableCell>
                    <TableCell className="text-right font-medium text-status-warning">
                      {formatCurrency(item.amountOwed)}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(item.daysInShop, item.status)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Totals Row */}
      <Card className="bg-muted/30">
        <CardContent className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-sm text-muted-foreground">Cars in Shop</div>
              <div className="text-xl font-bold text-foreground">{wipData.length}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Avg Days in Shop</div>
              <div className="text-xl font-bold text-foreground">
                {wipData.length > 0 ? Math.round(wipData.reduce((sum, item) => sum + item.daysInShop, 0) / wipData.length) : 0}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Total Deposits</div>
              <div className="text-xl font-bold text-status-success">{formatCurrency(totalDeposits)}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Total Owed</div>
              <div className="text-xl font-bold text-status-warning">{formatCurrency(totalOwed)}</div>
            </div>
          </div>
        </CardContent>
      </Card>
        </div>
      )}
    </div>
  );
}