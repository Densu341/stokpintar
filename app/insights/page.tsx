'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { getSalesData, getUserAlerts, markAlertAsRead } from '@/lib/data'
import AlertCard from '@/components/AlertCard'

export default function InsightsPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [alerts, setAlerts] = useState<any[]>([])
  const [analyzing, setAnalyzing] = useState<string | null>(null)
  const [salesData, setSalesData] = useState<any[]>([])
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        router.push('/auth/login')
        return
      }

      setUser(session.user)
      loadInsights(session.user.id)
    }

    checkAuth()
  }, [router])

  const loadInsights = async (userId: string) => {
    try {
      const [alertsData, salesData] = await Promise.all([
        getUserAlerts(userId),
        getSalesData(userId),
      ])
      setAlerts(alertsData)
      setSalesData(salesData)
    } catch (error) {
      console.error('[v0] Error loading insights:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAnalyzeProduct = async (productName: string) => {
    setAnalyzing(productName)
    try {
      // Get current stock from inventory
      const { data: inventoryData } = await supabase
        .from('inventory_status')
        .select('*')
        .eq('user_id', user.id)
        .eq('product_name', productName)
        .single()

      const currentStock = inventoryData?.current_stock || 0

      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productName, currentStock }),
      })

      if (!response.ok) {
        const data = await response.json()
        alert('Error: ' + (data.error || 'Analysis failed'))
        return
      }

      // Reload insights
      await loadInsights(user.id)
      alert(`Analysis complete for ${productName}!`)
    } catch (error) {
      console.error('[v0] Analysis error:', error)
      alert('Failed to analyze product')
    } finally {
      setAnalyzing(null)
    }
  }

  const handleMarkAsRead = async (alertId: string) => {
    try {
      await markAlertAsRead(alertId)
      setAlerts(alerts.map((a) => (a.id === alertId ? { ...a, is_read: true } : a)))
    } catch (error) {
      console.error('[v0] Error marking alert as read:', error)
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
          <p className="text-muted-foreground">Loading your insights...</p>
        </div>
      </div>
    )
  }

  // Get unique products
  const products = Array.from(new Set(salesData.map((sale) => sale.product_name)))

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-primary">StokPintar</h1>
            <p className="text-sm text-muted-foreground">Smart Insights & Alerts</p>
          </div>
          <nav className="flex gap-4 items-center">
            <Link href="/dashboard" className="text-foreground hover:text-primary text-sm font-medium">
              Dashboard
            </Link>
            <Link
              href="/upload"
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition text-sm font-medium"
            >
              Upload Data
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
        {/* Alerts Section */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-4">Smart Alerts & Recommendations</h2>

          {alerts.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {alerts.map((alert) => (
                <AlertCard
                  key={alert.id}
                  alert={alert}
                  onMarkAsRead={() => handleMarkAsRead(alert.id)}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-border p-8 text-center">
              <p className="text-muted-foreground mb-4">No alerts yet. Analyze your products to get recommendations.</p>
            </div>
          )}
        </section>

        {/* Product Analysis Section */}
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-4">Product Analysis</h2>

          {products.length > 0 ? (
            <div className="bg-white rounded-lg border border-border overflow-hidden">
              <table className="w-full">
                <thead className="border-b border-border bg-muted">
                  <tr>
                    <th className="text-left py-3 px-4 font-medium text-foreground">Product</th>
                    <th className="text-right py-3 px-4 font-medium text-foreground">Total Sales</th>
                    <th className="text-right py-3 px-4 font-medium text-foreground">Sales Trend</th>
                    <th className="text-left py-3 px-4 font-medium text-foreground">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((productName) => {
                    const productSales = salesData.filter((s) => s.product_name === productName)
                    const totalQuantity = productSales.reduce((sum, s) => sum + s.quantity_sold, 0)
                    const recentSales = productSales.slice(-7)
                    const trend =
                      recentSales.length > 0
                        ? recentSales.reduce((sum, s) => sum + s.quantity_sold, 0) /
                          Math.max(1, recentSales.length)
                        : 0

                    return (
                      <tr key={productName} className="border-b border-border hover:bg-muted/50">
                        <td className="py-4 px-4 font-medium text-foreground">{productName}</td>
                        <td className="py-4 px-4 text-right text-foreground">{totalQuantity}</td>
                        <td className="py-4 px-4 text-right">
                          <span className="text-green-600 font-medium">
                            {trend.toFixed(1)} avg/day
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <button
                            onClick={() => handleAnalyzeProduct(productName)}
                            disabled={analyzing === productName}
                            className="px-3 py-1 bg-primary text-primary-foreground rounded text-sm hover:opacity-90 disabled:opacity-50 transition font-medium"
                          >
                            {analyzing === productName ? 'Analyzing...' : 'Analyze'}
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-border p-8 text-center">
              <p className="text-muted-foreground">
                No products yet.{' '}
                <Link href="/upload" className="text-primary hover:underline">
                  Upload sales data
                </Link>{' '}
                to get started.
              </p>
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
