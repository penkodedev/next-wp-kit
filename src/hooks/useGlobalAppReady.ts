"use client";

import { useEffect, useState, useCallback } from "react";

// Simula una carga global (puedes añadir fetchs reales más tarde)
export function useGlobalAppReady() {
  const [loading, setLoading] = useState(true);

  const markAsReady = useCallback(() => {
    setLoading(false);
  }, []);

  useEffect(() => {
    const timer = setTimeout(markAsReady, 0); // puedes ajustar el delay

    return () => clearTimeout(timer);
  }, [markAsReady]);

  return { loading };
}
