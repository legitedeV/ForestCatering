'use client'

import { useState } from 'react'
import { usePageEditor } from '@/lib/page-editor-store'
import { TEMPLATES, DEFAULT_CSS_VARIABLES } from '@/lib/template-definitions'

/* ------------------------------------------------------------------ */
/*  Collapsible Accordion                                              */
/* ------------------------------------------------------------------ */
function Accordion({
  title,
  defaultOpen = false,
  children,
}: {
  title: string
  defaultOpen?: boolean
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className="border-b border-forest-800">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-3 py-2.5 text-sm font-medium text-cream transition hover:bg-forest-800/40"
        aria-expanded={open}
      >
        <span>{title}</span>
        <span className="text-forest-400">{open ? '▾' : '▸'}</span>
      </button>
      {open && <div className="px-3 pb-3">{children}</div>}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Template Selector                                                   */
/* ------------------------------------------------------------------ */
function TemplateSelector() {
  const pageTemplate = usePageEditor((s) => s.pageTemplate)
  const setPageTemplate = usePageEditor((s) => s.setPageTemplate)
  const setCssOverride = usePageEditor((s) => s.setCssOverride)
  const resetCssOverrides = usePageEditor((s) => s.resetCssOverrides)

  const handleSelect = (key: string | null) => {
    setPageTemplate(key)
    // Apply color overrides from template
    if (key) {
      const template = TEMPLATES.find((t) => t.key === key)
      if (template) {
        resetCssOverrides()
        for (const [variable, value] of Object.entries(template.colorOverrides)) {
          setCssOverride(variable, value)
        }
      }
    } else {
      resetCssOverrides()
    }
  }

  return (
    <Accordion title="🎨 Template" defaultOpen>
      <div className="space-y-2">
        {/* Custom / brak template */}
        <button
          onClick={() => handleSelect(null)}
          className={`flex w-full items-center gap-2 rounded-lg border px-3 py-2 text-left text-xs transition ${
            pageTemplate === null
              ? 'border-accent-warm bg-forest-800 text-cream'
              : 'border-forest-700 bg-forest-800/50 text-forest-300 hover:border-forest-600 hover:text-cream'
          }`}
          aria-label="Brak template — Custom"
          aria-pressed={pageTemplate === null}
        >
          <span
            className="h-6 w-6 shrink-0 rounded"
            style={{ background: 'linear-gradient(135deg, #333A43, #626C79)' }}
          />
          <div className="min-w-0 flex-1">
            <p className="font-medium">Custom</p>
            <p className="truncate text-forest-500">Bez predefiniowanego motywu</p>
          </div>
        </button>

        {/* Template cards */}
        {TEMPLATES.map((t) => {
          const isActive = pageTemplate === t.key
          return (
            <button
              key={t.key}
              onClick={() => handleSelect(t.key)}
              className={`flex w-full items-center gap-2 rounded-lg border px-3 py-2 text-left text-xs transition ${
                isActive
                  ? 'border-accent-warm bg-forest-800 text-cream'
                  : 'border-forest-700 bg-forest-800/50 text-forest-300 hover:border-forest-600 hover:text-cream'
              }`}
              aria-label={`Template: ${t.name}`}
              aria-pressed={isActive}
            >
              <span
                className="h-6 w-6 shrink-0 rounded"
                style={{ background: t.previewGradient }}
              />
              <div className="min-w-0 flex-1">
                <p className="font-medium">
                  {t.icon} {t.name}
                </p>
                <p className="truncate text-forest-500">{t.description}</p>
              </div>
            </button>
          )
        })}
      </div>
    </Accordion>
  )
}

/* ------------------------------------------------------------------ */
/*  Color Picker Row                                                    */
/* ------------------------------------------------------------------ */
function ColorPickerRow({
  label,
  variable,
  value,
  onChange,
}: {
  label: string
  variable: string
  value: string
  onChange: (variable: string, value: string) => void
}) {
  return (
    <div className="flex items-center gap-2">
      <label
        className="min-w-0 flex-1 truncate text-xs font-medium uppercase tracking-wider text-forest-400"
        htmlFor={`color-${variable}`}
      >
        {label}
      </label>
      <input
        id={`color-${variable}`}
        type="color"
        value={value}
        onChange={(e) => onChange(variable, e.target.value)}
        className="h-7 w-7 shrink-0 cursor-pointer rounded border border-forest-700 bg-forest-800"
        aria-label={`Kolor: ${label}`}
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(variable, e.target.value)}
        className="w-20 rounded border border-forest-700 bg-forest-800 px-2 py-1 font-mono text-xs text-cream focus:border-accent focus:ring-accent focus:outline-none"
        aria-label={`Hex: ${label}`}
      />
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  CSS Variables Editor                                                */
/* ------------------------------------------------------------------ */
function CssVariablesEditor() {
  const cssOverrides = usePageEditor((s) => s.cssOverrides)
  const setCssOverride = usePageEditor((s) => s.setCssOverride)
  const resetCssOverrides = usePageEditor((s) => s.resetCssOverrides)

  const variables = [
    { label: 'Accent Warm', variable: '--color-accent-warm' },
    { label: 'Accent', variable: '--color-accent' },
    { label: 'Forest Green', variable: '--color-forest-green' },
    { label: 'Cream', variable: '--color-cream' },
    { label: 'Background', variable: '--background' },
    { label: 'Foreground', variable: '--foreground' },
  ]

  return (
    <Accordion title="🎨 Zmienne CSS (kolory)">
      <div className="space-y-2">
        {variables.map((v) => (
          <ColorPickerRow
            key={v.variable}
            label={v.label}
            variable={v.variable}
            value={cssOverrides[v.variable] ?? DEFAULT_CSS_VARIABLES[v.variable] ?? '#000000'}
            onChange={setCssOverride}
          />
        ))}

        <button
          onClick={resetCssOverrides}
          className="mt-2 w-full rounded border border-forest-700 bg-forest-800 px-3 py-1.5 text-xs text-forest-300 transition hover:bg-forest-700 hover:text-cream"
          aria-label="Resetuj kolory do domyślnych"
        >
          ↩ Reset do domyślnych
        </button>
      </div>
    </Accordion>
  )
}

/* ------------------------------------------------------------------ */
/*  Advanced CSS Editor                                                 */
/* ------------------------------------------------------------------ */
function AdvancedCssEditor() {
  const customCss = usePageEditor((s) => s.customCss)
  const setCustomCss = usePageEditor((s) => s.setCustomCss)

  return (
    <Accordion title="🖥 Zaawansowany CSS">
      <div className="space-y-2">
        <label
          htmlFor="custom-css"
          className="text-xs font-medium uppercase tracking-wider text-forest-400"
        >
          Własny CSS (per-page)
        </label>
        <textarea
          id="custom-css"
          value={customCss}
          onChange={(e) => setCustomCss(e.target.value)}
          placeholder={`.my-class {\n  color: #D4A853;\n}`}
          rows={8}
          className="w-full rounded border border-forest-700 bg-forest-800 px-3 py-2 font-mono text-xs text-cream placeholder:text-forest-600 focus:border-accent focus:ring-accent focus:outline-none"
          aria-label="Własny CSS"
          spellCheck={false}
        />
        <p className="text-xs text-forest-500">
          CSS stosowany tylko do tej strony w podglądzie.
        </p>
      </div>
    </Accordion>
  )
}

/* ------------------------------------------------------------------ */
/*  Main StylePanel                                                     */
/* ------------------------------------------------------------------ */
export function StylePanel() {
  return (
    <div className="space-y-0">
      <TemplateSelector />
      <CssVariablesEditor />
      <AdvancedCssEditor />
    </div>
  )
}
