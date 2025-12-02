"use client";

import { useEffect } from 'react';
import { useWpPageId } from '@/utils/wordpress/WpPageIdContext';

export const WpPageId = ({ id }: { id: number }) => {
	const { setPageId } = useWpPageId();

	useEffect(() => {
		setPageId(id);
		return () => setPageId(null); // Limpia el ID al desmontar el componente
	}, [id, setPageId]);

	return null; // Este componente no renderiza nada
};
