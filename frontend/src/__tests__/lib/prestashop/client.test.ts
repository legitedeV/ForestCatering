import { afterEach, describe, expect, it, vi } from 'vitest';

import { buildHeaders, prestashopFetch } from '@/lib/prestashop/client';

describe('prestashop client', () => {
  const originalFetch = global.fetch;
  const originalEnv = process.env;

  afterEach(() => {
    global.fetch = originalFetch;
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  it('builds auth header from PS_WEBSERVICE_KEY', () => {
    process.env = { ...originalEnv, PS_WEBSERVICE_KEY: 'abc123' };

    const headers = buildHeaders() as Record<string, string>;

    expect(headers.Authorization).toBe('Basic YWJjMTIzOg==');
    expect(headers['Io-Format']).toBe('JSON');
    expect(headers['Output-Format']).toBe('JSON');
  });

  it('returns data and uses revalidation cache for GET', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ products: [] })
    });
    global.fetch = fetchMock as unknown as typeof fetch;

    const result = await prestashopFetch<{ products: [] }>('/api/products?display=full');

    expect(result.error).toBeNull();
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/api/products?display=full'),
      expect.objectContaining({
        next: { revalidate: 60 }
      })
    );
  });

  it('returns graceful error when fetch fails', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('network down')) as unknown as typeof fetch;

    const result = await prestashopFetch('/api/products?display=full');

    expect(result.data).toBeNull();
    expect(result.error).toContain('network down');
  });

  it('sends abort signal for timeout handling', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) });
    global.fetch = fetchMock as unknown as typeof fetch;

    await prestashopFetch('/api/products?display=full');

    expect(fetchMock).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ signal: expect.any(AbortSignal) })
    );
  });
});
