/**
 * PDF utilities using PDF.js and pdf-lib
 * Handles PDF loading, manipulation, and preview generation
 */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { PDFDocument } from "pdf-lib"
import { ProgressUpdate } from "@/lib/progress"

// PDF.js imports - only available on client side
let pdfjsLib: typeof import("pdfjs-dist") | null = null

// Lazy load PDF.js only on client side
async function getPdfJs() {
  if (typeof window === "undefined") {
    throw new Error("PDF.js is only available on the client side")
  }
  
  if (!pdfjsLib) {
    pdfjsLib = await import("pdfjs-dist")
    // Configure PDF.js worker
    pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`
  }
  
  return pdfjsLib
}

export interface PDFInfo {
  pageCount: number
  title?: string
  author?: string
  subject?: string
  creator?: string
  producer?: string
  creationDate?: Date
  modificationDate?: Date
}

// Use any for PDF.js objects to avoid complex type matching
type PDFDocumentProxy = any

export interface PageInfo {
  pageNumber: number
  width: number
  height: number
  rotation: number
}

export interface PDFPreviewOptions {
  scale?: number
  pageNumber?: number
  canvas?: HTMLCanvasElement
}

/**
 * Load a PDF document and return basic information
 */
export async function loadPDF(file: File): Promise<{ doc: PDFDocumentProxy; info: PDFInfo }> {
  const pdfjs = await getPdfJs()
  const arrayBuffer = await file.arrayBuffer()
  const doc = await pdfjs.getDocument({ data: arrayBuffer }).promise
  
  const info: PDFInfo = {
    pageCount: doc.numPages,
  }

  // Try to get metadata
  try {
    const metadata = await doc.getMetadata()
    if (metadata.info) {
      const infoObj = metadata.info as Record<string, unknown>
      info.title = infoObj.Title as string
      info.author = infoObj.Author as string
      info.subject = infoObj.Subject as string
      info.creator = infoObj.Creator as string
      info.producer = infoObj.Producer as string
      info.creationDate = infoObj.CreationDate ? new Date(infoObj.CreationDate as string) : undefined
      info.modificationDate = infoObj.ModDate ? new Date(infoObj.ModDate as string) : undefined
    }
  } catch (error) {
    console.warn("Could not load PDF metadata:", error)
  }

  return { doc, info }
}

/**
 * Get page count from a PDF file
 */
export async function getPageCount(file: File): Promise<number> {
  const { info } = await loadPDF(file)
  return info.pageCount
}

/**
 * Generate a preview thumbnail for a PDF page
 */
export async function generatePagePreview(
  file: File,
  pageNumber: number = 1,
  options: PDFPreviewOptions = {}
): Promise<string> {
  const { doc } = await loadPDF(file)
  const page = await doc.getPage(pageNumber)
  
  const scale = options.scale || 0.5
  const viewport = page.getViewport({ scale })
  
  const canvas = options.canvas || document.createElement("canvas")
  const context = canvas.getContext("2d")!
  
  canvas.height = viewport.height
  canvas.width = viewport.width
  
  const renderContext = {
    canvasContext: context,
    viewport: viewport,
    canvas: canvas,
  }
  
  await page.render(renderContext).promise
  
  return canvas.toDataURL("image/jpeg", 0.8)
}

/**
 * Generate previews for multiple pages
 */
export async function generatePagePreviews(
  file: File,
  pageNumbers: number[],
  onProgress?: (update: ProgressUpdate) => void
): Promise<string[]> {
  await loadPDF(file) // Load to validate
  const previews: string[] = []
  
  for (let i = 0; i < pageNumbers.length; i++) {
    const pageNumber = pageNumbers[i]
    const preview = await generatePagePreview(file, pageNumber)
    previews.push(preview)
    
    if (onProgress) {
      onProgress({
        progress: ((i + 1) / pageNumbers.length) * 100,
        message: `Generated preview ${i + 1} of ${pageNumbers.length}`,
        stage: "preview"
      })
    }
  }
  
  return previews
}

/**
 * Merge multiple PDFs using pdf-lib
 */
export async function mergePDFs(
  files: File[],
  onProgress?: (update: ProgressUpdate) => void
): Promise<Blob> {
  const mergedPdf = await PDFDocument.create()
  
  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    const pdfBytes = await file.arrayBuffer()
    const pdf = await PDFDocument.load(pdfBytes)
    
    const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices())
    pages.forEach((page) => mergedPdf.addPage(page))
    
    if (onProgress) {
      onProgress({
        progress: ((i + 1) / files.length) * 100,
        message: `Merged ${i + 1} of ${files.length} files`,
        stage: "merging"
      })
    }
  }
  
  const pdfBytes = await mergedPdf.save()
  return new Blob([pdfBytes.buffer as ArrayBuffer], { type: "application/pdf" })
}

/**
 * Split a PDF into multiple files based on page ranges
 */
export async function splitPDF(
  file: File,
  pageRanges: Array<{ start: number; end: number; name?: string }>,
  onProgress?: (update: ProgressUpdate) => void
): Promise<Array<{ blob: Blob; name: string; pageCount: number }>> {
  const pdfBytes = await file.arrayBuffer()
  const pdf = await PDFDocument.load(pdfBytes)
  
  const results: Array<{ blob: Blob; name: string; pageCount: number }> = []
  
  for (let i = 0; i < pageRanges.length; i++) {
    const range = pageRanges[i]
    const newPdf = await PDFDocument.create()
    
    for (let pageNum = range.start; pageNum <= range.end; pageNum++) {
      const [page] = await newPdf.copyPages(pdf, [pageNum - 1])
      newPdf.addPage(page)
    }
    
    const splitBytes = await newPdf.save()
    const blob = new Blob([splitBytes.buffer as ArrayBuffer], { type: "application/pdf" })
    
    results.push({
      blob,
      name: range.name || `pages_${range.start}-${range.end}.pdf`,
      pageCount: range.end - range.start + 1
    })
    
    if (onProgress) {
      onProgress({
        progress: ((i + 1) / pageRanges.length) * 100,
        message: `Split ${i + 1} of ${pageRanges.length} ranges`,
        stage: "splitting"
      })
    }
  }
  
  return results
}

/**
 * Save a PDF blob as a downloadable file
 */
export function saveBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Create a ZIP file from multiple PDF blobs
 */
export async function createZipFromBlobs(): Promise<Blob> {
  // This would require a ZIP library like JSZip
  // For now, we'll return the first blob as a placeholder
  // In a real implementation, you'd use JSZip to create the archive
  throw new Error("ZIP creation not implemented yet. Please install JSZip.")
}

/**
 * Validate PDF file
 */
export async function validatePDF(file: File): Promise<{ valid: boolean; error?: string }> {
  try {
    await loadPDF(file)
    return { valid: true }
  } catch (error) {
    return { 
      valid: false, 
      error: error instanceof Error ? error.message : "Invalid PDF file" 
    }
  }
}

/**
 * Check if PDF is password protected
 */
export async function isPasswordProtected(file: File): Promise<boolean> {
  try {
    const pdfjs = await getPdfJs()
    const arrayBuffer = await file.arrayBuffer()
    await pdfjs.getDocument({ data: arrayBuffer }).promise
    return false
  } catch (error) {
    // PDF.js throws specific errors for password-protected files
    return error instanceof Error && error.message.includes("password")
  }
}
