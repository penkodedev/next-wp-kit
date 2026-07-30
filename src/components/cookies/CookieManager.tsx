'use client'
import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { useCookieAware } from '@/hooks/useCookieConsent'
import localesConfig from '@/i18n/locales.generated.json'

// Analytics tracking is handled in layout.tsx via <Analytics />
// using real IDs loaded from WordPress settings.

// Componente que maneja cookies de funcionalidad
const FunctionalityManager = () => {
  const { shouldLoad } = useCookieAware('preferences', 'functionality')
  const pathname = usePathname()

  // Detectar locale actual del pathname
  const segments = pathname.split('/').filter(Boolean)
  const currentLocale = localesConfig.supportedLocales.includes(segments[0])
    ? segments[0]
    : localesConfig.defaultLocale

  useEffect(() => {
    if (shouldLoad) {
      // Cargar funcionalidades personalizadas solo si está permitido
      
      // Ejemplo: guardar preferencias del usuario (usa locale dinámico)
      const userPreferences = {
        language: currentLocale,
      }
      localStorage.setItem('user_preferences', JSON.stringify(userPreferences))
    }
  }, [shouldLoad, currentLocale])

  return null
}

// Componente principal que gestiona todas las cookies
const CookieManager = () => {
  return <FunctionalityManager />
}

export default CookieManager 