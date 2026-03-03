export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
}

export function calculateBurnRate(
  initialStock: number,
  currentStock: number,
  daysElapsed: number
): number {
  if (daysElapsed === 0) return 0;
  return (initialStock - currentStock) / daysElapsed;
}

export function estimateStockoutDate(
  currentStock: number,
  burnRate: number
): Date | null {
  if (burnRate <= 0) return null;
  const daysRemaining = currentStock / burnRate;
  const today = new Date();
  const stockoutDate = new Date(today.getTime() + daysRemaining * 24 * 60 * 60 * 1000);
  return stockoutDate;
}

export function getDaysUntilStockout(stockoutDate: Date | null): number | null {
  if (!stockoutDate) return null;
  const today = new Date();
  const diffTime = stockoutDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

export function getAlertLevel(daysRemaining: number | null): string {
  if (daysRemaining === null) return 'unknown';
  if (daysRemaining <= 7) return 'critical';
  if (daysRemaining <= 14) return 'warning';
  return 'safe';
}

export function getAlertColor(level: string): string {
  switch (level) {
    case 'critical':
      return 'text-red-600 bg-red-50';
    case 'warning':
      return 'text-yellow-600 bg-yellow-50';
    case 'safe':
      return 'text-green-600 bg-green-50';
    default:
      return 'text-gray-600 bg-gray-50';
  }
}
