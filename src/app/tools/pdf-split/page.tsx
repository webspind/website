"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { Download, FileText, AlertCircle, CheckCircle, Info } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { FileDropzone } from "@/components/files/FileDropzone"
import { ProgressUpdate } from "@/lib/progress"
import { splitPDF, saveBlob, getPageCount, validatePDF } from "@/lib/pdf/pdfUtils"

interface SplitResult {
  blob: Blob
  name: string
  pageCount: number
}

interface PageRange {
  start: number
  end: number
  name?: string
}

export default function PDFSplitPage() {
  const [file, setFile] = useState<File | null>(null)
  const [pageCount, setPageCount] = useState<number | null>(null)
  const [pageRanges, setPageRanges] = useState<string>("")
  const [parsedRanges, setParsedRanges] = useState<PageRange[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState<ProgressUpdate | null>(null)
  const [results, setResults] = useState<SplitResult[]>([])
  const [error, setError] = useState<string | null>(null)
  const [validationError, setValidationError] = useState<string | null>(null)

  // Parse page ranges from input
  useEffect(() => {
    if (!pageRanges.trim() || !pageCount) {
      setParsedRanges([])
      setValidationError(null)
      return
    }

    try {
      const ranges: PageRange[] = []
      const parts = pageRanges.split(",").map(part => part.trim())

      for (const part of parts) {
        if (!part) continue

        if (part.includes("-")) {
          const [startStr, endStr] = part.split("-")
          const start = parseInt(startStr)
          const end = endStr ? parseInt(endStr) : pageCount

          if (isNaN(start) || start < 1) {
            throw new Error(`Invalid start page: ${startStr}`)
          }
          if (isNaN(end) || end > pageCount) {
            throw new Error(`Invalid end page: ${endStr || "end"}`)
          }
          if (start > end) {
            throw new Error(`Start page (${start}) cannot be greater than end page (${end})`)
          }

          ranges.push({
            start,
            end,
            name: `pages_${start}-${end}.pdf`
          })
        } else {
          const page = parseInt(part)
          if (isNaN(page) || page < 1 || page > pageCount) {
            throw new Error(`Invalid page number: ${part}`)
          }

          ranges.push({
            start: page,
            end: page,
            name: `page_${page}.pdf`
          })
        }
      }

      setParsedRanges(ranges)
      setValidationError(null)
    } catch (error) {
      setValidationError(error instanceof Error ? error.message : "Invalid page range format")
      setParsedRanges([])
    }
  }, [pageRanges, pageCount])

  const handleFileSelected = async (files: File[]) => {
    if (files.length === 0) return

    const selectedFile = files[0]
    setFile(selectedFile)
    setError(null)
    setResults([])
    setPageRanges("")

    try {
      // Validate PDF
      const validation = await validatePDF(selectedFile)
      if (!validation.valid) {
        setError(validation.error || "Invalid PDF file")
        return
      }

      // Get page count
      const count = await getPageCount(selectedFile)
      setPageCount(count)
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to process PDF")
    }
  }

  const handleSplit = async () => {
    if (!file || parsedRanges.length === 0) {
      setError("Please select a PDF file and enter valid page ranges")
      return
    }

    setIsProcessing(true)
    setError(null)
    setProgress(null)

    try {
      const splitResults = await splitPDF(file, parsedRanges, (update) => {
        setProgress(update)
      })

      setResults(splitResults)
      setProgress({
        progress: 100,
        message: "Split complete!",
        stage: "complete"
      })
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to split PDF")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDownload = (result: SplitResult) => {
    saveBlob(result.blob, result.name)
  }

  const handleDownloadAll = () => {
    results.forEach(result => {
      saveBlob(result.blob, result.name)
    })
  }

  const handleReset = () => {
    setFile(null)
    setPageCount(null)
    setPageRanges("")
    setParsedRanges([])
    setResults([])
    setProgress(null)
    setError(null)
    setValidationError(null)
  }

  const getTotalPages = () => {
    return parsedRanges.reduce((total, range) => total + (range.end - range.start + 1), 0)
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Split / Extract pages</h1>
        <p className="text-muted-foreground">
          Extract specific pages or page ranges from a PDF
        </p>
      </div>

      {/* File Upload */}
      {!file && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Select PDF file</CardTitle>
            <CardDescription>
              Choose a PDF file to split into separate pages or ranges.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FileDropzone
              onFilesSelected={handleFileSelected}
              acceptedTypes={["application/pdf"]}
              maxFiles={1}
              maxSize={100}
            />
          </CardContent>
        </Card>
      )}

      {/* File Info and Page Range Input */}
      {file && pageCount && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Configure page ranges</CardTitle>
            <CardDescription>
              Enter page ranges to extract. Example: 1-3,7,10- (pages 1-3, page 7, and pages 10 to end)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <FileText className="h-4 w-4" />
              <span>{file.name}</span>
              <span>•</span>
              <span>{pageCount} page{pageCount > 1 ? "s" : ""}</span>
            </div>

            <div className="space-y-2">
              <label htmlFor="page-ranges" className="text-sm font-medium">
                Page ranges
              </label>
              <Input
                id="page-ranges"
                placeholder="1-3,7,10-"
                value={pageRanges}
                onChange={(e) => setPageRanges(e.target.value)}
                className={validationError ? "border-destructive" : ""}
              />
              {validationError && (
                <p className="text-sm text-destructive">{validationError}</p>
              )}
            </div>

            {parsedRanges.length > 0 && (
              <div className="space-y-2">
                <div className="text-sm font-medium">Preview:</div>
                <div className="bg-muted p-3 rounded-md space-y-1">
                  {parsedRanges.map((range, index) => (
                    <div key={index} className="text-sm">
                      {range.start === range.end 
                        ? `Page ${range.start}` 
                        : `Pages ${range.start}-${range.end}`
                      } → {range.name}
                    </div>
                  ))}
                  <div className="text-sm font-medium pt-2 border-t">
                    Total: {getTotalPages()} page{getTotalPages() > 1 ? "s" : ""} into {parsedRanges.length} file{parsedRanges.length > 1 ? "s" : ""}
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-start space-x-2 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-md">
              <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-800 dark:text-blue-200">
                <p className="font-medium mb-1">Format examples:</p>
                <ul className="space-y-1 text-xs">
                  <li>• <code>1-3</code> - Pages 1, 2, and 3</li>
                  <li>• <code>7</code> - Just page 7</li>
                  <li>• <code>10-</code> - Pages 10 to the end</li>
                  <li>• <code>1-3,7,10-</code> - Multiple ranges</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Progress */}
      {progress && (
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                {progress.progress === 100 ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <div className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                )}
                <span className="font-medium">{progress.message}</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress.progress}%` }}
                />
              </div>
              <div className="text-sm text-muted-foreground">
                {progress.progress.toFixed(0)}% complete
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error */}
      {error && (
        <Card className="mb-6 border-destructive">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {results.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Split Results</CardTitle>
            <CardDescription>
              {results.length} file{results.length > 1 ? "s" : ""} created successfully
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {results.map((result, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-md">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-5 w-5 text-red-500" />
                    <div>
                      <div className="font-medium">{result.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {result.pageCount} page{result.pageCount > 1 ? "s" : ""}
                      </div>
                    </div>
                  </div>
                  <Button
                    onClick={() => handleDownload(result)}
                    size="sm"
                    className="flex items-center space-x-2"
                  >
                    <Download className="h-4 w-4" />
                    <span>Download</span>
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        {file && parsedRanges.length > 0 && !results.length && (
          <Button
            onClick={handleSplit}
            disabled={isProcessing}
            size="lg"
            className="flex items-center space-x-2"
          >
            <FileText className="h-4 w-4" />
            <span>Split PDF</span>
          </Button>
        )}

        {results.length > 1 && (
          <Button
            onClick={handleDownloadAll}
            size="lg"
            variant="outline"
            className="flex items-center space-x-2"
          >
            <Download className="h-4 w-4" />
            <span>Download All</span>
          </Button>
        )}

        {(file || results.length > 0) && (
          <Button
            onClick={handleReset}
            variant="outline"
            size="lg"
          >
            Start over
          </Button>
        )}
      </div>

      {/* Info */}
      <div className="mt-8 text-center text-sm text-muted-foreground">
        <p>Your files are processed locally in your browser. Nothing is uploaded to our servers.</p>
      </div>
    </div>
  )
}
