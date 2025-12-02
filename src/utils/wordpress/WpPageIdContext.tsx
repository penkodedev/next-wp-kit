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

// 3. Component to set page ID
export const WpPageIdSetter = ({ pageId }: { pageId: number }) => {
	const { setPageId } = useWpPageId();

	useEffect(() => {
		setPageId(pageId);
		return () => setPageId(null); // Clean up on unmount
	}, [pageId, setPageId]);

	return null; // This component doesn't render anything
};

// 4. Hook to use the context
export const useWpPageId = () => {
	const context = useContext(WpPageIdContext);
	if (!context) {
		// Return safe defaults instead of throwing error
		return { pageId: null, setPageId: () => {} };
	}
	return context;
};
