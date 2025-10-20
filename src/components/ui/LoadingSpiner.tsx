// src/components/ui/LoadingSpinner.tsx

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'spinner' | 'dots' | 'pulse';
  text?: string;
  overlay?: boolean;
  className?: string;
}

export default function LoadingSpinner({
  size = 'md',
  variant = 'spinner',
  text,
  overlay = false,
  className = ''
}: LoadingSpinnerProps) {
  const containerClass = overlay ? 'global-spinner' : 'inline-spinner';
  const spinnerClass = `spinner spinner-${size} spinner-${variant}`;

  return (
    <div className={`${containerClass} ${className}`}>
      <div className={spinnerClass}></div>
      {text && <p className="spinner-text">{text}</p>}
    </div>
  );
}