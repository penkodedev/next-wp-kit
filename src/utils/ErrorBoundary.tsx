// components/utils/ErrorBoundary.tsx
'use client';

import { Component, ComponentType, ReactNode } from 'react';
import { useTranslations } from 'next-intl';

// Configuración: lista de componentes críticos
const CRITICAL_COMPONENTS_CONFIG = [
//   'LoadMore',
//   'ContentArchive',
  'WpNavMenu',
//   'PostCard',
] as const;

// Error Boundary base
class ErrorBoundaryBase extends Component<
  { children: ReactNode; fallback: ReactNode },
  { hasError: boolean }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    // Error caught by boundary - could log to external service here
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

// Fallback genérico con i18n
function ErrorFallback({ componentName }: { componentName: string }) {
  const t = useTranslations('Errors');
  
  return (
    <div className="error-boundary">
      <p>{t('componentFailed', { component: componentName })}</p>
      <button onClick={() => window.location.reload()}>
        {t('retry')}
      </button>
    </div>
  );
}

// Factory: genera versión "safe" de cualquier componente
export function withErrorBoundary<P extends object>(
  Component: ComponentType<P>,
  componentName: string
) {
  return function SafeComponent(props: P) {
    return (
      <ErrorBoundaryBase fallback={<ErrorFallback componentName={componentName} />}>
        <Component {...props} />
      </ErrorBoundaryBase>
    );
  };
}