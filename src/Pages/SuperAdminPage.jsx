import React, { useState } from 'react';
import apiClient from '../ApiClient/apiClient';

export default function SuperAdminPage() {
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const allowed = [
    'pradeep16@hotmail.com',
    'info@atlantarayaramath.org',
    'tejasvimys@gmail.com',
    // add the fourth when known
  ];

  async function handleCreate(e) {
    e.preventDefault();
    setStatus('');
    setLoading(true);
    try {
      await apiClient.post('/api/auth/super-admins', {
        email,
        displayName,
      });
      setStatus('Invite sent. The super admin must reset password and enable 2FA.');
      setEmail('');
      setDisplayName('');
    } catch (err) {
      setStatus(
        err?.response?.data || 'Unable to create super admin. Ensure email is in the allowed list and you are an Admin.'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 640 }}>
      <h2 style={{ marginBottom: '0.5rem' }}>Super Admin Onboarding</h2>
      <p style={{ marginTop: 0, color: '#5d4037' }}>
        Only Admins can create/update super admins. Allowed emails: {allowed.join(', ')}.
      </p>

      <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <label style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
          Email
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="pradeep16@hotmail.com"
            style={{ padding: '0.5rem', borderRadius: 6, border: '1px solid #ccc' }}
          />
        </label>

        <label style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
          Display name
          <input
            type="text"
            required
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Pradeep"
            style={{ padding: '0.5rem', borderRadius: 6, border: '1px solid #ccc' }}
          />
        </label>

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '0.6rem 1.2rem',
            borderRadius: 6,
            border: 'none',
            backgroundColor: 'var(--color-saffron)',
            color: '#fff',
            fontWeight: 600,
            cursor: loading ? 'default' : 'pointer',
            boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
          }}
        >
          {loading ? 'Sending...' : 'Create / Invite Super Admin'}
        </button>
      </form>

      {status && (
        <div style={{ marginTop: '1rem', padding: '0.75rem', borderRadius: 6, background: '#fff3e0' }}>
          {status}
        </div>
      )}

      <div style={{ marginTop: '1.5rem', padding: '1rem', borderRadius: 6, background: '#f7f7f7' }}>
        <h4 style={{ marginTop: 0 }}>What the super admin must do</h4>
        <ol style={{ paddingLeft: '1.25rem', marginTop: '0.5rem' }}>
          <li>Open the email and click the password reset link (expires in 30 minutes).</li>
          <li>Set a strong password.</li>
          <li>Login, then go to <strong>2FA Settings</strong>.</li>
          <li>Scan the QR code with an authenticator app (e.g., Google Authenticator).</li>
          <li>Enter the 6-digit code to confirm and save the backup codes securely.</li>
        </ol>
        <p style={{ marginTop: '0.5rem', color: '#6d4c41' }}>
          2FA is mandatory for super admins; if they lose their authenticator, an Admin must reset MFA for them.
        </p>
      </div>
    </div>
  );
}
