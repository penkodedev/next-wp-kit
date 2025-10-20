// src/components/layout/HeaderHome.tsx

import LogoHeaderHome from "@/components/layout/LogoHeaderHome";
import { getMenuItemsByLocation } from '@/api/wordpressApi';
import WpNavMain from '@/components/wordpress/WpNavMain';
import SearchTrigger from '@/components/ui/SearchTrigger';
import { motion } from 'framer-motion';

export default async function HeaderHome() {
  // Obtenemos los items del menú por su UBICACIÓN.
  const menuItems = await getMenuItemsByLocation('mainnav');

  return (
    <motion.header
      className="header header-home"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut", delay: 0.02 }}
    >
      <LogoHeaderHome />
      <WpNavMain menuItems={menuItems} />
      <SearchTrigger />
    </motion.header>
  );
}
