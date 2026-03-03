'use client'

interface QuickStatsProps {
  salesData: any[]
  inventoryData: any[]
}

export default function QuickStats({ salesData, inventoryData }: QuickStatsProps) {
  // Calculate stats
  const totalSales = salesData.reduce((sum, sale) => sum + sale.quantity_sold, 0)
  const totalRevenue = salesData.reduce(
    (sum, sale) => sum + sale.quantity_sold * sale.price_per_unit,
    0
  )
  const totalProducts = new Set(salesData.map((sale) => sale.product_name)).size
  const criticalItems = inventoryData.filter((inv) => {
    if (!inv.estimated_out_of_stock_date) return false
    const daysUntilEmpty = Math.ceil(
      (new Date(inv.estimated_out_of_stock_date).getTime() - new Date().getTime()) /
        (1000 * 60 * 60 * 24)
    )
    return daysUntilEmpty <= 7
  }).length

  const stats = [
    {
      label: 'Total Sales',
      value: totalSales.toLocaleString('id-ID'),
      unit: 'units',
      icon: '📊',
    },
    {
      label: 'Total Revenue',
      value: `Rp ${(totalRevenue / 1000000).toFixed(1)}`,
      unit: 'Million',
      icon: '💰',
    },
    {
      label: 'Products',
      value: totalProducts,
      unit: 'tracked',
      icon: '📦',
    },
    {
      label: 'Critical Items',
      value: criticalItems,
      unit: 'need reorder',
      icon: '⚠️',
      highlight: criticalItems > 0,
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className={`bg-white rounded-lg border p-4 shadow-sm ${
            stat.highlight ? 'border-red-200 bg-red-50' : 'border-border'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
              <p className={`text-2xl font-bold ${stat.highlight ? 'text-red-600' : 'text-primary'}`}>
                {stat.value}
              </p>
              <p className="text-xs text-muted-foreground mt-1">{stat.unit}</p>
            </div>
            <div className="text-3xl">{stat.icon}</div>
          </div>
        </div>
      ))}
    </div>
  )
}
