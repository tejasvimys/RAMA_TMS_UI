import { useState } from 'react';
import apiClient from '../ApiClient/apiClient';

function LoginPage({ onLogin }) {
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');

  // 2FA state
  const [requires2FA, setRequires2FA] = useState(false);
  const [tempToken, setTempToken] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState('');

  async function handleEmailSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setStatus('');

    try {
      if (isRegister) {
        const res = await apiClient.post('/api/auth/register', {
          email,
          displayName: displayName || email,
          password,
        });

        setStatus(
          res.data?.message ||
            'Registered successfully. Waiting for admin approval.'
        );
        setIsRegister(false);
        setPassword('');
      } else {
        const res = await apiClient.post('/api/auth/login', {
          email,
          password,
        });

        const data = res.data;

        if (!data.isActive) {
          setStatus(
            `Hi ${data.displayName}, your account is pending admin approval.`
          );
          return;
        }

        // Check if 2FA is required
        if (data.requiresTwoFactor) {
          setRequires2FA(true);
          setTempToken(data.tempToken);
          setStatus('Please enter your 2FA code');
          return;
        }

        // No 2FA - login directly
        if (onLogin) {
          onLogin({
            token: data.appToken,
            email: data.email,
            name: data.displayName,
            role: data.role,
          });
        }
      }
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data ||
        (isRegister ? 'Registration failed.' : 'Login failed.');
      setStatus(msg);
    } finally {
      setLoading(false);
    }
  }

  async function handle2FASubmit(e) {
    e.preventDefault();
    setLoading(true);
    setStatus('');

    try {
      const res = await apiClient.post('/api/auth/verify-2fa', {
        email,
        code: twoFactorCode,
        tempToken,
      });

      const data = res.data;

      if (onLogin) {
        onLogin({
          token: data.appToken,
          email: data.email,
          name: data.displayName,
          role: data.role,
        });
      }
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data ||
        'Invalid 2FA code. Please try again.';
      setStatus(msg);
    } finally {
      setLoading(false);
    }
  }

  function handleBack2FA() {
    setRequires2FA(false);
    setTempToken('');
    setTwoFactorCode('');
    setPassword('');
    setStatus('');
  }

  const canSubmitEmail =
    email.trim().length > 0 && password.trim().length >= 6;

  const canSubmit2FA = twoFactorCode.trim().length === 6 || twoFactorCode.trim().length === 8;

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #fff7e6 0%, #ffe0b2 100%)',
        fontFamily: 'var(--font-body)',
      }}
    >
      <div
        style={{
          width: 900,
          maxWidth: '96vw',
          padding: '2.5rem',
          borderRadius: 18,
          background: '#ffffff',
          boxShadow: '0 12px 40px rgba(0,0,0,0.12)',
          display: 'flex',
          gap: '2.5rem',
        }}
      >
        {/* Left side: logo + intro */}
        <div style={{ flex: 1.1, borderRight: '1px solid #f3e5c4', paddingRight: '2rem' }}>
          <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
            <img
              src="/rama-logo.png"
              alt="RAMA"
              style={{ height: 150, objectFit: 'contain' }}
            />
          </div>
          <h2 style={{ margin: 0, marginBottom: '0.75rem', color: '#8b5a2b' }}>
            Ananthaadi Rayara Matha (RAMA) Temple Management System
          </h2>
          <p style={{ margin: 0, marginBottom: '1.25rem', color: '#5d4037' }}>
            Securely manage Temple activities for Ananthaadi Rayara Matha.
          </p>
          <ul style={{ paddingLeft: '1.2rem', color: '#6d4c41', fontSize: 14 }}>
            <li>Access restricted to authorized collectors and admins.</li>
            <li>Two-factor authentication for enhanced security.</li>
          </ul>
        </div>

        {/* Right side: auth form */}
        <div style={{ flex: 1, paddingLeft: '0.5rem' }}>
          {requires2FA ? (
            // 2FA Verification Form
            <form onSubmit={handle2FASubmit}>
              <h3 style={{ marginBottom: '1rem', color: '#8b5a2b' }}>
                Two-Factor Authentication
              </h3>
              <p style={{ marginBottom: '1.5rem', color: '#5d4037', fontSize: 14 }}>
                Enter the 6-digit code from your authenticator app or use a backup code.
              </p>

              <div style={{ marginBottom: '1rem' }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: 12,
                    color: '#6d4c41',
                    marginBottom: 4,
                  }}
                >
                  Authentication Code
                </label>
                <input
                  type="text"
                  value={twoFactorCode}
                  onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, '').slice(0, 8))}
                  style={{...inputStyle, fontSize: 20, letterSpacing: 4, textAlign: 'center'}}
                  placeholder="000000"
                  maxLength="8"
                  autoFocus
                />
              </div>

              <button
                type="submit"
                disabled={loading || !canSubmit2FA}
                style={{
                  width: '100%',
                  marginTop: '0.5rem',
                  padding: '0.6rem',
                  borderRadius: 999,
                  border: 'none',
                  backgroundColor: canSubmit2FA ? '#f57c00' : '#ccc',
                  color: '#fff',
                  fontWeight: 600,
                  cursor: loading || !canSubmit2FA ? 'default' : 'pointer',
                }}
              >
                {loading ? 'Verifying...' : 'Verify'}
              </button>

              <button
                type="button"
                onClick={handleBack2FA}
                style={{
                  width: '100%',
                  marginTop: '0.75rem',
                  padding: '0.6rem',
                  borderRadius: 999,
                  border: '1px solid #e0c9a6',
                  backgroundColor: 'transparent',
                  color: '#6d4c41',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Back to Login
              </button>
            </form>
          ) : (
            // Email/Password Form
            <form onSubmit={handleEmailSubmit}>
              <h3 style={{ marginBottom: '1rem', color: '#8b5a2b' }}>
                {isRegister ? 'Create Account' : 'Sign In'}
              </h3>

              {isRegister && (
                <div style={{ marginBottom: '0.75rem' }}>
                  <label
                    style={{
                      display: 'block',
                      fontSize: 12,
                      color: '#6d4c41',
                      marginBottom: 4,
                    }}
                  >
                    Name
                  </label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    style={inputStyle}
                    placeholder="Your full name"
                  />
                </div>
              )}

              <div style={{ marginBottom: '0.75rem' }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: 12,
                    color: '#6d4c41',
                    marginBottom: 4,
                  }}
                >
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={inputStyle}
                  placeholder="you@example.com"
                />
              </div>

              <div style={{ marginBottom: '0.75rem' }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: 12,
                    color: '#6d4c41',
                    marginBottom: 4,
                  }}
                >
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={inputStyle}
                  placeholder="At least 6 characters"
                />
              </div>

              <button
                type="submit"
                disabled={loading || !canSubmitEmail}
                style={{
                  width: '100%',
                  marginTop: '0.5rem',
                  padding: '0.6rem',
                  borderRadius: 999,
                  border: 'none',
                  backgroundColor: canSubmitEmail ? '#f57c00' : '#ccc',
                  color: '#fff',
                  fontWeight: 600,
                  cursor: loading || !canSubmitEmail ? 'default' : 'pointer',
                }}
              >
                {loading
                  ? 'Please wait...'
                  : isRegister
                  ? 'Register'
                  : 'Login'}
              </button>

              <div
                style={{
                  marginTop: '0.75rem',
                  fontSize: 13,
                  color: '#6d4c41',
                  textAlign: 'center',
                }}
              >
                {isRegister ? (
                  <>
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setIsRegister(false);
                        setStatus('');
                      }}
                      style={linkButtonStyle}
                    >
                      Login
                    </button>
                  </>
                ) : (
                  <>
                    New here?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setIsRegister(true);
                        setStatus('');
                      }}
                      style={linkButtonStyle}
                    >
                      Register
                    </button>
                  </>
                )}
              </div>
            </form>
          )}

          {/* Status */}
          {status && (
            <p
              style={{
                marginTop: '1rem',
                fontSize: 13,
                color: status.includes('success') || status.includes('enter your 2FA') ? '#2e7d32' : '#d32f2f',
              }}
            >
              {status}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

const inputStyle = {
  width: '100%',
  padding: '0.5rem 0.6rem',
  borderRadius: 8,
  border: '1px solid #e0c9a6',
  fontSize: 14,
};

const linkButtonStyle = {
  border: 'none',
  background: 'none',
  padding: 0,
  margin: 0,
  color: '#f57c00',
  cursor: 'pointer',
  fontWeight: 600,
};

export default LoginPage;