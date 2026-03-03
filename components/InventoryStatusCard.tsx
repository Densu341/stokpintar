'use client'

interface InventoryStatusCardProps {
  inventory: {
    id: string
    product_name: string
    current_stock: number
    burn_rate: number
    estimated_out_of_stock_date: string | null
  }
}

export default function InventoryStatusCard({ inventory }: InventoryStatusCardProps) {
  const daysUntilEmpty = inventory.estimated_out_of_stock_date
    ? Math.ceil(
        (new Date(inventory.estimated_out_of_stock_date).getTime() - new Date().getTime()) /
          (1000 * 60 * 60 * 24)
      )
    : null

  const getStatusColor = () => {
    if (!daysUntilEmpty) return 'text-gray-600'
    if (daysUntilEmpty <= 7) return 'text-red-600'
    if (daysUntilEmpty <= 14) return 'text-yellow-600'
    return 'text-green-600'
  }

  const getStatusBg = () => {
    if (!daysUntilEmpty) return 'bg-gray-50'
    if (daysUntilEmpty <= 7) return 'bg-red-50'
    if (daysUntilEmpty <= 14) return 'bg-yellow-50'
    return 'bg-green-50'
  }

  return (
    <div className={`p-3 rounded-lg border border-border ${getStatusBg()}`}>
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-medium text-sm text-foreground truncate flex-1 pr-2">
          {inventory.product_name}
        </h3>
        {daysUntilEmpty !== null && (
          <span className={`text-xs font-semibold ${getStatusColor()} whitespace-nowrap`}>
            {daysUntilEmpty}d
          </span>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">Stock</span>
          <span className="font-medium text-foreground">{inventory.current_stock} units</span>
        </div>

        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">Burn Rate</span>
          <span className="font-medium text-foreground">
            {inventory.burn_rate ? inventory.burn_rate.toFixed(1) : '0'} /day
          </span>
        </div>

        {inventory.estimated_out_of_stock_date && (
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Est. Out of Stock</span>
            <span className="font-medium text-foreground">
              {new Date(inventory.estimated_out_of_stock_date).toLocaleDateString('id-ID', {
                month: 'short',
                day: 'numeric',
              })}
            </span>
          </div>
        )}
      </div>

      {daysUntilEmpty !== null && daysUntilEmpty <= 14 && (
        <button className="mt-3 w-full text-xs bg-primary text-primary-foreground py-2 rounded hover:opacity-90 transition font-medium">
          Reorder
        </button>
      )}
    </div>
  )
}
