"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useWpPageId } from "@/utils/wordpress/WpPageIdContext";
import { CPT_SLUG_MAP } from "@/utils/config/cptConfig";
import localesConfig from "@/i18n/locales.generated.json";
import { fetchAPI } from "@/api/wordpressApi";

interface BodyClassProps {
	children: React.ReactNode;
}

const SPECIAL_ROUTES = new Set(["search", "sitemap", "blog", "feed.xml"]);

function stripLocale(pathSegments: string[]): string[] {
	if (pathSegments.length > 0 && localesConfig.supportedLocales.includes(pathSegments[0])) {
		return pathSegments.slice(1);
	}
	return pathSegments;
}

function resolveBodyClasses(
	segments: string[],
	pageId: number | null,
	taxonomies: string[],
): string[] {
	if (segments.length === 0) {
		return ["page-home"];
	}

	const [first, second] = segments;
	const cptSlug = CPT_SLUG_MAP[first];

	if (segments.length === 1 && cptSlug) {
		return ["archive", `archive-${cptSlug}`];
	}

	if (segments.length === 2 && cptSlug) {
		const classes = ["single", `single-${cptSlug}`];
		if (pageId) classes.push(`postid-${pageId}`);
		return classes;
	}

	if (segments.length === 1 && taxonomies.includes(first)) {
		return ["taxonomy", `taxonomy-${first}`, "page-taxonomy"];
	}

	if (SPECIAL_ROUTES.has(first)) {
		return ["page", `page-${first}`];
	}

	const pageSlug = segments[segments.length - 1] || "home";
	const classes = ["page", `page-${pageSlug}`];
	if (pageId) classes.push(`page-id-${pageId}`);
	return classes;
}

let taxonomySlugsCache: string[] | null = null;
let taxonomySlugsPromise: Promise<string[]> | null = null;

function loadTaxonomySlugs(): Promise<string[]> {
	if (taxonomySlugsCache) {
		return Promise.resolve(taxonomySlugsCache);
	}

	if (!taxonomySlugsPromise) {
		taxonomySlugsPromise = fetchAPI<Record<string, unknown>>("/wp/v2/taxonomies")
			.then((data) => {
				taxonomySlugsCache = data ? Object.keys(data) : [];
				return taxonomySlugsCache;
			})
			.catch(() => {
				taxonomySlugsCache = [];
				return [];
			});
	}

	return taxonomySlugsPromise;
}

const BodyClass = ({ children }: BodyClassProps) => {
	const pathname = usePathname();
	const { pageId } = useWpPageId();
	const [taxonomies, setTaxonomies] = useState<string[]>(taxonomySlugsCache ?? []);
	const appliedClassesRef = useRef<string[]>([]);

	useEffect(() => {
		let cancelled = false;

		loadTaxonomySlugs().then((slugs) => {
			if (!cancelled) {
				setTaxonomies(slugs);
			}
		});

		return () => {
			cancelled = true;
		};
	}, []);

	const bodyClasses = useMemo(() => {
		const segments = stripLocale((pathname || "").split("/").filter(Boolean));
		return resolveBodyClasses(segments, pageId, taxonomies);
	}, [pathname, pageId, taxonomies]);

	useEffect(() => {
		const previousClasses = appliedClassesRef.current;

		previousClasses.forEach((cls) => document.body.classList.remove(cls));
		bodyClasses.forEach((cls) => document.body.classList.add(cls));
		appliedClassesRef.current = bodyClasses;

		return () => {
			appliedClassesRef.current.forEach((cls) => document.body.classList.remove(cls));
			appliedClassesRef.current = [];
		};
	}, [bodyClasses]);

	return <>{children}</>;
};

export default BodyClass;
