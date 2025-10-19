"use client";

import { usePathname } from 'next/navigation';
import Header from './Header';
import HeaderHome from './HeaderHome';

export default function HeaderConditional() {
  const pathname = usePathname();
  const isHome = pathname === '/';

  return isHome ? <HeaderHome /> : <Header />;
}