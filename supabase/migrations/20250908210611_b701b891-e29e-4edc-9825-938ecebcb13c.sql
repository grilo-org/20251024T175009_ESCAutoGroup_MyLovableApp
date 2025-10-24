-- Create table for historical performance data
CREATE TABLE public.historical_performance (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  shop_id TEXT NOT NULL,
  shop_name TEXT NOT NULL,
  year INTEGER NOT NULL,
  month INTEGER NOT NULL,
  period TEXT NOT NULL,
  parts_gross INTEGER NOT NULL DEFAULT 0,
  parts_profit INTEGER NOT NULL DEFAULT 0,
  parts_margin DECIMAL(5,2) NOT NULL DEFAULT 0,
  parts_pieces_sold INTEGER NOT NULL DEFAULT 0,
  parts_avg_ticket INTEGER NOT NULL DEFAULT 0,
  labor_gross INTEGER NOT NULL DEFAULT 0,
  labor_profit INTEGER NOT NULL DEFAULT 0,
  labor_margin DECIMAL(5,2) NOT NULL DEFAULT 0,
  labor_hours DECIMAL(8,2) NOT NULL DEFAULT 0,
  labor_avg_hour INTEGER NOT NULL DEFAULT 0,
  sublet_gross INTEGER NOT NULL DEFAULT 0,
  sublet_profit INTEGER NOT NULL DEFAULT 0,
  sublet_margin DECIMAL(5,2) NOT NULL DEFAULT 0,
  total_gross INTEGER NOT NULL DEFAULT 0,
  total_profit INTEGER NOT NULL DEFAULT 0,
  total_margin DECIMAL(5,2) NOT NULL DEFAULT 0,
  car_count INTEGER NOT NULL DEFAULT 0,
  avg_ro INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(shop_id, year, month)
);

-- Create table for aging WIP data
CREATE TABLE public.aging_wip (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  shop_id TEXT NOT NULL,
  shop_name TEXT NOT NULL,
  repair_order_id TEXT NOT NULL,
  repair_order_number TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  vehicle_info TEXT NOT NULL,
  created_date TIMESTAMP WITH TIME ZONE NOT NULL,
  days_since_created INTEGER NOT NULL,
  aging_bucket TEXT NOT NULL,
  total_sales INTEGER NOT NULL DEFAULT 0,
  labor_sales INTEGER NOT NULL DEFAULT 0,
  parts_sales INTEGER NOT NULL DEFAULT 0,
  sublet_sales INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL,
  label TEXT,
  custom_label TEXT,
  technician_id TEXT,
  service_writer_id TEXT,
  synced_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(repair_order_id)
);

-- Enable Row Level Security
ALTER TABLE public.historical_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aging_wip ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (since this is business analytics data)
CREATE POLICY "Anyone can view historical performance data" 
ON public.historical_performance 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can view aging WIP data" 
ON public.aging_wip 
FOR SELECT 
USING (true);

-- Service role can do everything
CREATE POLICY "Service role can manage historical performance data" 
ON public.historical_performance 
FOR ALL 
USING (true)
WITH CHECK (true);

CREATE POLICY "Service role can manage aging WIP data" 
ON public.aging_wip 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX idx_historical_performance_shop_period ON public.historical_performance(shop_id, year, month);
CREATE INDEX idx_historical_performance_period ON public.historical_performance(year, month);
CREATE INDEX idx_aging_wip_shop ON public.aging_wip(shop_id);
CREATE INDEX idx_aging_wip_aging_bucket ON public.aging_wip(aging_bucket);
CREATE INDEX idx_aging_wip_days ON public.aging_wip(days_since_created);

-- Create trigger for updated_at
CREATE TRIGGER update_historical_performance_updated_at
BEFORE UPDATE ON public.historical_performance
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add replica identity for realtime updates
ALTER TABLE public.historical_performance REPLICA IDENTITY FULL;
ALTER TABLE public.aging_wip REPLICA IDENTITY FULL;