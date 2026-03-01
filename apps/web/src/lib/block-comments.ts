export interface BlockComment {
  id: string
  blockId: string
  blockIndex: number
  text: string
  author: string
  createdAt: string
  resolved: boolean
  position?: { xPercent: number; yPercent: number }
}

export function loadComments(pageId: number): BlockComment[] {
  try {
    const raw = localStorage.getItem(`forest-editor-comments-${pageId}`)
    return raw ? (JSON.parse(raw) as BlockComment[]) : []
  } catch {
    return []
  }
}

export function saveComments(pageId: number, comments: BlockComment[]): void {
  localStorage.setItem(`forest-editor-comments-${pageId}`, JSON.stringify(comments))
}
