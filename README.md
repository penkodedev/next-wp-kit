# next-wp-kit

![Next-WP-Kit](https://img.shields.io/badge/Next.js-14.2-black?style=for-the-badge&logo=next.js) ![WordPress](https://img.shields.io/badge/WordPress-Headless-blue?style=for-the-badge&logo=wordpress) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript) ![SASS](https://img.shields.io/badge/Sass-SCSS-hotpink?style=for-the-badge&logo=sass)

An advanced starter kit for building high-performance, scalable, and SEO-friendly websites with **Next.js** (App Router) and **WordPress** as a headless CMS.

This kit is designed to provide a solid foundation, bridging the gap between the powerful content management of WordPress and the modern frontend capabilities of Next.js. It includes a suite of custom components and utilities to make the headless development experience as seamless and elegant as possible.

---

## ✨ Features

This starter kit is packed with features designed for a robust and efficient development workflow.

### Core Technologies

- **Next.js 14:** Leveraging the latest features, including the App Router, Server Components, and advanced caching.
- **TypeScript:** For a type-safe and more maintainable codebase.
- **WordPress REST API:** As the content source, providing a decoupled and flexible architecture.
- **SASS/SCSS:** For structured, maintainable, and powerful styling.
- **Zustand:** For lightweight and boilerplate-free global state management.

### 🚀 WordPress Integration Highlights

This is where the kit truly shines, offering solutions to common headless challenges.

- **Dynamic Style Sync (`WpStyles.tsx`):**
  - Intelligently fetches your WordPress theme's `theme.json` design tokens (colors, typography, etc.) and generates CSS variables and utility classes.
  - Automatically links Gutenberg's core block styles.
  - This ensures that content styled in the WordPress editor looks consistent on the Next.js frontend, providing a true WYSIWYG experience.

- **WordPress-like Body Classes (`BodyClass.tsx`):**
  - A client component that dynamically adds CSS classes to the `<body>` tag based on the current page, mimicking WordPress's `body_class()` function.
  - Generates classes like `page-home`, `single`, `archive`, `single-recurso`, `postid-123`, etc., making page-specific CSS targeting simple and intuitive.

- **Centralized & Typed API Client (`wordpressApi.ts`):**
  - A robust, fully-typed data fetching layer for interacting with the WordPress REST API.
  - Includes generic, reusable functions like `getAllContent<T>()` and `getContentBySlug<T>()` that work with any Custom Post Type (CPT).
  - Comes with pre-built functions for common needs: menus, site info, post navigation, popups, and a powerful custom search.

- **Custom Endpoint Ready:** The API client is built to seamlessly integrate with your own custom WordPress REST API endpoints, giving you full control over the data you expose.

- **URL Processing (`processContent.ts`):** Automatically processes HTML content from WordPress to replace absolute backend URLs with relative frontend paths, ensuring all links work correctly in the headless environment.

### Frontend & UI

- **Swiper.js Integration:** Includes a ready-to-use, server-rendered slider component (`SliderRecursos.tsx`) for showcasing posts or CPTs.
- **Component-Based Architecture:** A clean and organized component structure (`layout`, `ui`, `navigation`, `cookies`).
- **Cookie Consent Management:** Built-in components for handling cookie consent banners and management.
- **UI Helpers:** Includes common utilities like a "Scroll to Top" button, a `ModalController` for managing popups, and an `AdvertisingPopup` component.
- **SEO-Ready:** Uses Next.js's `generateMetadata` to dynamically create page titles, descriptions, and Open Graph tags for better SEO.

### Developer Experience

- **Git Ready:** The project is set up for version control.
- **Linting & Formatting:** Pre-configured with ESLint and Prettier to ensure code quality and consistency.
- **Organized SASS Structure:** A clean, ITCSS-like SASS architecture for scalable styling.

## 🏁 Getting Started

### Prerequisites

- Node.js (v18 or later)
- A running WordPress installation with the REST API accessible.
- It's highly recommended to have custom endpoints set up in your WordPress `functions.php` for menus, site info, etc. for optimal performance.

### 1. Clone the Repository

```bash
git clone https://github.com/penkodedev/next-wp-kit.git
cd next-wp-kit
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env.local` file in the root of your project and add the following variables, pointing them to your WordPress backend:

```env
# The full URL to your WordPress REST API endpoint
NEXT_PUBLIC_WORDPRESS_API_URL="http://your-wp-site.local/wp-json"

# The full URL to your WordPress site (without /wp-json)
NEXT_PUBLIC_WORDPRESS_URL="http://your-wp-site.local"

# The slug of your active WordPress theme (used to fetch styles)
WP_THEME_SLUG="penkode-headless"

# The base URL of your Next.js frontend (for SEO metadata)
BASE_URL="http://localhost:3000"
```

> **Note:** For the `WpStyles` component to work correctly, your WordPress theme must have a `style.css` file.

### 4. Run the Development Server

```bash
npm run dev
```

Open http://localhost:3000 in your browser to see the result.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the issues page.
