"use client"

import * as React from "react"
import { useState } from "react"
import { Download, FileText, AlertCircle, CheckCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileDropzone } from "@/components/files/FileDropzone"
import { FileList } from "@/components/files/FileList"
import { ProgressUpdate } from "@/lib/progress"
import { mergePDFs, saveBlob, generatePagePreview } from "@/lib/pdf/pdfUtils"

interface FileWithPreview extends File {
  id: string
  preview?: string
  pageCount?: number
}

export default function PDFMergePage() {
  const [files, setFiles] = useState<FileWithPreview[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState<ProgressUpdate | null>(null)
  const [result, setResult] = useState<Blob | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleFilesSelected = async (newFiles: File[]) => {
    setError(null)
    const filesWithIds: FileWithPreview[] = newFiles.map(file => ({
      ...file,
      id: `${file.name}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }))

    // Generate previews for the first page of each PDF
    for (const file of filesWithIds) {
      try {
        const preview = await generatePagePreview(file, 1)
        file.preview = preview
      } catch (error) {
        console.warn(`Could not generate preview for ${file.name}:`, error)
      }
    }

    setFiles(prev => [...prev, ...filesWithIds])
  }

  const handleRemoveFile = (fileId: string) => {
    setFiles(prev => prev.filter(file => file.id !== fileId))
  }

  const handleReorder = (fromIndex: number, toIndex: number) => {
    setFiles(prev => {
      const newFiles = [...prev]
      const [movedFile] = newFiles.splice(fromIndex, 1)
      newFiles.splice(toIndex, 0, movedFile)
      return newFiles
    })
  }

  const handleMerge = async () => {
    if (files.length < 2) {
      setError("Please select at least 2 PDF files to merge")
      return
    }

    setIsProcessing(true)
    setError(null)
    setProgress(null)

    try {
      const resultBlob = await mergePDFs(files, (update) => {
        setProgress(update)
      })

      setResult(resultBlob)
      setProgress({
        progress: 100,
        message: "Merge complete!",
        stage: "complete"
      })
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to merge PDFs")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDownload = () => {
    if (result) {
      saveBlob(result, "merged.pdf")
    }
  }

  const handleReset = () => {
    setFiles([])
    setResult(null)
    setProgress(null)
    setError(null)
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Merge PDF files</h1>
        <p className="text-muted-foreground">
          Combine multiple PDFs into one file in your browser
        </p>
      </div>

      {/* Steps */}
      <div className="grid md:grid-cols-4 gap-4 mb-8">
        <Card className={files.length > 0 ? "border-primary" : ""}>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary mb-1">1</div>
            <div className="text-sm">Add files</div>
          </CardContent>
        </Card>
        <Card className={files.length > 1 ? "border-primary" : ""}>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary mb-1">2</div>
            <div className="text-sm">Reorder</div>
          </CardContent>
        </Card>
        <Card className={isProcessing ? "border-primary" : ""}>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary mb-1">3</div>
            <div className="text-sm">Merge</div>
          </CardContent>
        </Card>
        <Card className={result ? "border-primary" : ""}>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary mb-1">4</div>
            <div className="text-sm">Download</div>
          </CardContent>
        </Card>
      </div>

      {/* File Upload */}
      {files.length === 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Add PDF files</CardTitle>
            <CardDescription>
              Select multiple PDF files to merge. Drag and drop or click to choose.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FileDropzone
              onFilesSelected={handleFilesSelected}
              acceptedTypes={["application/pdf"]}
              maxFiles={50}
              maxSize={100}
            />
          </CardContent>
        </Card>
      )}

      {/* File List */}
      {files.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Selected Files ({files.length})</CardTitle>
            <CardDescription>
              Drag files to reorder them. The merged PDF will follow this order.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FileList
              files={files}
              onRemove={handleRemoveFile}
              onReorder={handleReorder}
              showPageCount={true}
            />
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

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        {files.length > 1 && !result && (
          <Button
            onClick={handleMerge}
            disabled={isProcessing}
            size="lg"
            className="flex items-center space-x-2"
          >
            <FileText className="h-4 w-4" />
            <span>Merge files</span>
          </Button>
        )}

        {result && (
          <Button
            onClick={handleDownload}
            size="lg"
            className="flex items-center space-x-2"
          >
            <Download className="h-4 w-4" />
            <span>Download merged PDF</span>
          </Button>
        )}

        {(files.length > 0 || result) && (
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
