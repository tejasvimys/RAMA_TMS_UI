import React from 'react';

function Header({ auth, onLogout }) {
  return (
    <header
      style={{
        backgroundColor: 'var(--color-saffron)',
        color: 'var(--color-dark-brown)',
        padding: '1rem 2rem',
        fontFamily: 'var(--font-heading)',
        fontWeight: 'bold',
        fontSize: '1.5rem',
        boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
        userSelect: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <span>Ananthaadi Rayara Matha (RAMA) Management System</span>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {auth?.name && (
          <span
            style={{
              fontSize: '0.875rem',
              fontWeight: 500,
              color: 'var(--color-dark-brown)',
            }}
          >
            {auth.name} <span style={{ opacity: 0.7 }}>({auth.role})</span>
          </span>
        )}

        <button
          onClick={onLogout}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: 8,
            border: 'none',
            backgroundColor: '#fff',
            color: 'var(--color-saffron)',
            fontWeight: 600,
            cursor: 'pointer',
            fontSize: '0.875rem',
            boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
            transition: 'transform 0.1s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        >
          Logout
        </button>
      </div>
    </header>
  );
}

export default Header;
