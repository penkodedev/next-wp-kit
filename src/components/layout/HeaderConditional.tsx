import { headers } from 'next/headers';
import dynamic from 'next/dynamic';

const Header = dynamic(() => import('@/components/layout/Header'), { ssr: true });
const HeaderHome = dynamic(() => import('@/components/layout/HeaderHome'), { ssr: true });

export default function HeaderConditional() {
  const headersList = headers();
  const pathname = headersList.get('x-pathname') || headersList.get('referer')?.split('/')[3] || '/';
  const isHome = pathname === '/' || pathname === '';

  return isHome ? <HeaderHome /> : <Header />;
}