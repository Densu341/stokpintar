'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [preview, setPreview] = useState<any[]>([])
  const router = useRouter()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      if (selectedFile.type === 'text/csv' || selectedFile.name.endsWith('.csv')) {
        setFile(selectedFile)
        setError('')
        // Show preview
        readFilePreview(selectedFile)
      } else if (
        selectedFile.type === 'application/vnd.ms-excel' ||
        selectedFile.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      ) {
        setFile(selectedFile)
        setError('')
      } else {
        setError('Please upload a CSV or Excel file')
        setFile(null)
      }
    }
  }

  const readFilePreview = (file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      const lines = content.split('\n').slice(0, 6) // First 6 lines
      const data = lines
        .map((line) => {
          if (!line.trim()) return null
          const values = line.split(',').map((v) => v.trim().replace(/^"|"$/g, ''))
          return values
        })
        .filter(Boolean)
      setPreview(data as any[])
    }
    reader.readAsText(file)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) {
      setError('Please select a file')
      return
    }

    setUploading(true)
    setError('')
    setSuccess('')

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Upload failed')
      }

      const data = await response.json()
      setSuccess(`Successfully uploaded ${data.recordsUploaded} sales records!`)
      setFile(null)
      setPreview([])

      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        router.push('/dashboard')
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary">StokPintar</h1>
          <nav className="flex gap-4">
            <Link href="/dashboard" className="text-foreground hover:text-primary">
              Dashboard
            </Link>
            <button
              onClick={() => {
                // Add logout logic
              }}
              className="text-foreground hover:text-primary"
            >
              Logout
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg border border-border p-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">Upload Sales Data</h2>
          <p className="text-muted-foreground mb-8">
            Upload your sales history from TikTok, Shopee, or any other platform
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* File Upload Area */}
            <div className="border-2 border-dashed border-border rounded-lg p-12 text-center hover:border-primary transition">
              <div className="mb-4">
                <svg
                  className="mx-auto h-12 w-12 text-muted-foreground"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 48 48"
                >
                  <path
                    d="M28 8H12a4 4 0 00-4 4v20a4 4 0 004 4h24a4 4 0 004-4V20m-14-12l6 6m0 0l-6 6m6-6H8"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <input
                type="file"
                onChange={handleFileChange}
                accept=".csv,.xlsx,.xls"
                className="hidden"
                id="file-input"
              />
              <label
                htmlFor="file-input"
                className="cursor-pointer flex flex-col items-center gap-2"
              >
                <span className="font-semibold text-foreground">Click to upload</span>
                <span className="text-sm text-muted-foreground">
                  or drag and drop your CSV/Excel file
                </span>
              </label>
              {file && (
                <div className="mt-4 text-sm text-primary font-medium">{file.name}</div>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
                {error}
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-600">
                {success}
              </div>
            )}

            {/* Preview */}
            {preview.length > 0 && (
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-foreground mb-4">Preview</h3>
                <div className="overflow-x-auto border border-border rounded-lg">
                  <table className="w-full text-sm">
                    <thead className="bg-muted border-b border-border">
                      <tr>
                        {preview[0]?.map((header: string, i: number) => (
                          <th key={i} className="px-4 py-2 text-left font-medium text-foreground">
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {preview.slice(1).map((row: any[], i: number) => (
                        <tr key={i} className="border-b border-border hover:bg-muted/50">
                          {row.map((cell: any, j: number) => (
                            <td key={j} className="px-4 py-2 text-foreground">
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">File Format Requirements</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>✓ Your file must contain columns: Product Name, Quantity, Date, Price</li>
                <li>✓ Supported formats: CSV, Excel (.xlsx, .xls)</li>
                <li>✓ Date format: YYYY-MM-DD, MM/DD/YYYY, or DD/MM/YYYY</li>
                <li>✓ Quantity and Price must be numbers</li>
              </ul>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={!file || uploading}
                className="flex-1 bg-primary text-primary-foreground font-medium py-3 rounded-lg hover:opacity-90 disabled:opacity-50 transition"
              >
                {uploading ? 'Uploading...' : 'Upload Sales Data'}
              </button>
              <Link
                href="/dashboard"
                className="flex-1 border border-border text-foreground font-medium py-3 rounded-lg hover:bg-muted transition text-center"
              >
                Skip for Now
              </Link>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
