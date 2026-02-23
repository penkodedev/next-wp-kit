"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { useWpPageId } from "@/utils/wordpress/WpPageIdContext";
import { CPT_SLUG_MAP } from "@/utils/config/cptConfig";
import localesConfig from "@/i18n/locales.generated.json";
import { fetchAPI } from "@/api/wordpressApi";

interface BodyClassProps {
	children: React.ReactNode;
}

const BodyClass = ({ children }: BodyClassProps) => {
	const pathname = usePathname();
	const { pageId } = useWpPageId();

	// Fetch taxonomías dinámicamente desde WordPress
	const [taxonomies, setTaxonomies] = useState<string[]>([]);

	useEffect(() => {
		const fetchTaxonomies = async () => {
			try {
				const data = await fetchAPI('/wp/v2/taxonomies');
				if (data) {
					setTaxonomies(Object.keys(data));
				}
			} catch (e) {
				// Fallback a lista vacía si falla
				setTaxonomies([]);
			}
		};
		fetchTaxonomies();
	}, []);

	// Generate body classes dynamically from pathname
	const bodyClasses = useMemo(() => {
		const pathSegments = (pathname || '').split('/').filter(Boolean);

		// Remove locale from path segments for class generation
		const slugWithoutLocale = (pathSegments.length > 0 && localesConfig.supportedLocales.includes(pathSegments[0])) ? pathSegments.slice(1) : pathSegments;

		let classes: string[] = [];

		// Detect taxonomies dynamically desde la API
		const validTaxonomies = taxonomies;

		// Special routes (search, sitemap, etc.)
		const specialRoutes = ['search', 'sitemap', 'blog', 'feed.xml'];
		const isSpecialRoute = slugWithoutLocale.length > 0 && specialRoutes.includes(slugWithoutLocale[0]);

		if (slugWithoutLocale.length === 1 && CPT_SLUG_MAP[slugWithoutLocale[0]]) {
			// CPT Archive
			const internalCpt = CPT_SLUG_MAP[slugWithoutLocale[0]];
			classes = ['archive', `archive-${internalCpt}`];
		} else if (slugWithoutLocale.length === 0) {
			// Home page
			classes = ["page-home"];
		} else if (slugWithoutLocale.length === 2 && CPT_SLUG_MAP[slugWithoutLocale[0]]) {
			// CPT Single
			const internalCpt = CPT_SLUG_MAP[slugWithoutLocale[0]];
			classes = [`single`, `single-${internalCpt}`];
			if (pageId) {
				classes.push(`postid-${pageId}`);
			}
		} else if (slugWithoutLocale.length === 1 && validTaxonomies.includes(slugWithoutLocale[0])) {
			// Taxonomy archive
			classes = [`taxonomy`, `taxonomy-${slugWithoutLocale[0]}`, `page-taxonomy`];
		} else if (isSpecialRoute) {
			// Special routes: /search, /sitemap, etc.
			const routeName = slugWithoutLocale[0];
			classes = ["page", `page-${routeName}`];
		} else {
			// Static pages
			const pageSlug = slugWithoutLocale[slugWithoutLocale.length - 1] || 'home';
			classes = ["page", `page-${pageSlug}`];
			if (pageId) {
				classes.push(`page-id-${pageId}`);
			}
		}

		return classes.join(' ');
	}, [pathname, pageId, taxonomies]);

	useEffect(() => {
		// Get existing classes that we don't manage (like 'modal-controller-ready')
		const existingClasses = Array.from(document.body.classList);
		const managedClasses = ['page', 'page-home', 'page-id-', 'postid-', 'single', 'single-', 'archive', 'archive-', 'taxonomy', 'taxonomy-'];
		
		// Filter out managed classes but keep others (like modal-controller-ready)
		const unmanagedClasses = existingClasses.filter(cls => 
			!managedClasses.some(prefix => cls.startsWith(prefix))
		);
		
		// Combine unmanaged classes with our new body classes
		const finalClasses = [...unmanagedClasses, ...bodyClasses.split(' ')].join(' ');
		document.body.className = finalClasses;
		
		return () => {
			// On cleanup, only remove our managed classes
			const classesToRemove = bodyClasses.split(' ');
			classesToRemove.forEach(cls => document.body.classList.remove(cls));
		};
	}, [bodyClasses]);

	return <>{children}</>;
};

export default BodyClass;
