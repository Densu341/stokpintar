import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function migrate() {
  try {
    console.log('[v0] Starting database migration...');

    // Create users table
    const { error: usersError } = await supabase.rpc('execute_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS users (
          id UUID PRIMARY KEY DEFAULT auth.uid(),
          email TEXT UNIQUE NOT NULL,
          created_at TIMESTAMP DEFAULT NOW(),
          FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
        );
      `
    });
    if (usersError) console.log('[v0] Users table (may already exist):', usersError.message);
    else console.log('[v0] Users table created');

    // Create sales_data table
    const { error: salesError } = await supabase.rpc('execute_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS sales_data (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          product_name TEXT NOT NULL,
          quantity_sold INTEGER NOT NULL CHECK (quantity_sold > 0),
          sale_date DATE NOT NULL,
          price_per_unit DECIMAL(10, 2) NOT NULL CHECK (price_per_unit > 0),
          source_platform TEXT DEFAULT 'unknown',
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        );
      `
    });
    if (salesError) console.log('[v0] Sales data table (may already exist):', salesError.message);
    else console.log('[v0] Sales data table created');

    // Create inventory_status table
    const { error: inventoryError } = await supabase.rpc('execute_sql', {
      sql: `
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
      `
    });
    if (inventoryError) console.log('[v0] Inventory status table (may already exist):', inventoryError.message);
    else console.log('[v0] Inventory status table created');

    // Create alerts table
    const { error: alertsError } = await supabase.rpc('execute_sql', {
      sql: `
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
      `
    });
    if (alertsError) console.log('[v0] Alerts table (may already exist):', alertsError.message);
    else console.log('[v0] Alerts table created');

    console.log('[v0] Migration completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('[v0] Migration failed:', error);
    process.exit(1);
  }
}

migrate();
