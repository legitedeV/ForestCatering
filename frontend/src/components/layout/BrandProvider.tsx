'use client';

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

type BrandMode = 'catering' | 'bar';

interface BrandContextValue {
  mode: BrandMode;
  setMode: (mode: BrandMode) => void;
}

const BrandContext = createContext<BrandContextValue | undefined>(undefined);

const STORAGE_KEY = 'fc_brand_mode';
const COOKIE_MAX_AGE_SECONDS = 31_536_000;
const isBrandMode = (value: string | null | undefined): value is BrandMode =>
  value === 'catering' || value === 'bar';

export const BrandProvider = ({ children }: { children: ReactNode }) => {
  const [mode, setMode] = useState<BrandMode>('catering');

  useEffect(() => {
    const fromStorage = localStorage.getItem(STORAGE_KEY);
    const fromCookie = document.cookie
      .split('; ')
      .find((entry) => entry.startsWith('fc_brand_mode='))
      ?.split('=')[1];

    if (isBrandMode(fromStorage)) {
      setMode(fromStorage);
      return;
    }

    if (isBrandMode(fromCookie)) {
      setMode(fromCookie);
      return;
    }

    setMode('catering');
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, mode);
    const secureFlag = window.location.protocol === 'https:' ? '; Secure' : '';
    document.cookie = `fc_brand_mode=${mode}; path=/; max-age=${COOKIE_MAX_AGE_SECONDS}; SameSite=Lax${secureFlag}`;
    document.documentElement.dataset.brand = mode;
  }, [mode]);

  const value = useMemo(() => ({ mode, setMode }), [mode]);

  return <BrandContext.Provider value={value}>{children}</BrandContext.Provider>;
};

export const useBrand = () => {
  const context = useContext(BrandContext);
  if (!context) {
    throw new Error('useBrand must be used within BrandProvider');
  }
  return context;
};
