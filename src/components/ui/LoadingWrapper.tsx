// src/components/ui/LoadingWrapper.tsx


/**
 * USAGE:
 * import LoadingWrapper from '@/components/ui/LoadingWrapper';
 *
 * <LoadingWrapper isLoading={isLoading}>
 *   <div>Your content here...</div>
 * </LoadingWrapper>
 *
 * Pitional props:
 * - text: string (text beside spinner)
 * - size: 'sm' | 'md' | 'lg' (spinner size)
 * - className: string (More CSS class)
 */

import LoadingSpinner from './LoadingSpiner';

interface LoadingWrapperProps {
  isLoading: boolean;
  children: React.ReactNode;
  text?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function LoadingWrapper({
  isLoading,
  children,
  text = "",
  size = "md",
  className = ""
}: LoadingWrapperProps) {
  return isLoading ? (
    <LoadingSpinner text={text} size={size} className={className} />
  ) : (
    <>{children}</>
  );
}