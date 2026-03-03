import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { parseCSVFile, parseExcelFile } from '@/lib/csv-parser'
import { uploadSalesData } from '@/lib/data'

export async function POST(request: NextRequest) {
  try {
    // Get user session
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    console.log('[v0] Processing upload:', file.name, file.type)

    // Parse file based on type
    let records
    if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
      records = await parseCSVFile(file)
    } else if (
      file.type === 'application/vnd.ms-excel' ||
      file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      file.name.endsWith('.xlsx') ||
      file.name.endsWith('.xls')
    ) {
      records = await parseExcelFile(file)
    } else {
      return NextResponse.json(
        { error: 'Unsupported file format. Please upload CSV or Excel file.' },
        { status: 400 }
      )
    }

    console.log('[v0] Parsed records:', records.length)

    // Upload to database
    const uploadedData = await uploadSalesData(session.user.id, records)

    return NextResponse.json({
      success: true,
      recordsUploaded: uploadedData.length,
      records: uploadedData,
    })
  } catch (error) {
    console.error('[v0] Upload error:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Upload failed',
      },
      { status: 500 }
    )
  }
}
