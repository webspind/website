/**
 * PDF Worker - Handles PDF operations in a Web Worker
 * Uses pdf-lib for PDF manipulation
 */

importScripts('https://unpkg.com/pdf-lib@1.17.1/dist/pdf-lib.min.js')

class PDFWorker {
  constructor() {
    this.activeTasks = new Map()
  }

  async processTask(task) {
    const { id, type, data } = task
    
    try {
      this.activeTasks.set(id, { status: 'running', startTime: Date.now() })
      
      let result
      switch (type) {
        case 'merge':
          result = await this.mergePDFs(data)
          break
        case 'split':
          result = await this.splitPDF(data)
          break
        case 'compress':
          result = await this.compressPDF(data)
          break
        case 'getPageCount':
          result = await this.getPageCount(data)
          break
        default:
          throw new Error(`Unknown task type: ${type}`)
      }
      
      this.activeTasks.delete(id)
      
      return {
        id,
        success: true,
        data: result
      }
    } catch (error) {
      this.activeTasks.delete(id)
      
      return {
        id,
        success: false,
        error: error.message
      }
    }
  }

  async cancelTask(taskId) {
    this.activeTasks.delete(taskId)
  }

  async isSupported() {
    return typeof PDFLib !== 'undefined'
  }

  async mergePDFs(data) {
    const { files, onProgress } = data
    const mergedPdf = await PDFLib.PDFDocument.create()
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const pdfBytes = await file.arrayBuffer()
      const pdf = await PDFLib.PDFDocument.load(pdfBytes)
      
      const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices())
      pages.forEach((page) => mergedPdf.addPage(page))
      
      if (onProgress) {
        onProgress({
          progress: ((i + 1) / files.length) * 100,
          message: `Merged ${i + 1} of ${files.length} files`,
          stage: 'merging'
        })
      }
    }
    
    const pdfBytes = await mergedPdf.save()
    return { pdfBytes }
  }

  async splitPDF(data) {
    const { file, pageRanges, onProgress } = data
    const pdfBytes = await file.arrayBuffer()
    const pdf = await PDFLib.PDFDocument.load(pdfBytes)
    
    const results = []
    
    for (let i = 0; i < pageRanges.length; i++) {
      const range = pageRanges[i]
      const newPdf = await PDFLib.PDFDocument.create()
      
      for (let pageNum = range.start; pageNum <= range.end; pageNum++) {
        const [page] = await newPdf.copyPages(pdf, [pageNum - 1])
        newPdf.addPage(page)
      }
      
      const splitBytes = await newPdf.save()
      results.push({ 
        bytes: splitBytes, 
        name: `pages_${range.start}-${range.end}.pdf`,
        pageCount: range.end - range.start + 1
      })
      
      if (onProgress) {
        onProgress({
          progress: ((i + 1) / pageRanges.length) * 100,
          message: `Split ${i + 1} of ${pageRanges.length} ranges`,
          stage: 'splitting'
        })
      }
    }
    
    return { results }
  }

  async compressPDF(data) {
    const { file, quality, onProgress } = data
    const pdfBytes = await file.arrayBuffer()
    const pdf = await PDFLib.PDFDocument.load(pdfBytes)
    
    if (onProgress) {
      onProgress({
        progress: 50,
        message: 'Compressing PDF...',
        stage: 'compressing'
      })
    }
    
    // Note: pdf-lib doesn't have built-in compression
    // This is a placeholder for future implementation
    const compressedBytes = await pdf.save({
      useObjectStreams: false,
      addDefaultPage: false
    })
    
    if (onProgress) {
      onProgress({
        progress: 100,
        message: 'Compression complete',
        stage: 'complete'
      })
    }
    
    return { pdfBytes: compressedBytes }
  }

  async getPageCount(data) {
    const { file } = data
    const pdfBytes = await file.arrayBuffer()
    const pdf = await PDFLib.PDFDocument.load(pdfBytes)
    
    return { pageCount: pdf.getPageCount() }
  }
}

// Create worker instance and expose it via Comlink
const worker = new PDFWorker()

// Expose the worker to the main thread
self.addEventListener('message', async (event) => {
  const { type, data } = event.data
  
  if (type === 'processTask') {
    const result = await worker.processTask(data)
    self.postMessage({ type: 'taskResult', data: result })
  } else if (type === 'cancelTask') {
    await worker.cancelTask(data.taskId)
    self.postMessage({ type: 'taskCancelled', data: { taskId: data.taskId } })
  }
})
