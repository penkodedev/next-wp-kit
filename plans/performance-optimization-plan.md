# Performance Optimization Plan - Next-WP-Kit

## 🔍 Diagnóstico del Problema

### Síntomas Observados
- Tiempos de respuesta de **5-6 segundos** en localhost
- Lentitud al cambiar entre páginas (navegación client-side con RSC)
- Entorno: WordPress en XAMPP local + Next.js en desarrollo

### Cuellos de Botella Identificados

#### 1. **Llamadas API Redundantes en el Layout** (CRÍTICO)
El [`RootLayout`](src/app/layout.tsx:103) hace `getSiteInfo()` en cada request:
```typescript
// src/app/layout.tsx:107
const siteInfo = await getSiteInfo();
```

Y el [`HeaderServer`](src/components/layout/header/HeaderServer.tsx:21) hace **otra llamada** a `getSiteInfo()`:
```typescript
// src/components/layout/header/HeaderServer.tsx:21
const siteInfoForLocale = await getSiteInfo();
```

**Resultado**: 2 llamadas a `/custom/v1/site-info` por cada página.

#### 2. **Fetch de Menús para TODOS los Idiomas** (CRÍTICO)
El [`HeaderServer`](src/components/layout/header/HeaderServer.tsx:60-67) carga menús para **todos los locales** en cada request:
```typescript
// src/components/layout/header/HeaderServer.tsx:60-67
const menuPromises = localesConfig.supportedLocales.map(locale =>
  fetchAPI<MenuItem[]>(`/custom/v1/menus?lang=${locale}&location=mainnav`)
);
```

Si tienes 3 idiomas = 3 llamadas API adicionales por página.

#### 3. **Llamada a Taxonomías en Cada Request** (ALTO)
El [`CatchAllPage`](src/app/[...slug]/page.tsx:252) llama a `getAllTaxonomies()` en cada navegación:
```typescript
// src/app/[...slug]/page.tsx:252
const allTaxonomies = await import('@/api/wordpressApi').then(mod => mod.getAllTaxonomies());
```

#### 4. **Caché Débil en Desarrollo** (MEDIO)
La configuración de [`fetchAPI`](src/api/wordpressApi.ts:127) usa solo 60 segundos de revalidación en desarrollo:
```typescript
// src/api/wordpressApi.ts:127
next: next || { revalidate: process.env.NODE_ENV === 'production' ? 300 : 60 },
```

#### 5. **WordPress en XAMPP es Lento** (MEDIO)
XAMPP no está optimizado para rendimiento. Cada llamada a la REST API puede tomar 200-500ms.

---

## 📊 Análisis de Llamadas por Página

### Navegación Típica (ej: `/quienes-somos/acerca`)

| Llamada | Origen | Tiempo Estimado |
|---------|--------|-----------------|
| `getSiteInfo()` | layout.tsx | ~300ms |
| `getSiteInfo()` | HeaderServer.tsx | ~300ms |
| `menus?lang=es` | HeaderServer.tsx | ~200ms |
| `menus?lang=en` | HeaderServer.tsx | ~200ms |
| `menus?lang=fr` | HeaderServer.tsx | ~200ms |
| `getAllTaxonomies()` | page.tsx | ~300ms |
| `getContentBySlug()` | page.tsx | ~400ms |
| **TOTAL** | | **~1900ms** |

Multiplicado por latencia de XAMPP y overhead de Next.js = **5-6 segundos**.

---

## 🚀 Plan de Optimización

### Fase 1: Caché Agresivo para Datos Estáticos

#### 1.1 Implementar `unstable_cache` para `getSiteInfo`
```typescript
// src/api/wordpressApi.ts
import { unstable_cache } from 'next/cache';

export const getCachedSiteInfo = unstable_cache(
  async (lang?: string) => {
    const endpoint = lang ? `/custom/v1/site-info?lang=${lang}` : '/custom/v1/site-info';
    return await fetchAPI<SiteInfo>(endpoint);
  },
  ['site-info'],
  { revalidate: 3600 } // 1 hora
);
```

