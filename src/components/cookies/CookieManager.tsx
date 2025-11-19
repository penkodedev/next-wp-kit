'use client'
import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { useCookieAware, useGoogleAnalytics, useFacebookPixel } from '@/hooks/useCookieConsent'
import localesConfig from '@/i18n/locales.generated.json'

// Componente que maneja Google Analytics
const GoogleAnalyticsManager = () => {
  const { shouldLoad } = useCookieAware('analytics', 'performance')

  // Usar el hook para inicializar Google Analytics
  useGoogleAnalytics('GA_MEASUREMENT_ID') // Reemplazar con tu ID real

  useEffect(() => {
    if (shouldLoad) {
      console.log('✅ Google Analytics habilitado')
    } else {
      console.log('❌ Google Analytics bloqueado por preferencias de cookies')
    }
  }, [shouldLoad])

  return null
}

// Componente que maneja Facebook Pixel
const FacebookPixelManager = () => {
  const { shouldLoad } = useCookieAware('facebook_pixel', 'marketing')

  // Usar el hook para inicializar Facebook Pixel
  useFacebookPixel('FB_PIXEL_ID') // Reemplazar con tu ID real

  useEffect(() => {
    if (shouldLoad) {
      console.log('✅ Facebook Pixel habilitado')
    } else {
      console.log('❌ Facebook Pixel bloqueado por preferencias de cookies')
    }
  }, [shouldLoad])

  return null
}

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
      console.log('✅ Funcionalidades personalizadas habilitadas')
      
      // Ejemplo: guardar preferencias del usuario (usa locale dinámico)
      const userPreferences = {
        theme: 'dark',
        language: currentLocale,
        notifications: true
      }
      localStorage.setItem('user_preferences', JSON.stringify(userPreferences))
    } else {
      console.log('❌ Funcionalidades personalizadas bloqueadas')
    }
  }, [shouldLoad, currentLocale])

  return null
}

// Componente principal que gestiona todas las cookies
const CookieManager = () => {
  return (
    <>
      <GoogleAnalyticsManager />
      <FacebookPixelManager />
      <FunctionalityManager />
    </>
  )
}

export default CookieManager 