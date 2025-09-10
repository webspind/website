"use client"

import * as React from "react"
import { useCallback, useState } from "react"
import { Upload, File, AlertCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface FileDropzoneProps {
  onFilesSelected: (files: File[]) => void
  acceptedTypes?: string[]
  maxFiles?: number
  maxSize?: number // in MB
  className?: string
  disabled?: boolean
}

export function FileDropzone({
  onFilesSelected,
  acceptedTypes = ["application/pdf"],
  maxFiles = 10,
  maxSize = 50, // 50MB default
  className,
  disabled = false,
}: FileDropzoneProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const validateFile = useCallback((file: File): string | null => {
    // Check file type
    if (acceptedTypes.length > 0 && !acceptedTypes.includes(file.type)) {
      return `File type ${file.type} is not supported`
    }

    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      return `File size must be less than ${maxSize}MB`
    }

    return null
  }, [acceptedTypes, maxSize])

  const handleFiles = useCallback((files: FileList | File[]) => {
    setError(null)
    const fileArray = Array.from(files)

    // Check max files
    if (fileArray.length > maxFiles) {
      setError(`Maximum ${maxFiles} files allowed`)
      return
    }

    // Validate each file
    const validFiles: File[] = []
    const errors: string[] = []

    fileArray.forEach((file) => {
      const validationError = validateFile(file)
      if (validationError) {
        errors.push(`${file.name}: ${validationError}`)
      } else {
        validFiles.push(file)
      }
    })

    if (errors.length > 0) {
      setError(errors.join(", "))
    }

    if (validFiles.length > 0) {
      onFilesSelected(validFiles)
    }
  }, [maxFiles, validateFile, onFilesSelected])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    if (!disabled) {
      setIsDragOver(true)
    }
  }, [disabled])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    if (disabled) return

    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFiles(files)
    }
  }, [disabled, handleFiles])

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFiles(files)
    }
    // Reset input value to allow selecting the same file again
    e.target.value = ""
  }, [handleFiles])

  const getAcceptedTypesText = () => {
    if (acceptedTypes.includes("application/pdf")) {
      return "PDF files only"
    }
    if (acceptedTypes.includes("image/*")) {
      return "Image files only"
    }
    return "Selected file types"
  }

  return (
    <div className={cn("w-full", className)}>
      <Card
        className={cn(
          "border-2 border-dashed transition-colors",
          isDragOver && !disabled && "border-primary bg-primary/5",
          disabled && "opacity-50 cursor-not-allowed",
          error && "border-destructive"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <CardContent className="p-8">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="rounded-full bg-muted p-4">
              {error ? (
                <AlertCircle className="h-8 w-8 text-destructive" />
              ) : (
                <Upload className="h-8 w-8 text-muted-foreground" />
              )}
            </div>
            
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">
                {error ? "Upload Error" : "Drag & drop files here"}
              </h3>
              <p className="text-sm text-muted-foreground">
                {error || `or click to choose. This tool accepts ${getAcceptedTypesText()}.`}
              </p>
            </div>

            <Button
              variant="outline"
              disabled={disabled}
              onClick={() => document.getElementById("file-input")?.click()}
              className="mt-4"
            >
              <File className="mr-2 h-4 w-4" />
              Choose Files
            </Button>

            <input
              id="file-input"
              type="file"
              multiple={maxFiles > 1}
              accept={acceptedTypes.join(",")}
              onChange={handleFileInput}
              className="hidden"
              disabled={disabled}
              aria-label="File input"
            />

            <div className="text-xs text-muted-foreground">
              Max {maxFiles} file{maxFiles > 1 ? "s" : ""}, {maxSize}MB each
            </div>
          </div>
        </CardContent>
      </Card>

      {error && (
        <div 
          className="mt-2 text-sm text-destructive flex items-center"
          role="alert"
          aria-live="polite"
        >
          <AlertCircle className="mr-2 h-4 w-4" />
          {error}
        </div>
      )}
    </div>
  )
}
