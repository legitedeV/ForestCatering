'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Button, FieldLabel, TextareaInput, toast, useField } from '@payloadcms/ui'

type NavLink = {
  label: string
  url: string
}

type FooterColumn = {
  links: NavLink[]
  title: string
}

type NavigationPayload = {
  footerColumns: FooterColumn[]
  headerItems: NavLink[]
}

const INITIAL_JSON = '{\n  "headerItems": [],\n  "footerColumns": []\n}'

const pickNavigationData = (value: unknown): NavigationPayload => {
  const source = (value ?? {}) as Partial<NavigationPayload>

  return {
    headerItems: Array.isArray(source.headerItems)
      ? source.headerItems.map((item) => ({
          label: typeof item?.label === 'string' ? item.label : '',
          url: typeof item?.url === 'string' ? item.url : '',
        }))
      : [],
    footerColumns: Array.isArray(source.footerColumns)
      ? source.footerColumns.map((column) => ({
          title: typeof column?.title === 'string' ? column.title : '',
          links: Array.isArray(column?.links)
            ? column.links.map((item) => ({
                label: typeof item?.label === 'string' ? item.label : '',
                url: typeof item?.url === 'string' ? item.url : '',
              }))
            : [],
        }))
      : [],
  }
}

export const ImportExportNavigation: React.FC = () => {
  const { value, setValue } = useField<string>({ path: 'navigationJSONImport' })
  const [exportJSON, setExportJSON] = useState(INITIAL_JSON)
  const [isBusy, setIsBusy] = useState(false)

  const importValue = value || ''

  const loadCurrentNavigation = useCallback(async () => {
    setIsBusy(true)

    try {
      const response = await fetch('/api/globals/navigation?depth=0', { credentials: 'include' })

      if (!response.ok) {
        throw new Error(`Nie udało się pobrać globala navigation (HTTP ${response.status}).`)
      }

      const data = (await response.json()) as unknown
      const normalized = pickNavigationData(data)
      setExportJSON(JSON.stringify(normalized, null, 2))
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Nieznany błąd pobierania globala navigation.'
      toast.error(message)
    } finally {
      setIsBusy(false)
    }
  }, [])

  useEffect(() => {
    void loadCurrentNavigation()
  }, [loadCurrentNavigation])

  const copyExportJSON = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(exportJSON)
      toast.success('Skopiowano JSON do schowka.')
    } catch {
      toast.error('Nie udało się skopiować JSON do schowka.')
    }
  }, [exportJSON])

  const importJSON = useCallback(async () => {
    setIsBusy(true)

    try {
      const response = await fetch('/api/navigation/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ json: importValue }),
      })

      const body = (await response.json().catch(() => ({}))) as {
        errors?: string[]
        message?: string
        navigation?: unknown
      }

      if (!response.ok) {
        const fallback = `Import nie powiódł się (HTTP ${response.status}).`
        const message = body.message || (body.errors && body.errors.join(' ')) || fallback
        throw new Error(message)
      }

      const normalized = pickNavigationData(body.navigation)
      const pretty = JSON.stringify(normalized, null, 2)

      setExportJSON(pretty)
      setValue(pretty)
      toast.success('Nawigacja została zaimportowana i zapisana.')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Nie udało się zaimportować JSON.'
      toast.error(message)
    } finally {
      setIsBusy(false)
    }
  }, [importValue, setValue])

  const exportValue = useMemo(() => exportJSON, [exportJSON])

  return (
    <div style={{ border: '1px solid var(--theme-elevation-150)', borderRadius: 8, marginTop: 24, padding: 16 }}>
      <h3 style={{ marginBottom: 12 }}>Import / Export JSON</h3>

      <div style={{ marginBottom: 18 }}>
        <FieldLabel label="Export (aktualny JSON)" />
        <TextareaInput
          path="navigationJSONExportPreview"
          readOnly
          rows={12}
          value={exportValue}
        />
        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          <Button buttonStyle="secondary" disabled={isBusy} onClick={copyExportJSON} type="button">
            Kopiuj
          </Button>
          <Button buttonStyle="secondary" disabled={isBusy} onClick={() => void loadCurrentNavigation()} type="button">
            Odśwież eksport
          </Button>
        </div>
      </div>

      <div>
        <FieldLabel label="Import (wklej JSON)" />
        <TextareaInput
          onChange={(event) => setValue(event.target.value)}
          path="navigationJSONImport"
          placeholder={INITIAL_JSON}
          rows={12}
          value={importValue}
        />
        <div style={{ marginTop: 8 }}>
          <Button disabled={isBusy || !importValue.trim()} onClick={() => void importJSON()} type="button">
            Importuj
          </Button>
        </div>
      </div>
    </div>
  )
}

export default ImportExportNavigation
