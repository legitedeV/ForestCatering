'use client';

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

type BrandMode = 'catering' | 'bar';

interface BrandContextValue {
  mode: BrandMode;
  setMode: (mode: BrandMode) => void;
}

const BrandContext = createContext<BrandContextValue | undefined>(undefined);

const STORAGE_KEY = 'fc_brand_mode';

export const BrandProvider = ({ children }: { children: ReactNode }) => {
  const [mode, setMode] = useState<BrandMode>('catering');

  useEffect(() => {
    const fromStorage = localStorage.getItem(STORAGE_KEY) as BrandMode | null;
    const fromCookie = document.cookie
      .split('; ')
      .find((entry) => entry.startsWith('fc_brand_mode='))
      ?.split('=')[1] as BrandMode | undefined;

    const nextMode = fromStorage ?? fromCookie ?? 'catering';
    setMode(nextMode === 'bar' ? 'bar' : 'catering');
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, mode);
    document.cookie = `fc_brand_mode=${mode}; path=/; max-age=31536000; SameSite=Lax`;
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
