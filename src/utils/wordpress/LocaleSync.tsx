// Client component that syncs the HTML lang attribute with the current locale

'use client';

import { useEffect } from 'react';

interface LocaleSyncProps {
	locale: string;
}

export default function LocaleSync({ locale }: LocaleSyncProps) {
	useEffect(() => {
		// Set HTML lang attribute directly from locale
		// WordPress WPML returns valid lang codes (es, en, pt-br, etc.)
		document.documentElement.lang = locale;

		// Optional: Store locale in localStorage for persistence
		if (typeof window !== 'undefined') {
			localStorage.setItem('preferred-locale', locale);
		}
	}, [locale]);

	// This component doesn't render anything
	return null;
}
