// src/components/ui/LoadingSpinner.tsx

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'spinner' | 'dots' | 'pulse' | 'bars';
  text?: string;
  overlay?: boolean;
  className?: string;
}

export default function LoadingSpinner({
  size = 'md',
  variant = 'dots',
  text,
  overlay = false,
  className = ''
}: LoadingSpinnerProps) {
  const containerClass = overlay ? 'global-spinner' : 'inline-spinner';
  
  // Renderizar diferentes variantes
  const renderSpinner = () => {
    switch (variant) {
      case 'dots':
        return (
          <div className={`spinner-dots spinner-${size}`}>
            <span></span>
            <span></span>
            <span></span>
          </div>
        );
      case 'pulse':
        return <div className={`spinner-pulse spinner-${size}`}></div>;
      case 'bars':
        return (
          <div className={`spinner-bars spinner-${size}`}>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
          </div>
        );
      case 'spinner':
      default:
        return <div className={`spinner spinner-${size}`}></div>;
    }
  };

  return (
    <div className={`${containerClass} ${className}`}>
      {renderSpinner()}
      {text && <p className="spinner-text">{text}</p>}
    </div>
  );
}