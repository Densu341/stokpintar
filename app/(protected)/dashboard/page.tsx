'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { getSalesData, getInventoryStatus } from '@/lib/data'
import SalesTrendChart from '@/components/SalesTrendChart'
import InventoryStatusCard from '@/components/InventoryStatusCard'
import QuickStats from '@/components/QuickStats'

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [salesData, setSalesData] = useState<any[]>([])
  const [inventoryData, setInventoryData] = useState<any[]>([])
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        router.push('/auth/login')
        return
      }

      setUser(session.user)
      loadDashboardData(session.user.id)
    }

    checkAuth()
  }, [router])

  const loadDashboardData = async (userId: string) => {
    try {
      const [sales, inventory] = await Promise.all([
        getSalesData(userId),
        getInventoryStatus(userId),
      ])
      setSalesData(sales)
      setInventoryData(inventory)
    } catch (error) {
      console.error('[v0] Error loading dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-primary">StokPintar</h1>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>
          <nav className="flex gap-4 items-center">
            <Link
              href="/upload"
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition text-sm font-medium"
            >
              Upload Data
            </Link>
            <Link
              href="/insights"
              className="text-foreground hover:text-primary text-sm font-medium"
            >
              Insights
            </Link>
            <button
              onClick={handleLogout}
              className="text-foreground hover:text-primary text-sm font-medium"
            >
              Logout
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
        <QuickStats salesData={salesData} inventoryData={inventoryData} />

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          <div className="lg:col-span-2 bg-white rounded-lg border border-border p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-foreground mb-4">Sales Trend</h2>
            {salesData.length > 0 ? (
              <SalesTrendChart data={salesData} />
            ) : (
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                <p>No sales data yet. <Link href="/upload" className="text-primary hover:underline">Upload your data</Link> to get started.</p>
              </div>
            )}
          </div>

          {/* Inventory Sidebar */}
          <div className="bg-white rounded-lg border border-border p-6 shadow-sm h-fit">
            <h2 className="text-lg font-semibold text-foreground mb-4">Inventory Status</h2>
            {inventoryData.length > 0 ? (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {inventoryData.map((item) => (
                  <InventoryStatusCard key={item.id} inventory={item} />
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No inventory data yet.</p>
            )}
          </div>
        </div>

        {/* Products Grid */}
        {salesData.length > 0 && (
          <div className="mt-8 bg-white rounded-lg border border-border p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-foreground mb-4">Products Overview</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-border">
                  <tr>
                    <th className="text-left py-3 px-4 font-medium text-foreground">Product</th>
                    <th className="text-right py-3 px-4 font-medium text-foreground">Total Sales</th>
                    <th className="text-right py-3 px-4 font-medium text-foreground">Total Revenue</th>
                    <th className="text-right py-3 px-4 font-medium text-foreground">Avg Price</th>
                  </tr>
                </thead>
                <tbody>
                  {getProductSummary(salesData).map((product) => (
                    <tr key={product.name} className="border-b border-border hover:bg-muted/50">
                      <td className="py-3 px-4 text-foreground">{product.name}</td>
                      <td className="py-3 px-4 text-right text-foreground">{product.totalQuantity}</td>
                      <td className="py-3 px-4 text-right text-foreground">
                        Rp {(product.totalRevenue).toLocaleString('id-ID')}
                      </td>
                      <td className="py-3 px-4 text-right text-foreground">
                        Rp {(product.avgPrice).toLocaleString('id-ID')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

function getProductSummary(salesData: any[]) {
  const summary: Record<
    string,
    { totalQuantity: number; totalRevenue: number; avgPrice: number; count: number }
  > = {}

  salesData.forEach((sale) => {
    if (!summary[sale.product_name]) {
      summary[sale.product_name] = { totalQuantity: 0, totalRevenue: 0, avgPrice: 0, count: 0 }
    }
    summary[sale.product_name].totalQuantity += sale.quantity_sold
    summary[sale.product_name].totalRevenue += sale.quantity_sold * sale.price_per_unit
    summary[sale.product_name].count += 1
  })

  return Object.entries(summary).map(([name, data]) => ({
    name,
    totalQuantity: data.totalQuantity,
    totalRevenue: data.totalRevenue,
    avgPrice: data.totalRevenue / data.totalQuantity,
  }))
}
