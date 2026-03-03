import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getProductAnalytics, updateBurnRateAndEstimate, createAlert } from '@/lib/data'
import { analyzeSalesAndPredictBurnRate } from '@/lib/openai'

export async function POST(request: NextRequest) {
  try {
    const { data: { session } } = await supabase.auth.getSession()

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { productName, currentStock } = await request.json()

    if (!productName || currentStock === undefined) {
      return NextResponse.json(
        { error: 'Missing productName or currentStock' },
        { status: 400 }
      )
    }

    console.log('[v0] Analyzing product:', productName, 'stock:', currentStock)

    // Get sales history
    const salesHistory = await getProductAnalytics(session.user.id, productName, 90)

    if (salesHistory.length === 0) {
      return NextResponse.json(
        {
          error: 'No sales history for this product',
          burnRate: 0,
          estimatedOutOfStockDate: null,
          recommendation: 'No sales data available. Upload more sales history for analysis.',
        },
        { status: 200 }
      )
    }

    // Format data for analysis
    const formattedHistory = salesHistory.map((sale) => ({
      date: sale.sale_date,
      quantity: sale.quantity_sold,
      price: sale.price_per_unit,
    }))

    // Analyze with OpenAI
    const analysis = await analyzeSalesAndPredictBurnRate({
      productName,
      salesHistory: formattedHistory,
      currentStock,
    })

    console.log('[v0] Analysis complete:', analysis)

    // Update inventory with burn rate and estimate
    await updateBurnRateAndEstimate(
      session.user.id,
      productName,
      analysis.burnRate,
      analysis.estimatedOutOfStockDate
    )

    // Create alert if needed
    if (analysis.estimatedOutOfStockDate) {
      const daysUntilEmpty = Math.ceil(
        (new Date(analysis.estimatedOutOfStockDate).getTime() - new Date().getTime()) /
          (1000 * 60 * 60 * 24)
      )

      if (daysUntilEmpty <= 7) {
        await createAlert(session.user.id, productName, 'critical', analysis.recommendation)
      } else if (daysUntilEmpty <= 14) {
        await createAlert(session.user.id, productName, 'reorder_soon', analysis.recommendation)
      }
    }

    return NextResponse.json(analysis)
  } catch (error) {
    console.error('[v0] Analysis error:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Analysis failed',
      },
      { status: 500 }
    )
  }
}
