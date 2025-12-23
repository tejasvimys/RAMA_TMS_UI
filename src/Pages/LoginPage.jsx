import { useEffect, useRef, useState } from 'react';
import apiClient from '../ApiClient/apiClient';

function LoginPage({ onLogin }) {
  const googleButtonRef = useRef(null);

  const [mode, setMode] = useState('google'); // 'google' | 'email'
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');

  // Google button setup
  useEffect(() => {
    /* global google */
    if (!window.google || !googleButtonRef.current) return;

    const clientId = 'YOUR_WEB_CLIENT_ID.apps.googleusercontent.com';

    google.accounts.id.initialize({
      client_id: clientId,
      callback: handleGoogleCredentialResponse,
    });

    google.accounts.id.renderButton(googleButtonRef.current, {
      theme: 'outline',
      size: 'large',
      type: 'standard',
      text: 'signin_with',
      shape: 'pill',
    });
  }, []);

  async function handleGoogleCredentialResponse(response) {
    const idToken = response.credential;

    try {
      setLoading(true);
      setStatus('');
      const res = await apiClient.post('/api/auth/exchange', {
        provider: 'google',
        idToken,
      });

      const data = res.data;

      if (!data.isActive || !data.appToken) {
        setStatus(
          `Hi ${data.displayName}, your account is pending admin approval.`
        );
        return;
      }

      if (onLogin) {
        onLogin({
          token: data.appToken,
          email: data.email,
          name: data.displayName,
          role: data.role,
        });
      }
    } catch (err) {
      console.error(err);
      setStatus('Google login failed or not authorized.');
    } finally {
      setLoading(false);
    }
  }

  async function handleEmailSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setStatus('');

    try {
      if (isRegister) {
        // Registration
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
        // Login
        const res = await apiClient.post('/api/auth/login', {
          email,
          password,
        });

        const data = res.data;

        if (!data.isActive || !data.appToken) {
          setStatus(
            `Hi ${data.displayName}, your account is pending admin approval.`
          );
          return;
        }

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
      console.error(err);
      const msg =
        err.response?.data?.message ||
        err.response?.data ||
        (isRegister ? 'Registration failed.' : 'Login failed.');
      setStatus(msg);
    } finally {
      setLoading(false);
    }
  }

  const canSubmitEmail =
    email.trim().length > 0 && password.trim().length >= 6;

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
              src="/rama-logo.png" // ensure this exists in public/
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
          </ul>
        </div>

        {/* Right side: auth tabs */}
        <div style={{ flex: 1, paddingLeft: '0.5rem' }}>
          {/* Tabs */}
          <div
            style={{
              display: 'flex',
              marginBottom: '1.5rem',
              borderRadius: 999,
              backgroundColor: '#fff7e6',
              padding: 4,
            }}
          >
            <button
              type="button"
              onClick={() => {
                setMode('google');
                setIsRegister(false);
                setStatus('');
              }}
              style={{
                flex: 1,
                padding: '0.4rem 0.6rem',
                border: 'none',
                borderRadius: 999,
                backgroundColor:
                  mode === 'google' ? '#ffa726' : 'transparent',
                color: mode === 'google' ? '#fff' : '#6d4c41',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Google Sign-In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('email');
                setStatus('');
              }}
              style={{
                flex: 1,
                padding: '0.4rem 0.6rem',
                border: 'none',
                borderRadius: 999,
                backgroundColor:
                  mode === 'email' ? '#ffa726' : 'transparent',
                color: mode === 'email' ? '#fff' : '#6d4c41',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Email / Password
            </button>
          </div>

          {/* Content */}
          {mode === 'google' ? (
            <div style={{ textAlign: 'center', marginTop: '1rem' }}>
              <p style={{ marginBottom: '1.25rem', color: '#5d4037', fontSize: 14 }}>
                Sign in with your Google account.
              </p>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <div ref={googleButtonRef} />
              </div>
            </div>
          ) : (
            <form onSubmit={handleEmailSubmit}>
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
                color: '#d32f2f',
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
