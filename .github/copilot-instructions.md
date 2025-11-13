# Copilot Instructions for Next-WP-Kit

## Project Overview

**Next-WP-Kit** is an enterprise Next.js 14 (App Router) headless WordPress frontend with TypeScript. It fetches content from WordPress REST API and renders it with type-safe components, SCSS (ITCSS architecture), and Framer Motion animations. The key insight: **WordPress is the CMS backend; Next.js is the presentation layer**.

## Critical Architecture Patterns

### 1. WordPress Content Fetching & Type Safety

**Central API File:** `src/api/wordpressApi.ts`
- All WP API calls go through `fetchAPI<T>()` generic function (standardized error handling, caching)
- Generic `getAllContent<T>()` and `getContentBySlug<T>()` work with any CPT (Custom Post Type)
- **Important:** Use `next: { revalidate: 300 }` for ISR; `revalidate: 0` in dev mode
- Custom endpoints defined in WordPress theme's `/inc/api/api-endpoints.php`

**Example fetching:**
```typescript
const posts = await getAllContent<Post>('posts', '?per_page=12&_embed');
const page = await getContentBySlug<Page>('pages', 'about-us');
```

**Type System:** `src/types/wordpressTypes.ts` defines all WordPress shapes (Post, Page, Modal, MenuItem, etc.). Use `WpContent` base interface for generic CPT operations.

### 2. Catch-All Routing & Route Detection

**File:** `src/app/[...slug]/page.tsx` (handles all dynamic routes)

Route detection logic identifies three types:
- **CPT Archive:** `/noticias` → fetch 12 posts from `noticias` CPT
- **CPT Single:** `/noticias/my-post-slug` → fetch single post with sidebar layout
- **Pages:** `/about` → fetch from `pages` CPT with full-width layout

**Multilingual:** Locale prefix (`/es/`, `/en/`) strips automatically; `getContentBySlug()` accepts `lang` param for WPML translation support.

**Layout Classes:** Use CSS Grid layout classes: `.page-one-col`, `.page-sidebar`, `.page-fullwidth`, `.page-centered` (defined in `src/styles/sass/base/_grid-layout.scss`).

### 3. Content Processing & URL Rewriting

**File:** `src/utils/processContent.ts`

Transforms WordPress HTML:
1. **URL Rewriting:** Replaces backend absolute URLs with relative paths (configured in `next.config.js` rewrites)
2. **Modal Links:** Adds `data-next-ignore="true"` to `/modales/` links so `ModalController` intercepts them instead of Next.js router
3. **Block Group Fixes:** Re-wraps `wp-block-group` elements with background color classes (REST API strips them)
4. **Shortcodes:** Falls back to frontend processing for unhandled shortcodes (ideally handle on WP backend)

**Always call `processContent()` on `post.content.rendered` before `dangerouslySetInnerHTML`.**

### 4. Global State Management

**Library:** Zustand (lightweight, no Redux boilerplate)

**Modal Store:** `src/store/modalStore.ts` — single source of truth for modal open/close state
- Used by `ModalController` to render modals from WPML CPT
- Example: `useModalStore.getState().openModal('contact-form')`

No other stores needed; prefer React Context for smaller scope or fetch data directly in Server Components.

### 5. i18n & WPML Integration

**Files:** `src/i18n/i18n.ts`, `next-intl` configured in `next.config.js`

- Supported locales: `['es', 'en']` (Spanish default)
- **next-intl** provides client-side translations from JSON files (`en.json`, `es.json`)
- **WPML REST API:** WordPress handles content translation; fetch with `lang` query param (e.g., `?lang=en`)
- `middleware.ts` detects locale from URL path and sets `x-locale` header

**Pattern:** If content exists in both languages on WordPress, use same slug; WPML handles versioning transparently.

## Development Workflows

### Local Setup
```bash
npm install
cp .env.example .env.local  # Set NEXT_PUBLIC_WORDPRESS_API_URL to your local WP
npm run dev  # http://localhost:3000
```

### Build & Deploy
```bash
npm run build   # Generate static pages + ISR routes (generateStaticParams in [...slug]/page.tsx)
npm start       # Runs production server
npm run lint    # ESLint + Prettier check
```

**Environment Variables:**
- `NEXT_PUBLIC_WORDPRESS_API_URL` → `https://your-site.com/wp-json`
- `NEXT_PUBLIC_WORDPRESS_URL` → `https://your-site.com` (for og:image, etc.)
- `BASE_URL` → Deployment URL (for meta tags)

### Testing Strategy
Jest configured but minimal tests in repo. Test data flow: mock `fetchAPI()` responses, render components with Zustand store for state.

## Code Organization & Conventions

### Component Structure
- **`src/components/layout/`:** Header, Footer, Sidebar (page-level sections)
- **`src/components/ui/`:** Reusable atoms (PostCard, Icons, SearchForm, etc.)
- **`src/components/wordpress/`:** WP-specific integrations (WpStyles syncs theme.json, WpNavMenu renders menus)
- **`src/components/animations/`:** Framer Motion wrappers (AnimatedFadeIn, StaggeredArticle)

