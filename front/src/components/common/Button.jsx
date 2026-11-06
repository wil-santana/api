import React from 'react';

export default function Button({
  children,
  variant = 'primary',
  onClick,
  type = 'button',
  fullWidth = true,
  className = '',
  disabled = false,
  ariaLabel
}) {
  const getStyles = () => {
    const base = {
      width: fullWidth ? '100%' : 'auto',
      minHeight: 'var(--btn-min-height)',
      borderRadius: 'var(--radius-md)',
      fontSize: 'calc(17px * var(--font-scale))',
      fontWeight: '800',
      letterSpacing: '0.2px',
      cursor: disabled ? 'not-allowed' : 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '10px',
      padding: '12px 20px',
      border: 'none',
      opacity: disabled ? 0.6 : 1,
      textDecoration: 'none'
    };

    if (variant === 'primary') {
      return {
        ...base,
        backgroundColor: 'var(--primary)',
        color: '#FFFFFF',
        boxShadow: '0 4px 10px rgba(15, 82, 186, 0.25)'
      };
    }
    if (variant === 'secondary') {
      return {
        ...base,
        backgroundColor: 'var(--surface-white)',
        color: 'var(--primary)',
        border: '2.5px solid var(--primary)'
      };
    }
    if (variant === 'success') {
      return {
        ...base,
        backgroundColor: 'var(--secondary)',
        color: '#FFFFFF',
        boxShadow: '0 4px 10px rgba(22, 163, 74, 0.25)'
      };
    }
    if (variant === 'neutral') {
      return {
        ...base,
        minHeight: '50px',
        backgroundColor: '#F1F5F9',
        color: '#334155',
        border: '1.5px solid var(--border-strong)',
        fontSize: 'calc(16px * var(--font-scale))',
        fontWeight: '700'
      };
    }
    return base;
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      style={getStyles()}
      className={`btn-accessible ${className}`}
    >
      {children}
    </button>
  );
}
