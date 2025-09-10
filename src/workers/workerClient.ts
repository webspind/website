/**
 * Web Worker client for handling PDF operations
 * Uses Comlink for easy communication with workers
 */

import * as Comlink from "comlink"
import { ProgressUpdate } from "@/lib/progress"

export interface WorkerTask {
  id: string
  type: string
  data: unknown
}

export interface WorkerResponse {
  id: string
  success: boolean
  data?: unknown
  error?: string
  progress?: ProgressUpdate
}

export interface WorkerClient {
  processTask(task: WorkerTask): Promise<WorkerResponse>
  cancelTask(taskId: string): Promise<void>
  isSupported(): Promise<boolean>
}

class WorkerManager {
  private workers: Map<string, Comlink.Remote<WorkerClient>> = new Map()
  private taskCallbacks: Map<string, (response: WorkerResponse) => void> = new Map()

  async getWorker(workerType: string): Promise<Comlink.Remote<WorkerClient>> {
    if (this.workers.has(workerType)) {
      return this.workers.get(workerType)!
    }

    const worker = new Worker(new URL(`/workers/${workerType}Worker.js`, import.meta.url))
    const workerClient = Comlink.wrap<WorkerClient>(worker)
    
    this.workers.set(workerType, workerClient)
    return workerClient
  }

  async processTask(
    workerType: string,
    task: WorkerTask,
    onProgress?: (update: ProgressUpdate) => void
  ): Promise<WorkerResponse> {
    const worker = await this.getWorker(workerType)
    
    // Set up progress callback if provided
    if (onProgress) {
      this.taskCallbacks.set(task.id, (response: WorkerResponse) => {
        if (response.progress) {
          onProgress(response.progress)
        }
      })
    }

    try {
      const result = await worker.processTask(task)
      
      // Clean up callback
      this.taskCallbacks.delete(task.id)
      
      return result
    } catch (error) {
      this.taskCallbacks.delete(task.id)
      throw error
    }
  }

  async cancelTask(workerType: string, taskId: string): Promise<void> {
    const worker = await this.getWorker(workerType)
    await worker.cancelTask(taskId)
    this.taskCallbacks.delete(taskId)
  }

  async isWorkerSupported(workerType: string): Promise<boolean> {
    try {
      const worker = await this.getWorker(workerType)
      return await worker.isSupported()
    } catch {
      return false
    }
  }

  terminateAll(): void {
    this.workers.forEach(() => {
      // Comlink doesn't expose terminate directly, but the worker will be garbage collected
    })
    this.workers.clear()
    this.taskCallbacks.clear()
  }
}

// Singleton instance
export const workerManager = new WorkerManager()

/**
 * Helper function to create a task
 */
export function createTask(type: string, data: unknown): WorkerTask {
  return {
    id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type,
    data,
  }
}

/**
 * Helper function to process a PDF task with progress updates
 */
export async function processPdfTask(
  task: WorkerTask,
  onProgress?: (update: ProgressUpdate) => void
): Promise<WorkerResponse> {
  return workerManager.processTask("pdf", task, onProgress)
}

/**
 * Helper function to cancel a PDF task
 */
export async function cancelPdfTask(taskId: string): Promise<void> {
  return workerManager.cancelTask("pdf", taskId)
}
