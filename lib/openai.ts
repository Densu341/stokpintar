import { OpenAI } from 'openai'

if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY environment variable is not set')
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export type SalesAnalysisInput = {
  productName: string
  salesHistory: Array<{
    date: string
    quantity: number
    price: number
  }>
  currentStock: number
  lastReorderQuantity?: number
}

export async function analyzeSalesAndPredictBurnRate(
  input: SalesAnalysisInput
): Promise<{
  burnRate: number
  estimatedOutOfStockDate: string | null
  recommendation: string
  confidence: number
}> {
  const { productName, salesHistory, currentStock } = input

  // Calculate basic burn rate
  if (salesHistory.length < 2) {
    return {
      burnRate: 0,
      estimatedOutOfStockDate: null,
      recommendation: 'Insufficient data for accurate prediction. Please upload more sales history.',
      confidence: 0,
    }
  }

  // Calculate average daily sales
  const firstDate = new Date(salesHistory[0].date)
  const lastDate = new Date(salesHistory[salesHistory.length - 1].date)
  const daysDiff = Math.ceil(
    (lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24)
  )
  const totalQuantity = salesHistory.reduce((sum, sale) => sum + sale.quantity, 0)
  const averageDailySales = daysDiff > 0 ? totalQuantity / daysDiff : 0

  // Calculate burn rate (units per day)
  const burnRate = parseFloat(averageDailySales.toFixed(2))

  // Estimate when stock will run out
  let estimatedOutOfStockDate: string | null = null
  if (burnRate > 0 && currentStock > 0) {
    const daysUntilEmpty = Math.ceil(currentStock / burnRate)
    const estimatedDate = new Date()
    estimatedDate.setDate(estimatedDate.getDate() + daysUntilEmpty)
    estimatedOutOfStockDate = estimatedDate.toISOString().split('T')[0]
  }

  // Use OpenAI for advanced analysis
  try {
    const prompt = `
You are a retail analytics expert. Analyze this sales data and provide insights:

Product: ${productName}
Recent Sales History: ${JSON.stringify(salesHistory.slice(-30))}
Current Stock: ${currentStock} units
Average Daily Sales: ${burnRate} units/day
Estimated Out of Stock Date: ${estimatedOutOfStockDate || 'Unknown'}

Provide:
1. A brief assessment of the sales trend (increasing/decreasing/stable)
2. Specific recommendation for when to reorder (in days from now)
3. Recommended order quantity based on trends
4. Any risk factors or opportunities to note

Keep response concise and actionable.
    `.trim()

    const message = await openai.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 300,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    })

    const recommendationText = message.content[0].type === 'text' ? message.content[0].text : ''

    return {
      burnRate,
      estimatedOutOfStockDate,
      recommendation: recommendationText,
      confidence: 0.85,
    }
  } catch (error) {
    console.error('[v0] OpenAI API error:', error)
    // Fallback to basic recommendation
    const reorderDays = Math.max(7, Math.ceil(currentStock / (burnRate * 0.5)))
    const recommendation = `Based on your burn rate of ${burnRate} units/day, we recommend reordering in approximately ${reorderDays} days. Consider ordering 2-3x your average monthly sales to maintain healthy stock levels.`

    return {
      burnRate,
      estimatedOutOfStockDate,
      recommendation,
      confidence: 0.6,
    }
  }
}

export async function generateTrendInsights(productName: string, salesData: any[]): Promise<string> {
  if (salesData.length === 0) {
    return 'No sales data available for analysis.'
  }

  try {
    const prompt = `
Analyze these sales trends for "${productName}":
${JSON.stringify(salesData.slice(-60))}

Provide 2-3 key insights about:
- Current trend direction
- Seasonality or patterns
- Recommended actions

Keep it brief and actionable.
    `.trim()

    const message = await openai.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 200,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    })

    return message.content[0].type === 'text'
      ? message.content[0].text
      : 'Unable to generate insights at this time.'
  } catch (error) {
    console.error('[v0] Trend analysis error:', error)
    return 'Analysis temporarily unavailable.'
  }
}

export async function suggestReorderQuantity(
  productName: string,
  averageMonthlySales: number,
  leadTimeDays: number = 14
): Promise<number> {
  try {
    const prompt = `
A retailer sells "${productName}" at an average rate of ${averageMonthlySales} units per month.
Supply lead time is ${leadTimeDays} days.
What is the recommended reorder quantity to maintain safety stock? Consider a safety factor of 1.5x.
Reply with just the number.
    `

    const message = await openai.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 50,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    })

    const response = message.content[0].type === 'text' ? message.content[0].text : ''
    const quantity = parseInt(response.match(/\d+/)?.[0] || '0')

    return Math.max(quantity, Math.ceil(averageMonthlySales * 1.5))
  } catch (error) {
    console.error('[v0] Reorder quantity calculation error:', error)
    // Fallback: order 1.5x average monthly sales + 50% safety stock
    return Math.ceil(averageMonthlySales * 2.25)
  }
}
