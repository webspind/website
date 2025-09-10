/**
 * Progress tracking utilities for long-running operations
 */

export interface ProgressUpdate {
  progress: number // 0-100
  message: string
  stage?: string
}

export interface ProgressCallback {
  (update: ProgressUpdate): void
}

export class ProgressTracker {
  private callbacks: ProgressCallback[] = []
  private currentProgress = 0
  private currentMessage = ""
  private currentStage = ""

  constructor(private totalSteps: number = 100) {}

  addCallback(callback: ProgressCallback) {
    this.callbacks.push(callback)
  }

  removeCallback(callback: ProgressCallback) {
    const index = this.callbacks.indexOf(callback)
    if (index > -1) {
      this.callbacks.splice(index, 1)
    }
  }

  update(progress: number, message: string, stage?: string) {
    this.currentProgress = Math.min(100, Math.max(0, progress))
    this.currentMessage = message
    this.currentStage = stage || this.currentStage

    const update: ProgressUpdate = {
      progress: this.currentProgress,
      message: this.currentMessage,
      stage: this.currentStage,
    }

    this.callbacks.forEach(callback => callback(update))
  }

  updateStep(step: number, message: string, stage?: string) {
    const progress = (step / this.totalSteps) * 100
    this.update(progress, message, stage)
  }

  complete(message: string = "Complete") {
    this.update(100, message)
  }

  error(message: string) {
    this.update(this.currentProgress, `Error: ${message}`)
  }

  getCurrentProgress(): ProgressUpdate {
    return {
      progress: this.currentProgress,
      message: this.currentMessage,
      stage: this.currentStage,
    }
  }
}

/**
 * User-friendly progress messages for common operations
 */
export const ProgressMessages = {
  loading: "Loading...",
  processing: "Processing...",
  merging: "Merging PDFs...",
  splitting: "Splitting PDF...",
  compressing: "Compressing PDF...",
  converting: "Converting...",
  saving: "Saving file...",
  complete: "Complete!",
  error: "An error occurred",
} as const