### Styling (ITCSS SASS Architecture)
**File:** `src/styles/sass/main.scss` imports all partials in order:
- `abstracts/` → Variables, mixins, functions (no CSS output)
- `base/` → Resets, typography, _grid-layout.scss
- `components/` → Component-specific styles
- `responsive/` → Media queries (mobile-first)

**Icon System (Two Approaches):**
1. **CSS/SASS:** Use `@include icon-after(check)` mixin for static elements (no JS needed)
2. **React:** Import `Icons` from `@/components/ui/Icons` (1640+ Lucide icons) for interactive elements

### Key Utilities
- **`seo.ts`:** Generates `Metadata` for dynamic meta tags (og:image, description, yoast_head_json)
- **`WpPageIdContext.tsx`:** Provides current `pageId` to BodyClass component for WordPress-like body classes (`page-id-123`, `postid-456`)
- **`cptConfig.ts`:** Maps CPT slugs for routing. **REQUIRED:** Every new CPT must be added here before it appears in the frontend. Example:
  ```typescript
  { slug: 'hero', translations: { es: 'hero', en: 'hero' } }
  ```
- **`FetchFromWP.ts`:** Wrapper component for data fetching in pages (use `fetchAPI` directly instead)

## External Dependencies & Why

- **`next-intl`** → Multilingual support with WPML backend
- **`framer-motion`** → Production animations (60fps, scroll triggers)
- **`zustand`** → Modal state (simpler than Redux)
- **`html-react-parser`** → Safe parsing of WordPress HTML content
- **`isomorphic-dompurify`** → XSS protection for user-generated content
- **`swiper`** → Mobile-touch carousels (SliderRecursos, ImageSlider)
- **`lucide-react`** → Icons (tree-shakeable, consistent design)
- **`rss`** → Generate RSS feeds for blog

## Adding a New CPT (Step-by-Step)

When you create a Custom Post Type in WordPress, follow these steps to make it appear in Next.js:

### 1. Register CPT in WordPress
Create in your WordPress theme's `functions.php` or custom plugin:
```php
register_post_type('hero', ['public' => true, 'show_in_rest' => true]);
```

### 2. Add to `cptConfig.ts`
```typescript
{
  slug: 'hero',  // Internal WordPress slug
  translations: {
    es: 'hero',   // Spanish URL: /hero
    en: 'hero',   // English URL: /en/hero (or /heroe if different)
  },
}
```

### 3. Test Immediately
- Archive: `http://localhost:3000/hero` (lists all hero posts)
- Single: `http://localhost:3000/hero/my-post-slug`
- Multilingual: `http://localhost:3000/en/hero` (if locale prefix enabled)

### 4. (Optional) Create Custom Type in `wordpressTypes.ts`
For type safety (recommended):
```typescript
export interface Hero extends WpContent {
  custom_field?: string;  // Your custom ACF/meta fields
}
```

Then use: `await getContentBySlug<Hero>('hero', 'my-slug')`

## Common Pitfalls & Solutions

| Issue | Solution |
|-------|----------|
| New CPT shows 404 | Add it to `cptConfig.ts` with correct slug and translations |
| Modal links trigger page navigation instead of opening modal | Use `processContent()` to add `data-next-ignore="true"` to `/modales/` links |
| WordPress block styles (background colors) disappear | `processContent()` uses block data to re-wrap `wp-block-group` with classes |
| Static pages don't update when content changes in WordPress | Check `revalidate` value in `fetchAPI` options; production ISR is 300s default |
| WPML translation not fetching correctly | Ensure WordPress WPML plugin is active; pass `lang` param to `getContentBySlug()` |
| Images show optimization warnings in console | `processContent()` adds `sizes` attribute to `<img>` tags |
| TypeScript errors on WordPress response data | Always type responses with generics, e.g., `fetchAPI<Post[]>(...)` |

## File Reference by Purpose

| Purpose | Primary File |
|---------|-------------|
| Fetch WP data | `src/api/wordpressApi.ts` |
| Route detection | `src/app/[...slug]/page.tsx` |
| Global layout | `src/app/layout.tsx` (+ providers: i18n, WpPageId context, Zustand stores) |
| Type definitions | `src/types/wordpressTypes.ts` |
| URL & content fixes | `src/utils/processContent.ts` |
| Styling architecture | `src/styles/sass/main.scss` |
| Modal state | `src/store/modalStore.ts` |
| Icons (React) | `src/components/ui/Icons.tsx` |
| Component templates | `src/components/layout/GridPosts.tsx`, `src/components/ui/PostCard.tsx` |

## Key Insights for Agents

1. **Data flows server-side first:** Fetch in Server Components (`[...slug]/page.tsx`), pass data to Client Components. Minimizes client-side API calls.
2. **WordPress IS the source of truth:** When unsure about data structure, check the custom endpoint in WordPress theme's API file.
3. **Static + ISR hybrid:** `generateStaticParams()` pre-builds ~50-100 most common routes; ISR handles new content automatically.
4. **SCSS over CSS:** Use ITCSS abstracts (variables, mixins) from `src/styles/sass/abstracts/` in all component styles.
5. **TypeScript strict mode:** Every API response must have a type; no `any` for WordPress data.
