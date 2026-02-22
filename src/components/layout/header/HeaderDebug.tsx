// src/components/layout/header/HeaderDebug.tsx
// Debug version - simple placeholder to avoid circular dependency

interface SiteInfo {
  title: string;
  description: string;
  light_logo: string;
  dark_logo: string;
}

interface MenuItem {
  id: number;
  title: string;
  url: string;
}

interface HeaderDebugProps {
  variant?: 'default' | 'home';
  menuVariant?: 'desktop' | 'mobile' | 'responsive';
  initialLocale?: string;
  siteInfo: SiteInfo;
  menusByLocale?: Record<string, MenuItem[]>;
}

export default function HeaderDebug({ 
  variant = 'default', 
  siteInfo,
}: HeaderDebugProps) {
  return (
    <header className="header header-debug">
      <div style={{ padding: '10px', textAlign: 'center' }}>
        Header Debug Mode - {siteInfo?.title || 'No title'}
      </div>
    </header>
  );
}
