"use client"

import * as React from "react"
import { useState } from "react"
import { X, GripVertical, FileText, Image } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface FileWithPreview extends File {
  id: string
  preview?: string
  pageCount?: number
}

interface FileListProps {
  files: FileWithPreview[]
  onRemove: (fileId: string) => void
  onReorder: (fromIndex: number, toIndex: number) => void
  showPageCount?: boolean
  className?: string
}

export function FileList({
  files,
  onRemove,
  onReorder,
  showPageCount = false,
  className,
}: FileListProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const getFileIcon = (file: File) => {
    if (file.type === "application/pdf") {
      return <FileText className="h-5 w-5 text-red-500" />
    }
    if (file.type.startsWith("image/")) {
      return <Image className="h-5 w-5 text-blue-500" />
    }
    return <FileText className="h-5 w-5 text-gray-500" />
  }

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index)
    e.dataTransfer.effectAllowed = "move"
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
  }

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()
    if (draggedIndex !== null && draggedIndex !== dropIndex) {
      onReorder(draggedIndex, dropIndex)
    }
    setDraggedIndex(null)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
  }

  if (files.length === 0) {
    return null
  }

  return (
    <div className={cn("space-y-2", className)}>
      <h3 className="text-sm font-medium text-muted-foreground">
        Selected Files ({files.length})
      </h3>
      
      <div className="space-y-2">
        {files.map((file, index) => (
          <Card
            key={file.id}
            className={cn(
              "transition-all duration-200",
              draggedIndex === index && "opacity-50 scale-95",
              "hover:shadow-md"
            )}
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, index)}
            onDragEnd={handleDragEnd}
          >
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                {/* Drag handle */}
                <div className="cursor-move text-muted-foreground hover:text-foreground">
                  <GripVertical className="h-4 w-4" />
                </div>

                {/* File icon */}
                <div className="flex-shrink-0">
                  {getFileIcon(file)}
                </div>

                {/* File info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <p className="text-sm font-medium truncate">
                      {file.name}
                    </p>
                    {showPageCount && file.pageCount && (
                      <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                        {file.pageCount} page{file.pageCount > 1 ? "s" : ""}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(file.size)}
                  </p>
                </div>

                {/* Remove button */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onRemove(file.id)}
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  aria-label={`Remove ${file.name}`}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Preview thumbnail */}
              {file.preview && (
                <div className="mt-3 flex justify-center">
                  <img
                    src={file.preview}
                    alt={`Preview of ${file.name}`}
                    className="max-w-20 max-h-20 object-contain rounded border"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-xs text-muted-foreground">
        Drag files to reorder them
      </div>
    </div>
  )
}
