import { supabase } from './supabase'
import type { SalesData, InventoryStatus, Alert } from './supabase'

// Sales Data Operations
export async function uploadSalesData(userId: string, salesRecords: Partial<SalesData>[]) {
  const records = salesRecords.map((record) => ({
    user_id: userId,
    product_name: record.product_name,
    quantity_sold: record.quantity_sold,
    sale_date: record.sale_date,
    price_per_unit: record.price_per_unit,
    source_platform: record.source_platform || 'csv_upload',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }))

  const { data, error } = await supabase
    .from('sales_data')
    .insert(records)
    .select()

  if (error) throw error
  return data
}

export async function getSalesData(userId: string, productName?: string) {
  let query = supabase
    .from('sales_data')
    .select('*')
    .eq('user_id', userId)
    .order('sale_date', { ascending: false })

  if (productName) {
    query = query.eq('product_name', productName)
  }

  const { data, error } = await query

  if (error) throw error
  return data as SalesData[]
}

// Inventory Operations
export async function updateInventoryStatus(
  userId: string,
  productName: string,
  currentStock: number
) {
  const { data, error } = await supabase
    .from('inventory_status')
    .upsert(
      {
        user_id: userId,
        product_name: productName,
        current_stock: currentStock,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,product_name' }
    )
    .select()

  if (error) throw error
  return data[0] as InventoryStatus
}

export async function getInventoryStatus(userId: string) {
  const { data, error } = await supabase
    .from('inventory_status')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })

  if (error) throw error
  return data as InventoryStatus[]
}

export async function updateBurnRateAndEstimate(
  userId: string,
  productName: string,
  burnRate: number,
  estimatedDate: string | null
) {
  const { data, error } = await supabase
    .from('inventory_status')
    .update({
      burn_rate: burnRate,
      estimated_out_of_stock_date: estimatedDate,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId)
    .eq('product_name', productName)
    .select()

  if (error) throw error
  return data[0] as InventoryStatus
}

// Alert Operations
export async function createAlert(
  userId: string,
  productName: string,
  alertType: 'reorder_soon' | 'critical' | 'trend_change' | 'opportunity',
  message: string
) {
  const { data, error } = await supabase
    .from('alerts')
    .insert([
      {
        user_id: userId,
        product_name: productName,
        alert_type: alertType,
        message,
        is_read: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ])
    .select()

  if (error) throw error
  return data[0] as Alert
}

export async function getUserAlerts(userId: string, unreadOnly = false) {
  let query = supabase
    .from('alerts')
    .select('*')
    .eq('user_id', userId)

  if (unreadOnly) {
    query = query.eq('is_read', false)
  }

  const { data, error } = await query.order('created_at', { ascending: false })

  if (error) throw error
  return data as Alert[]
}

export async function markAlertAsRead(alertId: string) {
  const { data, error } = await supabase
    .from('alerts')
    .update({ is_read: true, updated_at: new Date().toISOString() })
    .eq('id', alertId)
    .select()

  if (error) throw error
  return data[0] as Alert
}

// Analytics
export async function getProductAnalytics(userId: string, productName: string, daysBack = 90) {
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - daysBack)

  const { data, error } = await supabase
    .from('sales_data')
    .select('*')
    .eq('user_id', userId)
    .eq('product_name', productName)
    .gte('sale_date', startDate.toISOString().split('T')[0])
    .order('sale_date', { ascending: true })

  if (error) throw error
  return data as SalesData[]
}
