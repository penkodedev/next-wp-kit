// src/components/layout/HeaderHome.tsx

import LogoHeaderHome from "@/components/layout/LogoHeaderHome";
import { getMenuItemsByLocation } from '@/api/wordpressApi';
import WpNavMain from '@/components/wordpress/WpNavMain';
import SearchTrigger from '@/components/ui/SearchTrigger';

export default async function HeaderHome() {
  // Obtenemos los items del menú por su UBICACIÓN.
  const menuItems = await getMenuItemsByLocation('mainnav');

  return (
    <header className="header header-home">
      <LogoHeaderHome />
      <WpNavMain menuItems={menuItems} />
      <SearchTrigger />
    </header>
  );
}
