'use client'

interface AlertCardProps {
  alert: {
    id: string
    product_name: string
    alert_type: 'reorder_soon' | 'critical' | 'trend_change' | 'opportunity'
    message: string
    is_read: boolean
    created_at: string
  }
  onMarkAsRead: () => void
}

export default function AlertCard({ alert, onMarkAsRead }: AlertCardProps) {
  const getAlertColor = () => {
    switch (alert.alert_type) {
      case 'critical':
        return { bg: 'bg-red-50', border: 'border-red-200', icon: '🔴' }
      case 'reorder_soon':
        return { bg: 'bg-yellow-50', border: 'border-yellow-200', icon: '🟡' }
      case 'opportunity':
        return { bg: 'bg-green-50', border: 'border-green-200', icon: '🟢' }
      case 'trend_change':
        return { bg: 'bg-blue-50', border: 'border-blue-200', icon: '🔵' }
      default:
        return { bg: 'bg-gray-50', border: 'border-gray-200', icon: '⚪' }
    }
  }

  const colors = getAlertColor()
  const createdDate = new Date(alert.created_at).toLocaleDateString('id-ID', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <div className={`${colors.bg} border ${colors.border} rounded-lg p-4 relative`}>
      {!alert.is_read && (
        <div className="absolute top-3 right-3 w-2 h-2 bg-primary rounded-full"></div>
      )}

      <div className="flex gap-3">
        <span className="text-2xl flex-shrink-0">{colors.icon}</span>

        <div className="flex-1">
          <h3 className="font-semibold text-foreground mb-1">{alert.product_name}</h3>

          <p className="text-sm text-foreground mb-3 leading-relaxed">{alert.message}</p>

          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">{createdDate}</span>

            {!alert.is_read && (
              <button
                onClick={onMarkAsRead}
                className="text-xs text-primary hover:underline font-medium"
              >
                Mark as read
              </button>
            )}
          </div>
        </div>
      </div>

      {alert.alert_type === 'critical' && (
        <button className="mt-3 w-full text-sm bg-red-600 text-white py-2 rounded hover:bg-red-700 transition font-medium">
          Reorder Now
        </button>
      )}
    </div>
  )
}
