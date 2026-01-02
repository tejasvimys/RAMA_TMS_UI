import { useEffect, useState } from 'react';
import apiClient from '../ApiClient/apiClient';
import PrimaryButton from '../PrimaryButton';

function TwoFactorSettings() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [backupCodesCount, setBackupCodesCount] = useState(0);

  // Enable 2FA state
  const [showEnableForm, setShowEnableForm] = useState(false);
  const [password, setPassword] = useState('');
  const [qrCodeUri, setQrCodeUri] = useState('');
  const [secret, setSecret] = useState('');
  const [backupCodes, setBackupCodes] = useState([]);
  const [verificationCode, setVerificationCode] = useState('');
  const [step, setStep] = useState(1); // 1: enter password, 2: scan QR, 3: verify

  // Disable 2FA state
  const [showDisableForm, setShowDisableForm] = useState(false);
  const [disablePassword, setDisablePassword] = useState('');
  const [disableCode, setDisableCode] = useState('');

  useEffect(() => {
    loadStatus();
  }, []);

  async function loadStatus() {
    try {
      const res = await apiClient.get('/api/auth/2fa/status');
      setTwoFactorEnabled(res.data.enabled);
      setBackupCodesCount(res.data.backupCodesCount);
    } catch (err) {
      console.error('Failed to load 2FA status:', err);
    }
  }

  async function handleEnableStep1(e) {
    e.preventDefault();
    setLoading(true);
    setStatus('');

    try {
      const res = await apiClient.post('/api/auth/2fa/enable', {
        password,
      });

      setSecret(res.data.secret);
      setQrCodeUri(res.data.qrCodeUri);
      setBackupCodes(res.data.backupCodes);
      setStep(2);
    } catch (err) {
      console.error(err);
      setStatus(err.response?.data?.message || err.response?.data || 'Failed to enable 2FA');
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifySetup(e) {
    e.preventDefault();
    setLoading(true);
    setStatus('');

    try {
      await apiClient.post('/api/auth/2fa/verify-setup', {
        code: verificationCode,
      });

      setStatus('2FA enabled successfully!');
      setStep(3);
      await loadStatus();
    } catch (err) {
      console.error(err);
      setStatus(err.response?.data?.message || err.response?.data || 'Invalid code');
    } finally {
      setLoading(false);
    }
  }

  async function handleDisable2FA(e) {
    e.preventDefault();
    setLoading(true);
    setStatus('');

    try {
      await apiClient.post('/api/auth/2fa/disable', {
        password: disablePassword,
        code: disableCode,
      });

      setStatus('2FA disabled successfully');
      setShowDisableForm(false);
      setDisablePassword('');
      setDisableCode('');
      await loadStatus();
    } catch (err) {
      console.error(err);
      setStatus(err.response?.data?.message || err.response?.data || 'Failed to disable 2FA');
    } finally {
      setLoading(false);
    }
  }

  function resetEnableForm() {
    setShowEnableForm(false);
    setPassword('');
    setQrCodeUri('');
    setSecret('');
    setBackupCodes([]);
    setVerificationCode('');
    setStep(1);
    setStatus('');
  }

  function downloadBackupCodes() {
    const text = backupCodes.join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'rama-tms-backup-codes.txt';
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div style={{ padding: '2rem', maxWidth: 800, margin: '0 auto' }}>
      <h2 style={{ color: '#8b5a2b', marginBottom: '1rem' }}>
        Two-Factor Authentication
      </h2>
      <p style={{ color: '#5d4037', marginBottom: '2rem' }}>
        Add an extra layer of security to your account by enabling two-factor authentication.
      </p>

      {/* Current Status */}
      <div
        style={{
          padding: '1.5rem',
          backgroundColor: twoFactorEnabled ? '#e8f5e9' : '#fff3e0',
          borderRadius: 12,
          marginBottom: '2rem',
          border: `1px solid ${twoFactorEnabled ? '#81c784' : '#ffb74d'}`,
        }}
      >
        <h3 style={{ margin: 0, marginBottom: '0.5rem', color: '#6d4c41' }}>
          Status: {twoFactorEnabled ? 'Enabled ✓' : 'Disabled'}
        </h3>
        {twoFactorEnabled && (
          <p style={{ margin: 0, fontSize: 14, color: '#6d4c41' }}>
            You have {backupCodesCount} backup codes remaining
          </p>
        )}
      </div>

      {/* Enable/Disable Forms */}
      {!twoFactorEnabled && !showEnableForm && (
        <PrimaryButton
          onClick={() => setShowEnableForm(true)}
          style={{ marginBottom: '1rem' }}
        >
          Enable Two-Factor Authentication
        </PrimaryButton>
      )}

      {twoFactorEnabled && !showDisableForm && (
        <button
          onClick={() => setShowDisableForm(true)}
          style={{
            padding: '0.6rem 1.5rem',
            borderRadius: 999,
            border: '1px solid #d32f2f',
            backgroundColor: 'transparent',
            color: '#d32f2f',
            fontWeight: 600,
            cursor: 'pointer',
            marginBottom: '1rem',
          }}
        >
          Disable Two-Factor Authentication
        </button>
      )}

      {/* Enable 2FA Flow */}
      {showEnableForm && (
        <div
          style={{
            padding: '2rem',
            backgroundColor: '#fff',
            borderRadius: 12,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          }}
        >
          {step === 1 && (
            <form onSubmit={handleEnableStep1}>
              <h3 style={{ marginBottom: '1rem', color: '#8b5a2b' }}>
                Step 1: Verify Your Password
              </h3>
              <div style={{ marginBottom: '1rem' }}>
                <label style={labelStyle}>Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={inputStyle}
                  placeholder="Enter your password"
                  required
                />
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <PrimaryButton type="submit" disabled={loading}>
                  {loading ? 'Please wait...' : 'Continue'}
                </PrimaryButton>
                <button
                  type="button"
                  onClick={resetEnableForm}
                  style={secondaryButtonStyle}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {step === 2 && (
            <div>
              <h3 style={{ marginBottom: '1rem', color: '#8b5a2b' }}>
                Step 2: Scan QR Code
              </h3>
              <p style={{ marginBottom: '1rem', color: '#5d4037', fontSize: 14 }}>
                Scan this QR code with your authenticator app (Google Authenticator, Microsoft Authenticator, Authy, etc.)
              </p>

              <div
                style={{
                  textAlign: 'center',
                  padding: '1.5rem',
                  backgroundColor: '#f5f5f5',
                  borderRadius: 8,
                  marginBottom: '1.5rem',
                }}
              >
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(qrCodeUri)}`}
                  alt="2FA QR Code"
                  style={{ maxWidth: 250 }}
                />
                <p style={{ marginTop: '1rem', fontSize: 12, color: '#6d4c41' }}>
                  Can't scan? Enter this code manually:
                </p>
                <code
                  style={{
                    display: 'block',
                    padding: '0.5rem',
                    backgroundColor: '#fff',
                    borderRadius: 4,
                    marginTop: '0.5rem',
                    fontSize: 14,
                    letterSpacing: 2,
                  }}
                >
                  {secret}
                </code>
              </div>

              <h4 style={{ marginBottom: '0.75rem', color: '#8b5a2b' }}>
                Backup Codes
              </h4>
              <p style={{ marginBottom: '1rem', color: '#5d4037', fontSize: 14 }}>
                Save these backup codes in a safe place. You can use them to access your account if you lose your device.
              </p>
              <div
                style={{
                  backgroundColor: '#f5f5f5',
                  padding: '1rem',
                  borderRadius: 8,
                  marginBottom: '1rem',
                }}
              >
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '0.5rem',
                    marginBottom: '1rem',
                  }}
                >
                  {backupCodes.map((code, i) => (
                    <code
                      key={i}
                      style={{
                        padding: '0.5rem',
                        backgroundColor: '#fff',
                        borderRadius: 4,
                        fontSize: 14,
                        letterSpacing: 1,
                      }}
                    >
                      {code}
                    </code>
                  ))}
                </div>
                <button
                  onClick={downloadBackupCodes}
                  style={{
                    ...secondaryButtonStyle,
                    width: '100%',
                  }}
                >
                  Download Backup Codes
                </button>
              </div>

              <form onSubmit={handleVerifySetup}>
                <h4 style={{ marginBottom: '0.75rem', color: '#8b5a2b' }}>
                  Verify Setup
                </h4>
                <p style={{ marginBottom: '1rem', color: '#5d4037', fontSize: 14 }}>
                  Enter the 6-digit code from your authenticator app to complete setup
                </p>
                <div style={{ marginBottom: '1rem' }}>
                  <input
                    type="text"
                    value={verificationCode}
                    onChange={(e) =>
                      setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))
                    }
                    style={{
                      ...inputStyle,
                      fontSize: 20,
                      letterSpacing: 4,
                      textAlign: 'center',
                    }}
                    placeholder="000000"
                    maxLength="6"
                    required
                  />
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <PrimaryButton type="submit" disabled={loading}>
                    {loading ? 'Verifying...' : 'Verify and Enable'}
                  </PrimaryButton>
                  <button
                    type="button"
                    onClick={resetEnableForm}
                    style={secondaryButtonStyle}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {step === 3 && (
            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  fontSize: 48,
                  marginBottom: '1rem',
                }}
              >
                ✓
              </div>
              <h3 style={{ color: '#2e7d32', marginBottom: '1rem' }}>
                2FA Enabled Successfully!
              </h3>
              <p style={{ color: '#5d4037', marginBottom: '1.5rem' }}>
                Your account is now protected with two-factor authentication.
              </p>
              <PrimaryButton onClick={resetEnableForm}>Done</PrimaryButton>
            </div>
          )}
        </div>
      )}

      {/* Disable 2FA Form */}
      {showDisableForm && (
        <div
          style={{
            padding: '2rem',
            backgroundColor: '#fff',
            borderRadius: 12,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          }}
        >
          <form onSubmit={handleDisable2FA}>
            <h3 style={{ marginBottom: '1rem', color: '#d32f2f' }}>
              Disable Two-Factor Authentication
            </h3>
            <p style={{ marginBottom: '1.5rem', color: '#5d4037', fontSize: 14 }}>
              This will remove the extra security layer from your account. Please confirm by entering your password and current 2FA code.
            </p>
            <div style={{ marginBottom: '1rem' }}>
              <label style={labelStyle}>Password</label>
              <input
                type="password"
                value={disablePassword}
                onChange={(e) => setDisablePassword(e.target.value)}
                style={inputStyle}
                placeholder="Enter your password"
                required
              />
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={labelStyle}>2FA Code</label>
              <input
                type="text"
                value={disableCode}
                onChange={(e) =>
                  setDisableCode(e.target.value.replace(/\D/g, '').slice(0, 8))
                }
                style={{
                  ...inputStyle,
                  fontSize: 20,
                  letterSpacing: 4,
                  textAlign: 'center',
                }}
                placeholder="000000"
                maxLength="8"
                required
              />
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                type="submit"
                disabled={loading}
                style={{
                  ...secondaryButtonStyle,
                  backgroundColor: '#d32f2f',
                  color: '#fff',
                  borderColor: '#d32f2f',
                }}
              >
                {loading ? 'Please wait...' : 'Disable 2FA'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowDisableForm(false);
                  setDisablePassword('');
                  setDisableCode('');
                  setStatus('');
                }}
                style={secondaryButtonStyle}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Status Message */}
      {status && (
        <p
          style={{
            marginTop: '1.5rem',
            padding: '1rem',
            backgroundColor: status.includes('success') ? '#e8f5e9' : '#ffebee',
            color: status.includes('success') ? '#2e7d32' : '#d32f2f',
            borderRadius: 8,
            fontSize: 14,
          }}
        >
          {status}
        </p>
      )}
    </div>
  );
}

const inputStyle = {
  width: '100%',
  padding: '0.6rem',
  borderRadius: 8,
  border: '1px solid #e0c9a6',
  fontSize: 14,
};

const labelStyle = {
  display: 'block',
  fontSize: 12,
  color: '#6d4c41',
  marginBottom: 4,
  fontWeight: 600,
};

const secondaryButtonStyle = {
  padding: '0.6rem 1.5rem',
  borderRadius: 999,
  border: '1px solid #e0c9a6',
  backgroundColor: 'transparent',
  color: '#6d4c41',
  fontWeight: 600,
  cursor: 'pointer',
};

export default TwoFactorSettings;