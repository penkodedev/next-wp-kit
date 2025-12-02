"use client";

import { useEffect, useMemo } from "react";
import { usePathname } from "next/navigation";
import { useWpPageId } from "@/utils/wordpress/WpPageIdContext";
import { CPT_SLUG_MAP } from "@/utils/routing/cptConfig";
import localesConfig from "@/i18n/locales.generated.json";

interface BodyClassProps {
	children: React.ReactNode;
}

const BodyClass = ({ children }: BodyClassProps) => {
	const pathname = usePathname();
	const { pageId } = useWpPageId();

	// Generate body classes dynamically from pathname
	const bodyClasses = useMemo(() => {
		const pathSegments = (pathname || '').split('/').filter(Boolean);

		// Remove locale from path segments for class generation
		const slugWithoutLocale = (pathSegments.length > 0 && localesConfig.supportedLocales.includes(pathSegments[0])) ? pathSegments.slice(1) : pathSegments;

		let classes: string[] = [];

		// Detect taxonomies dynamically (could be improved to fetch from API if needed)
		const validTaxonomies = ['categoria', 'nivel_educativo', 'tags']; // TODO: make dynamic if needed

		if (slugWithoutLocale.length === 1 && CPT_SLUG_MAP[slugWithoutLocale[0]]) {
			const internalCpt = CPT_SLUG_MAP[slugWithoutLocale[0]];
			classes = ['archive', `archive-${internalCpt}`];
		} else if (slugWithoutLocale.length === 0) {
			classes = ["page-home"];
		} else if (slugWithoutLocale.length === 2 && CPT_SLUG_MAP[slugWithoutLocale[0]]) {
			// It's a CPT single page
			const internalCpt = CPT_SLUG_MAP[slugWithoutLocale[0]];
			classes = [`single`, `single-${internalCpt}`];
			if (pageId) {
				classes.push(`postid-${pageId}`);
			}
		} else if (slugWithoutLocale.length === 1 && validTaxonomies.includes(slugWithoutLocale[0])) {
			classes = [`taxonomy`, `taxonomy-${slugWithoutLocale[0]}`];
		} else {
			classes = ["page"];
		}

		return classes.join(' ');
	}, [pathname, pageId]);

	useEffect(() => {
		document.body.className = bodyClasses;
		return () => {
			document.body.className = '';
		};
	}, [bodyClasses]);

	return <>{children}</>;
};

export default BodyClass;
