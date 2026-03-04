'use client';

import { useState, useCallback } from 'react';

type CursorType = 'default' | 'pointer' | 'text' | 'hidden';

export function useCursor(initialType: CursorType = 'default') {
  const [cursorType, setCursorTypeState] = useState<CursorType>(initialType);

  const setCursorType = useCallback((type: CursorType) => {
    setCursorTypeState(type);
  }, []);

  return { cursorType, setCursorType } as const;
}
