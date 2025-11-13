import Header from '@/components/layout/header/Header';

interface HeaderConditionalProps {
  currentLocale?: string;
}

export default function HeaderConditional({ currentLocale = 'es' }: HeaderConditionalProps) {
  // For now, just use default header - we'll fix the conditional logic later
  return <Header variant="default" currentLocale={currentLocale} />;
}