#### 1.2 Cachear Menús por Locale
```typescript
export const getCachedMenu = unstable_cache(
  async (locale: string) => {
    return await fetchAPI<MenuItem[]>(`/custom/v1/menus?lang=${locale}&location=mainnav`);
  },
  ['menu'],
  { revalidate: 3600, tags: ['menus'] }
);
```

#### 1.3 Cachear Taxonomías
```typescript
export const getCachedTaxonomies = unstable_cache(
  async () => {
    return await fetchAPI<Record<string, Taxonomy>>('/wp/v2/taxonomies');
  },
  ['taxonomies'],
  { revalidate: 3600 }
);
```

### Fase 2: Eliminar Llamadas Redundantes

#### 2.1 Pasar `siteInfo` como Prop desde Layout
En lugar de que `HeaderServer` haga su propia llamada, recibir `siteInfo` del layout:

```typescript
// src/app/layout.tsx
const siteInfo = await getCachedSiteInfo();
// ...
<HeaderServer siteInfo={siteInfo} />
```

#### 2.2 Cargar Solo el Menú del Locale Actual
En lugar de cargar todos los menús, cargar solo el del idioma actual:

```typescript
// src/components/layout/header/HeaderServer.tsx
const currentMenu = await getCachedMenu(locale);
```

### Fase 3: Optimizar el Catch-All Page

#### 3.1 Usar Parallel Data Fetching
```typescript
// src/app/[...slug]/page.tsx
const [taxonomies, routeType] = await Promise.all([
  getCachedTaxonomies(),
  detectRouteType(params.slug)
]);
```

#### 3.2 Lazy Load de Taxonomías
Solo cargar taxonomías cuando realmente se necesiten:

```typescript
// Solo si el primer segmento podría ser una taxonomía
if (needsTaxonomyCheck) {
  const taxonomies = await getCachedTaxonomies();
}
```

### Fase 4: Configuración de Desarrollo

#### 4.1 Aumentar Revalidación en Dev
```typescript
// src/api/wordpressApi.ts
next: next || { revalidate: process.env.NODE_ENV === 'production' ? 300 : 300 }, // Mismo en dev
```

#### 4.2 Considerar `force-cache` para Datos Estáticos
```typescript
next: { revalidate: false } // Cache indefinido hasta rebuild
```

---

## 📈 Impacto Esperado

| Métrica | Antes | Después |
|---------|-------|---------|
| Llamadas API por página | 7+ | 2-3 |
| Tiempo de respuesta | 5-6s | <1s |
| Datos cacheados | Parcial | Completo |

---

## 🔧 Implementación Recomendada

### Orden de Prioridad

1. **ALTA**: Implementar `unstable_cache` para `getSiteInfo`, menús y taxonomías
2. **ALTA**: Eliminar llamada duplicada a `getSiteInfo` en HeaderServer
3. **MEDIA**: Cargar solo menú del locale actual (no todos)
4. **MEDIA**: Parallel data fetching en catch-all page
5. **BAJA**: Ajustar tiempos de revalidación

### Archivos a Modificar

1. [`src/api/wordpressApi.ts`](src/api/wordpressApi.ts) - Añadir funciones cacheadas
2. [`src/app/layout.tsx`](src/app/layout.tsx) - Usar `getCachedSiteInfo`, pasar a HeaderServer
3. [`src/components/layout/header/HeaderServer.tsx`](src/components/layout/header/HeaderServer.tsx) - Recibir siteInfo como prop, cargar solo menú actual
4. [`src/app/[...slug]/page.tsx`](src/app/[...slug]/page.tsx) - Usar taxonomías cacheadas, parallel fetching

---

## 🧪 Cómo Verificar las Mejoras

1. Abrir DevTools > Network
2. Navegar entre páginas
3. Observar el tiempo de las peticiones `_rsc`
4. El tiempo debería bajar de 5-6s a <1s

También puedes añadir logging temporal:
```typescript
console.time('getSiteInfo');
const siteInfo = await getCachedSiteInfo();
console.timeEnd('getSiteInfo');
```

---

## ⚠️ Consideraciones

- `unstable_cache` es una API experimental de Next.js pero funciona bien
- Los tags permiten invalidar caché selectivamente con `revalidateTag()`
- En producción con Vercel, el caché es aún más efectivo
- XAMPP siempre será más lento que un servidor optimizado
