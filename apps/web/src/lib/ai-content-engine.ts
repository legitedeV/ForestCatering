// AI Content Engine — types and orchestrator for offline-first content generation

export interface AiSuggestion {
  text: string
  source: 'template' | 'llm'
  confidence: number
}

export interface AiSuggestRequest {
  blockType: string
  fieldPath: string
  tone: 'professional' | 'friendly' | 'luxury'
  context?: Record<string, string>
}

export interface AiSuggestResponse {
  mode: 'template' | 'llm'
  suggestions: AiSuggestion[]
}
