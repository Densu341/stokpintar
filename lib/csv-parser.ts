export interface ParsedSalesRecord {
  product_name: string
  quantity_sold: number
  sale_date: string
  price_per_unit: number
  source_platform?: string
}

export async function parseCSVFile(file: File): Promise<ParsedSalesRecord[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const content = e.target?.result as string
        const records = parseCSVContent(content)
        resolve(records)
      } catch (error) {
        reject(error)
      }
    }

    reader.onerror = () => {
      reject(new Error('Failed to read file'))
    }

    reader.readAsText(file)
  })
}

function parseCSVContent(content: string): ParsedSalesRecord[] {
  const lines = content.split('\n').filter((line) => line.trim())
  if (lines.length < 2) {
    throw new Error('CSV file must contain at least a header and one data row')
  }

  const headers = parseCSVLine(lines[0]).map((h) => h.toLowerCase().trim())
  const records: ParsedSalesRecord[] = []

  // Find column indices
  const productCol = findColumnIndex(headers, ['product', 'product_name', 'item', 'nama_produk'])
  const quantityCol = findColumnIndex(headers, [
    'quantity',
    'qty',
    'quantity_sold',
    'jumlah',
    'jumlah_terjual',
  ])
  const dateCol = findColumnIndex(headers, [
    'date',
    'sale_date',
    'tanggal',
    'tanggal_penjualan',
    'created_at',
  ])
  const priceCol = findColumnIndex(headers, [
    'price',
    'unit_price',
    'price_per_unit',
    'harga',
    'harga_satuan',
  ])
  const platformCol = findColumnIndex(headers, [
    'platform',
    'source',
    'channel',
    'platform_penjualan',
  ])

  if (productCol === -1 || quantityCol === -1 || dateCol === -1 || priceCol === -1) {
    throw new Error(
      'CSV must contain columns for: Product Name, Quantity, Date, and Price Per Unit'
    )
  }

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i])
    if (values.length === 0 || (values.length === 1 && !values[0].trim())) {
      continue
    }

    try {
      const record: ParsedSalesRecord = {
        product_name: values[productCol]?.trim() || '',
        quantity_sold: parseInt(values[quantityCol]?.trim() || '0'),
        sale_date: formatDate(values[dateCol]?.trim() || ''),
        price_per_unit: parseFloat(values[priceCol]?.trim() || '0'),
        source_platform: platformCol !== -1 ? values[platformCol]?.trim() : 'unknown',
      }

      // Validate record
      if (!record.product_name) {
        console.warn(`Row ${i + 1}: Missing product name, skipping`)
        continue
      }
      if (isNaN(record.quantity_sold) || record.quantity_sold <= 0) {
        console.warn(`Row ${i + 1}: Invalid quantity, skipping`)
        continue
      }
      if (!record.sale_date) {
        console.warn(`Row ${i + 1}: Invalid date, skipping`)
        continue
      }
      if (isNaN(record.price_per_unit) || record.price_per_unit < 0) {
        console.warn(`Row ${i + 1}: Invalid price, skipping`)
        continue
      }

      records.push(record)
    } catch (error) {
      console.warn(`Row ${i + 1}: Error parsing record, skipping`)
    }
  }

  if (records.length === 0) {
    throw new Error('No valid records found in CSV')
  }

  return records
}

function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let insideQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    const nextChar = line[i + 1]

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        current += '"'
        i++ // Skip next quote
      } else {
        insideQuotes = !insideQuotes
      }
    } else if (char === ',' && !insideQuotes) {
      result.push(current)
      current = ''
    } else {
      current += char
    }
  }

  result.push(current)
  return result
}

function findColumnIndex(headers: string[], possibleNames: string[]): number {
  for (const name of possibleNames) {
    const index = headers.findIndex((h) => h.includes(name.toLowerCase()))
    if (index !== -1) return index
  }
  return -1
}

function formatDate(dateStr: string): string {
  // Try various date formats
  const formats = [
    // ISO format
    /^\d{4}-\d{2}-\d{2}$/,
    // MM/DD/YYYY
    /^\d{1,2}\/\d{1,2}\/\d{4}$/,
    // DD/MM/YYYY
    /^\d{1,2}\/\d{1,2}\/\d{4}$/,
    // DD-MM-YYYY
    /^\d{1,2}-\d{1,2}-\d{4}$/,
  ]

  // Try to parse as ISO date
  if (formats[0].test(dateStr)) {
    return dateStr // Already ISO format
  }

  // Try various parsing strategies
  try {
    // Try MM/DD/YYYY or DD/MM/YYYY
    if (dateStr.includes('/')) {
      const [part1, part2, year] = dateStr.split('/').map(Number)
      if (part1 > 12) {
        // DD/MM/YYYY format
        return `${year}-${String(part2).padStart(2, '0')}-${String(part1).padStart(2, '0')}`
      } else {
        // MM/DD/YYYY format
        return `${year}-${String(part1).padStart(2, '0')}-${String(part2).padStart(2, '0')}`
      }
    }

    // Try DD-MM-YYYY
    if (dateStr.includes('-')) {
      const [part1, part2, year] = dateStr.split('-').map(Number)
      if (part1 > 12) {
        // DD-MM-YYYY
        return `${year}-${String(part2).padStart(2, '0')}-${String(part1).padStart(2, '0')}`
      }
    }

    // Try to parse as Date
    const date = new Date(dateStr)
    if (!isNaN(date.getTime())) {
      return date.toISOString().split('T')[0]
    }

    throw new Error('Invalid date')
  } catch (error) {
    throw new Error(`Could not parse date: ${dateStr}`)
  }
}

export async function parseExcelFile(file: File): Promise<ParsedSalesRecord[]> {
  // Note: For Excel files, we'll use a simple approach
  // In a real app, you'd use a library like xlsx or exceljs
  // For now, we'll treat it as CSV if it's an Excel file exported as CSV
  if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
    return parseCSVFile(file)
  }

  // If it's an Excel file, we need to read it differently
  if (
    file.type === 'application/vnd.ms-excel' ||
    file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ) {
    // For now, we'll throw an error and ask user to export as CSV
    // In production, integrate xlsx library
    throw new Error(
      'Excel files are not yet supported. Please export your Excel file as CSV and upload again.'
    )
  }

  throw new Error('Unsupported file format')
}
