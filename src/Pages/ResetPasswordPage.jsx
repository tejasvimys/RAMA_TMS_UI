import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import apiClient from '../ApiClient/apiClient';


export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [code, setCode] = useState('');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [qrCodeUri, setQrCodeUri] = useState('');
  const [secret, setSecret] = useState('');
  const [backupCodes, setBackupCodes] = useState([]);

  useEffect(() => {
    if (!token) {
      setError('Reset token is missing. Please use the link from your email.');
    }
  }, [token]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setStatus('');
    if (!token) {
      setError('Reset token is missing.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      const res = await apiClient.post('/api/auth/reset-password', {
        token,
        newPassword: password,
        code: code || undefined,
      });
      setStatus(res.data?.message || 'Password reset successful.');
      setQrCodeUri(res.data?.qrCodeUri || '');
      setSecret(res.data?.secret || '');
      setBackupCodes(res.data?.backupCodes || []);
      setPassword('');
      setConfirm('');
      setCode('');
      if (!res.data?.qrCodeUri) {
        setTimeout(() => navigate('/'), 2000);
      }
    } catch (err) {
      const msg = err?.response?.data || 'Reset failed. The link may be expired (30 minutes) or the 2FA code is invalid.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-beige)' }}>
      <div style={{ width: '100%', maxWidth: 480, background: '#fff', padding: '2rem', borderRadius: 12, boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }}>
        <h2 style={{ marginTop: 0, color: '#8b5a2b' }}>Reset Password</h2>
        <p style={{ color: '#5d4037', fontSize: 14, marginTop: 0 }}>
          Set a new password. If your account already has 2FA enabled, enter a valid 2FA code or backup code. Reset links expire in 30 minutes.
        </p>

        {error && <div style={{ marginBottom: '0.75rem', color: '#c62828', fontSize: 14 }}>{error}</div>}
        {status && <div style={{ marginBottom: '0.75rem', color: '#2e7d32', fontSize: 14 }}>{status}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <label style={labelStyle}>
            New password
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={inputStyle}
              autoComplete="new-password"
            />
          </label>
          <label style={labelStyle}>
            Confirm password
            <input
              type="password"
              required
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              style={inputStyle}
              autoComplete="new-password"
            />
          </label>
          <label style={labelStyle}>
            2FA code (if prompted)
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Authenticator code or backup code"
              style={inputStyle}
              autoComplete="one-time-code"
            />
          </label>
          <button
            type="submit"
            disabled={loading || !token}
            style={{
              padding: '0.75rem 1rem',
              borderRadius: 8,
              border: 'none',
              backgroundColor: loading ? '#ccc' : 'var(--color-saffron)',
              color: '#fff',
              fontWeight: 700,
              cursor: loading ? 'default' : 'pointer',
              boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
            }}
          >
            {loading ? 'Submitting...' : 'Reset Password'}
          </button>
        </form>

        {qrCodeUri ? (
          <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#f7f7f7', borderRadius: 8 }}>
            <h4 style={{ marginTop: 0, color: '#8b5a2b' }}>2FA is required for your account (Super Admin)</h4>
            <p style={{ color: '#5d4037', fontSize: 13 }}>
              Scan this QR code with your authenticator app, then use the 6-digit codes for login. Save the backup codes securely.
            </p>
            <div style={{ textAlign: 'center', padding: '1rem' }}>
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(qrCodeUri)}`}
                alt="2FA QR"
                style={{ maxWidth: 250, marginBottom: '0.75rem' }}
              />
              <p style={{ fontSize: 12, color: '#6d4c41', margin: 0 }}>Manual code:</p>
              <code style={{ display: 'block', marginTop: '0.25rem', padding: '0.5rem', background: '#fff', borderRadius: 6, letterSpacing: 1 }}>{secret}</code>
            </div>
            {backupCodes.length > 0 && (
              <div style={{ marginTop: '1rem' }}>
                <h5 style={{ margin: '0 0 0.5rem 0', color: '#8b5a2b' }}>Backup Codes</h5>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: '0.5rem' }}>
                  {backupCodes.map((c, i) => (
                    <code key={i} style={{ padding: '0.5rem', background: '#fff', borderRadius: 6, textAlign: 'center' }}>{c}</code>
                  ))}
                </div>
                <p style={{ marginTop: '0.5rem', color: '#5d4037', fontSize: 12 }}>
                  Store these safely; each can be used once if you lose access to your authenticator app.
                </p>
              </div>
            )}
            <div style={{ marginTop: '1rem', color: '#5d4037', fontSize: 13 }}>
              <ol style={{ paddingLeft: '1.2rem', marginTop: 0 }}>
                <li>Scan the QR with your authenticator app.</li>
                <li>Use the 6-digit code from the app for login.</li>
                <li>Save the backup codes securely.</li>
              </ol>
            </div>
          </div>
        ) : (
          <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#f7f7f7', borderRadius: 8 }}>
            <h4 style={{ marginTop: 0, color: '#8b5a2b' }}>After resetting:</h4>
            <ol style={{ paddingLeft: '1.2rem', marginTop: '0.5rem', color: '#5d4037', fontSize: 13 }}>
              <li>Log in with your new password.</li>
              <li>Ask an Admin to enable 2FA (if not already enabled).</li>
              <li>Scan the provided QR with an authenticator app and save backup codes.</li>
            </ol>
          </div>
        )}
      </div>
    </div>
  );
}

const labelStyle = { display: 'flex', flexDirection: 'column', gap: '0.35rem', color: '#4e342e', fontSize: 14 };
const inputStyle = { padding: '0.6rem 0.75rem', borderRadius: 8, border: '1px solid #d7ccc8', fontSize: 14 };
