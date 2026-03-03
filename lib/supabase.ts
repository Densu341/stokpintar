import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Initialize database tables on first run
export async function initializeDatabase() {
  try {
    // Check if tables exist by trying to fetch from them
    const { error: usersError } = await supabase
      .from('users')
      .select('id')
      .limit(1)

    if (usersError?.code === 'PGRST116') {
      // Table doesn't exist, create it
      console.log('[v0] Initializing database tables...')
      
      // Create users table
      const { error: createUsersError } = await supabase.rpc('execute_sql', {
        sql: `
          CREATE TABLE IF NOT EXISTS users (
            id UUID PRIMARY KEY DEFAULT auth.uid(),
            email TEXT UNIQUE NOT NULL,
            created_at TIMESTAMP DEFAULT NOW()
          );
        `
      })
      
      if (createUsersError) {
        console.log('[v0] Error creating users table:', createUsersError)
      }
    }
  } catch (error) {
    console.log('[v0] Database initialization attempted')
  }
}

export type User = {
  id: string
  email: string
  created_at: string
}

export type SalesData = {
  id: string
  user_id: string
  product_name: string
  quantity_sold: number
  sale_date: string
  price_per_unit: number
  source_platform: string
  created_at: string
  updated_at: string
}

export type InventoryStatus = {
  id: string
  user_id: string
  product_name: string
  current_stock: number
  last_reorder_date: string | null
  last_reorder_quantity: number | null
  burn_rate: number
  estimated_out_of_stock_date: string | null
  created_at: string
  updated_at: string
}

export type Alert = {
  id: string
  user_id: string
  product_name: string
  alert_type: 'reorder_soon' | 'critical' | 'trend_change' | 'opportunity'
  message: string
  is_read: boolean
  created_at: string
  updated_at: string
}
