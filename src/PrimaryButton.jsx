import React from 'react';

function PrimaryButton({ children, disabled, onClick, style }) {
  const baseStyle = {
    backgroundColor: 'var(--color-saffron)',
    color: 'var(--color-beige)',
    border: 'none',
    borderRadius: 4,
    padding: '0.8rem 1.5rem',
    fontWeight: 'bold',
    fontSize: '1rem',
    cursor: disabled ? 'default' : 'pointer',
    userSelect: 'none',
    transition: 'background-color 0.3s ease',
    ...style,
  };

  const hoverStyle = disabled ? {} : { backgroundColor: 'var(--color-primary-hover)' };

  const [isHover, setIsHover] = React.useState(false);

  return (
    <button
      style={isHover ? { ...baseStyle, ...hoverStyle } : baseStyle}
      disabled={disabled}
      onClick={disabled ? undefined : onClick}
      onMouseEnter={() => setIsHover(true)}
      onMouseLeave={() => setIsHover(false)}
    >
      {children}
    </button>
  );
}

export default PrimaryButton;
