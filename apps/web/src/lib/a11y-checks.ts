// Accessibility audit — DOM-based checks for preview iframe

export interface A11yIssue {
  severity: 'error' | 'warning' | 'info'
  rule: string
  message: string
  element?: string // tag + text snippet
  blockIndex?: number // if inside [data-block-id]
}

function getBlockIndex(el: Element): number | undefined {
  const wrapper = el.closest('[data-block-id]')
  if (!wrapper) return undefined
  const id = wrapper.getAttribute('id') // "editor-block-N"
  const match = id?.match(/editor-block-(\d+)/)
  return match ? parseInt(match[1]) : undefined
}

/** Safely describe an element for display (tag + attributes + text snippet) */
function describeElement(el: Element): string {
  const tag = el.tagName.toLowerCase()
  const id = el.getAttribute('id') ? `#${el.getAttribute('id')}` : ''
  const cls = el.className ? `.${String(el.className).split(' ').slice(0, 2).join('.')}` : ''
  const text = el.textContent?.trim().slice(0, 30) ?? ''
  return `<${tag}${id}${cls}>${text ? ` "${text}"` : ''}`.slice(0, 100)
}

export function runA11yAudit(doc: Document): A11yIssue[] {
  const issues: A11yIssue[] = []

  // img without alt
  doc.querySelectorAll('img:not([alt])').forEach((el) => {
    issues.push({
      severity: 'error',
      rule: 'img-alt',
      message: 'Obraz bez atrybutu alt',
      element: describeElement(el),
      blockIndex: getBlockIndex(el),
    })
  })

  // link without text
  doc.querySelectorAll('a').forEach((el) => {
    if (!el.textContent?.trim() && !el.getAttribute('aria-label')) {
      issues.push({
        severity: 'error',
        rule: 'link-text',
        message: 'Link bez tekstu lub aria-label',
        element: describeElement(el),
        blockIndex: getBlockIndex(el),
      })
    }
  })

  // button without text
  doc.querySelectorAll('button').forEach((el) => {
    if (!el.textContent?.trim() && !el.getAttribute('aria-label')) {
      issues.push({
        severity: 'error',
        rule: 'button-text',
        message: 'Przycisk bez tekstu lub aria-label',
        element: describeElement(el),
        blockIndex: getBlockIndex(el),
      })
    }
  })

  // input without label
  doc.querySelectorAll('input, textarea, select').forEach((el) => {
    const id = el.getAttribute('id')
    if (
      !el.getAttribute('aria-label') &&
      !el.getAttribute('aria-labelledby') &&
      !(id && doc.querySelector(`label[for="${CSS.escape(id)}"]`))
    ) {
      issues.push({
        severity: 'error',
        rule: 'input-label',
        message: 'Pole formularza bez labela',
        element: describeElement(el),
        blockIndex: getBlockIndex(el),
      })
    }
  })

  // >1 h1
  const h1Count = doc.querySelectorAll('h1').length
  if (h1Count > 1) {
    issues.push({
      severity: 'warning',
      rule: 'single-h1',
      message: `Znaleziono ${h1Count} elementów h1 — powinien być 1`,
    })
  }

  // heading level skip
  const headings = Array.from(doc.querySelectorAll('h1,h2,h3,h4,h5,h6')).map((h) =>
    parseInt(h.tagName[1]),
  )
  for (let i = 1; i < headings.length; i++) {
    if (headings[i] - headings[i - 1] > 1) {
      issues.push({
        severity: 'warning',
        rule: 'heading-order',
        message: `Pominięty poziom nagłówka: h${headings[i - 1]} → h${headings[i]}`,
      })
    }
  }

  // tabindex > 0
  doc.querySelectorAll('[tabindex]').forEach((el) => {
    if (parseInt(el.getAttribute('tabindex') || '0') > 0) {
      issues.push({
        severity: 'warning',
        rule: 'tabindex',
        message: 'tabindex > 0 nie jest zalecany',
        element: describeElement(el),
        blockIndex: getBlockIndex(el),
      })
    }
  })

  // html lang
  if (!doc.documentElement.getAttribute('lang')) {
    issues.push({
      severity: 'info',
      rule: 'html-lang',
      message: 'Brak atrybutu lang na <html>',
    })
  }

  // Motion check: animation without reduced-motion
  doc.querySelectorAll('[class*="anim-"]').forEach((el) => {
    const cs = window.getComputedStyle(el)
    if (cs.animationDuration && cs.animationDuration !== '0s' && parseFloat(cs.animationDuration) < 0.8) {
      issues.push({
        severity: 'warning',
        rule: 'motion-duration',
        message: `Animacja szybsza niż 800ms (${cs.animationDuration}) — może być agresywna`,
        element: describeElement(el),
        blockIndex: getBlockIndex(el),
      })
    }
  })

  return issues
}
