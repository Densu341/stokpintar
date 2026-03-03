'use client'

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

interface SalesTrendChartProps {
  data: Array<{
    sale_date: string
    quantity_sold: number
    price_per_unit: number
  }>
}

export default function SalesTrendChart({ data }: SalesTrendChartProps) {
  // Group by date and calculate daily totals
  const dailyData = data.reduce(
    (acc: Record<string, any>, sale) => {
      const date = sale.sale_date
      if (!acc[date]) {
        acc[date] = {
          date,
          quantity: 0,
          revenue: 0,
          count: 0,
        }
      }
      acc[date].quantity += sale.quantity_sold
      acc[date].revenue += sale.quantity_sold * sale.price_per_unit
      acc[date].count += 1
      return acc
    },
    {}
  )

  const chartData = Object.values(dailyData)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map((item) => ({
      ...item,
      date: formatDate(item.date),
    }))

  if (chartData.length === 0) {
    return <div className="text-center text-muted-foreground">No data to display</div>
  }

  return (
    <div className="space-y-6">
      {/* Revenue Chart */}
      <div>
        <h3 className="text-sm font-medium text-foreground mb-4">Daily Revenue</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="date"
              stroke="#6b7280"
              style={{ fontSize: '12px' }}
              interval={Math.floor(chartData.length / 7)}
            />
            <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
            <Tooltip
              contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb' }}
              formatter={(value: any) =>
                typeof value === 'number' ? `Rp ${value.toLocaleString('id-ID')}` : value
              }
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#0284c7"
              strokeWidth={2}
              dot={false}
              name="Revenue (IDR)"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Quantity Chart */}
      <div>
        <h3 className="text-sm font-medium text-foreground mb-4">Daily Sales Quantity</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="date"
              stroke="#6b7280"
              style={{ fontSize: '12px' }}
              interval={Math.floor(chartData.length / 7)}
            />
            <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
            <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb' }} />
            <Legend />
            <Bar dataKey="quantity" fill="#f97316" name="Units Sold" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('id-ID', { month: 'short', day: 'numeric' })
}
