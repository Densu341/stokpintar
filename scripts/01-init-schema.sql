-- Create users table (extending Supabase auth)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT auth.uid(),
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create sales_data table
CREATE TABLE IF NOT EXISTS sales_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_name TEXT NOT NULL,
  quantity_sold INTEGER NOT NULL CHECK (quantity_sold > 0),
  sale_date DATE NOT NULL,
  price_per_unit DECIMAL(10, 2) NOT NULL CHECK (price_per_unit > 0),
  source_platform TEXT DEFAULT 'unknown',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT valid_quantity CHECK (quantity_sold > 0)
);

-- Create inventory_status table
CREATE TABLE IF NOT EXISTS inventory_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_name TEXT NOT NULL,
  current_stock INTEGER NOT NULL CHECK (current_stock >= 0),
  last_reorder_date DATE,
  last_reorder_quantity INTEGER,
  burn_rate DECIMAL(10, 4) DEFAULT 0,
  estimated_out_of_stock_date DATE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, product_name)
);

-- Create alerts table
CREATE TABLE IF NOT EXISTS alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_name TEXT NOT NULL,
  alert_type TEXT NOT NULL CHECK (alert_type IN ('reorder_soon', 'critical', 'trend_change', 'opportunity')),
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_sales_data_user_id ON sales_data(user_id);
CREATE INDEX IF NOT EXISTS idx_sales_data_user_product_date ON sales_data(user_id, product_name, sale_date);
CREATE INDEX IF NOT EXISTS idx_sales_data_sale_date ON sales_data(sale_date);
CREATE INDEX IF NOT EXISTS idx_inventory_status_user_id ON inventory_status(user_id);
CREATE INDEX IF NOT EXISTS idx_alerts_user_id ON alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_alerts_created_at ON alerts(created_at);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for users
CREATE POLICY "Users can read their own data" 
  ON users FOR SELECT 
  USING (auth.uid() = id);

-- Create RLS policies for sales_data
CREATE POLICY "Users can insert their own sales data" 
  ON sales_data FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read their own sales data" 
  ON sales_data FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own sales data" 
  ON sales_data FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sales data" 
  ON sales_data FOR DELETE 
  USING (auth.uid() = user_id);

-- Create RLS policies for inventory_status
CREATE POLICY "Users can insert their own inventory data" 
  ON inventory_status FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read their own inventory data" 
  ON inventory_status FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own inventory data" 
  ON inventory_status FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own inventory data" 
  ON inventory_status FOR DELETE 
  USING (auth.uid() = user_id);

-- Create RLS policies for alerts
CREATE POLICY "Users can read their own alerts" 
  ON alerts FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own alerts" 
  ON alerts FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert alerts for users" 
  ON alerts FOR INSERT 
  WITH CHECK (TRUE);
