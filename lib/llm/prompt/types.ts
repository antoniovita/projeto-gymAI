export interface PromptBuilder {
  getSystemPrompt(): string
  formatUserMessage(query: string, ragContext: string): string
}
