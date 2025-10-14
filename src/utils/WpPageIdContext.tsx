// src/utils/WpPageIdContext.tsx
"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

// 1. Definir el tipo y crear el contexto
type WpPageIdContextType = {
  pageId: number | null;
  setPageId: (id: number | null) => void;
};

const WpPageIdContext = createContext<WpPageIdContextType | undefined>(undefined);

// 2. Crear el Provider que envuelve la aplicación
export const WpPageIdProvider = ({ children }: { children: ReactNode }) => {
  const [pageId, setPageId] = useState<number | null>(null);
  return (
    <WpPageIdContext.Provider value={{ pageId, setPageId }}>
      {children}
    </WpPageIdContext.Provider>
  );
};

// 3. Crear el hook para usar el contexto
export const useWpPageId = () => {
  const context = useContext(WpPageIdContext);
  if (!context) {
    throw new Error('useWpPageId must be used within a WpPageIdProvider');
  }
  return context;
};