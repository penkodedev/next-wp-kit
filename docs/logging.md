# Sistema de Logging

Este proyecto utiliza un sistema de logging profesional que **solo muestra mensajes en desarrollo**.

## Uso

```typescript
import { logger } from '@/utils/logger';

// Errores críticos
logger.error('Error al cargar el menú:', error);

// Advertencias
logger.warn('El usuario no tiene permisos');

// Información general (debugging)
logger.info('Cargando datos del usuario...');

// Mensajes de éxito
logger.success('Datos guardados correctamente');
```

## Comportamiento

### En Desarrollo (`NODE_ENV=development`)
- ✅ Todos los logs se muestran en la consola
- ✅ Incluyen emojis para fácil identificación (🔴 🟡 🔵 🟢)
- ✅ Útil para debugging

### En Producción (`NODE_ENV=production`)
- ❌ Los logs NO se muestran en la consola
- ✅ Protege información sensible
- ✅ Mejora el rendimiento
- ℹ️ Se puede integrar con servicios de monitoreo (Sentry, LogRocket, etc.)

## Integración con Servicios de Monitoreo (Futuro)

Para enviar errores a servicios como Sentry:

```typescript
// En logger.ts
error: (...args: any[]) => {
  if (isDevelopment) {
    console.error('🔴 [ERROR]', ...args);
  } else {
    // En producción, enviar a Sentry
    Sentry.captureException(args[0]);
  }
}
```

## Migración Completada

Todos los `console.error`, `console.warn`, `console.log` del proyecto han sido reemplazados por el logger:

- ✅ `src/api/wordpressApi.ts`
- ✅ `src/components/wordpress/WpNavMenu.tsx`
- ✅ `src/components/wordpress/WpStyles.tsx`
- ✅ `src/components/ui/Modals.tsx`
- ✅ `src/components/forms/ContactForm7.tsx`
- ✅ `src/hooks/useCookieConsent.ts`
- ✅ `src/app/search/page.tsx`
- ✅ `src/app/blog/page.tsx`
