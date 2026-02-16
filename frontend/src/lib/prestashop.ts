import 'server-only';

import { Buffer } from 'node:buffer';

import type { PSResult } from '@/lib/prestashop/types';

const API_BASE = process.env.NEXT_PUBLIC_PS_API_URL ?? 'http://127.0.0.1:8080';
const REQUEST_TIMEOUT_MS = 10_000;

const toMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  return 'Nie udało się pobrać danych z API.';
};

const shouldLogDebug = process.env.NODE_ENV !== 'production';

export const buildHeaders = (): HeadersInit => {
  const key = process.env.PS_WEBSERVICE_KEY;
  const baseHeaders: HeadersInit = {
    'Io-Format': 'JSON',
    'Output-Format': 'JSON',
    Accept: 'application/json'
  };

  if (!key) {
    return baseHeaders;
  }

  return {
    ...baseHeaders,
    Authorization: `Basic ${Buffer.from(`${key}:`).toString('base64')}`
  };
};

interface PrestashopFetchOptions {
  method?: 'GET' | 'POST';
  body?: string;
  revalidate?: number;
}

export const prestashopFetch = async <T>(
  endpoint: string,
  options: PrestashopFetchOptions = {}
): Promise<PSResult<T>> => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  const isGet = (options.method ?? 'GET') === 'GET';

  try {
    if (shouldLogDebug) {
      console.debug(`[prestashop] ${options.method ?? 'GET'} ${API_BASE}${endpoint}`);
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
      method: options.method ?? 'GET',
      headers: {
        ...buildHeaders(),
        ...(options.body ? { 'Content-Type': 'application/json' } : {})
      },
      body: options.body,
      signal: controller.signal,
      ...(isGet ? { next: { revalidate: options.revalidate ?? 60 } } : {})
    });

    if (!response.ok) {
      const message = `Błąd API (${response.status}).`;
      if (shouldLogDebug) {
        console.debug(`[prestashop] response not ok: ${message}`);
      }
      return { data: null, error: message };
    }

    const data = (await response.json()) as T;
    return { data, error: null };
  } catch (error) {
    const message = toMessage(error);
    if (shouldLogDebug) {
      console.debug(`[prestashop] fetch error: ${message}`);
    }
    return { data: null, error: message };
  } finally {
    clearTimeout(timeout);
  }
};
