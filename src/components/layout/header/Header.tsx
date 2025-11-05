// src/components/layout/Header.tsx

import LogoHeader from "@/components/layout/header/LogoHeader";
import LogoHeaderHome from "@/components/layout/header/LogoHeaderHome";
import LangSwitcher from "@/components/layout/header/LangSwitcher";
import { getMenuItemsByLocation } from '@/api/wordpressApi';
import WpNavMain from '@/components/wordpress/WpNavMain';
import SearchTrigger from '@/components/ui/SearchTrigger';


interface HeaderProps {
  variant?: 'default' | 'home';
}

export default async function Header({ variant = 'default' }: HeaderProps) {
  // Obtenemos los items del menú por su UBICACIÓN (ahora cacheado).
  const menuItems = await getMenuItemsByLocation('mainnav') || [];

  return (
    <header className={`header ${variant === 'home' ? 'header-home' : ''}`}>
      {variant === 'home' ? <LogoHeaderHome /> : <LogoHeader />}
      <WpNavMain menuItems={menuItems} />
      <LangSwitcher />
      <SearchTrigger />
    </header>
  );
}
