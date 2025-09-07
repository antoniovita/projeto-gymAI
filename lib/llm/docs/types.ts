export interface Document {
  id: string
  content: string
  metadata: {
    title?: string
    category?: string
    tags?: string[]
    timestamp: number
  }
}
