"use client";

import { usePathname } from 'next/navigation';
import dynamic from 'next/dynamic';

const Header = dynamic(() => import('@/components/layout/Header'), { ssr: true });
const HeaderHome = dynamic(() => import('@/components/layout/HeaderHome'), { ssr: true });

export default function HeaderConditional() {
  const pathname = usePathname();
  const isHome = pathname === '/' || pathname === '';

  return isHome ? <HeaderHome /> : <Header />;
}