// src/components/layout/Header.tsx

import LogoHeader from "@/components/layout/LogoHeader";
import { getMenuItemsByLocation } from '@/api/wordpressApi';
import WpNavMain from '@/components/wordpress/WpNavMain';
import SearchTrigger from '@/components/ui/SearchTrigger';

export default async function Header() {
  // Obtenemos los items del menú por su UBICACIÓN, no por su slug.
  // 'mainnav' es el identificador que registraste en register-nav-menus.php
  const menuItems = await getMenuItemsByLocation('mainnav');

  return (
    <header className="header">
      <LogoHeader />
      <WpNavMain menuItems={menuItems} />
      <SearchTrigger />
    </header>
  );
}
