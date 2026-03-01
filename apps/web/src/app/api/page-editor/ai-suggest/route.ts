import { NextRequest, NextResponse } from 'next/server'
import type { AiSuggestRequest, AiSuggestResponse, AiSuggestion } from '@/lib/ai-content-engine'
import { getTemplateSuggestions } from '@/lib/ai-content-templates'

function validateSecret(request: NextRequest): boolean {
  const secret = request.headers.get('x-editor-secret')
  return !!secret && secret === process.env.PAYLOAD_PREVIEW_SECRET
}

export async function POST(request: NextRequest) {
  if (!validateSecret(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: AiSuggestRequest
  try {
    body = (await request.json()) as AiSuggestRequest
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { blockType, fieldPath, tone } = body
  if (!blockType || !fieldPath || !tone) {
    return NextResponse.json({ error: 'Missing blockType, fieldPath, or tone' }, { status: 400 })
  }

  // Try LLM if env vars are configured
  const aiApiKey = process.env.AI_API_KEY
  const aiApiUrl = process.env.AI_API_URL

  if (aiApiKey && aiApiUrl) {
    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 10000)

      const llmRes = await fetch(aiApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${aiApiKey}`,
        },
        body: JSON.stringify({
          blockType,
          fieldPath,
          tone,
          context: body.context,
        }),
        signal: controller.signal,
      })

      clearTimeout(timeout)

      if (llmRes.ok) {
        const llmData = (await llmRes.json()) as { suggestions?: string[] }
        if (llmData.suggestions && Array.isArray(llmData.suggestions) && llmData.suggestions.length > 0) {
          const suggestions: AiSuggestion[] = llmData.suggestions.map((text: string) => ({
            text,
            source: 'llm' as const,
            confidence: 0.85,
          }))
          const response: AiSuggestResponse = { mode: 'llm', suggestions }
          return NextResponse.json(response)
        }
      } else {
        console.warn(`[AI Suggest] LLM returned status ${llmRes.status}`)
      }
    } catch (err) {
      console.warn('[AI Suggest] LLM fetch failed, falling back to templates:', err instanceof Error ? err.message : err)
    }
  }

  // Fallback: template engine
  const texts = getTemplateSuggestions(blockType, fieldPath, tone)
  const suggestions: AiSuggestion[] = texts.map((text) => ({
    text,
    source: 'template' as const,
    confidence: 0.7,
  }))

  const response: AiSuggestResponse = { mode: 'template', suggestions }
  return NextResponse.json(response)
}
