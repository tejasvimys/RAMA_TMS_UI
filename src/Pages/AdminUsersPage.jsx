import { useEffect, useState } from 'react';
import apiClient from '../ApiClient/apiClient';

function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [togglingId, setTogglingId] = useState(null);
  const [error, setError] = useState('');
  const [createForm, setCreateForm] = useState({
    email: '',
    displayName: '',
    role: 'Collector',
    isActive: true,
  });
  const [creating, setCreating] = useState(false);
  
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [selected2FAUser, setSelected2FAUser] = useState(null);
  const [qrCodeUri, setQrCodeUri] = useState('');
  const [secret, setSecret] = useState('');
  const [backupCodes, setBackupCodes] = useState([]);
  const [loading2FA, setLoading2FA] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    try {
      setLoading(true);
      setError('');
      const res = await apiClient.get('/api/admin/users');
      const raw = Array.isArray(res.data) ? res.data : [];

      if (raw.length === 0) {
        setUsers([]);
      } else {
        const usersWithStatus = await Promise.all(
          raw.map(async (user) => {
            try {
              const statusRes = await apiClient.get(`/api/admin/users/${user.id}/2fa/status`);
              return { ...user, twoFactorEnabled: statusRes.data.twoFactorEnabled };
            } catch {
              return { ...user, twoFactorEnabled: false };
            }
          })
        );
        setUsers(usersWithStatus);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load users.');
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateUser(e) {
    e.preventDefault();
    setError('');
    setCreating(true);
    try {
      await apiClient.post('/api/admin/users', createForm);
      setCreateForm({ email: '', displayName: '', role: 'Collector', isActive: true });
      await loadUsers();
      alert('User created. They will receive an email to set password and enroll 2FA.');
    } catch (err) {
      console.error(err);
      setError(err.response?.data || 'Failed to create user.');
    } finally {
      setCreating(false);
    }
  }

  function updateField(id, field, value) {
    setUsers(prev =>
      prev.map(u => (u.id === id ? { ...u, [field]: value } : u))
    );
  }

  async function saveUser(user) {
    try {
      setSavingId(user.id);
      setError('');
      await apiClient.put(`/api/admin/users/${user.id}`, {
        role: user.role,
        isActive: user.isActive,
      });
      await loadUsers();
    } catch (err) {
      console.error(err);
      setError('Failed to save user.');
    } finally {
      setSavingId(null);
    }
  }

  async function deactivateUser(user) {
    const confirmed = window.confirm(
      `Are you sure you want to DEACTIVATE user "${user.displayName}" (${user.email})?\n\nThey will not be able to log in, but their data will remain in the system.`
    );
    
    if (!confirmed) return;

    try {
      setTogglingId(user.id);
      setError('');
      await apiClient.delete(`/api/admin/users/${user.id}`);
      alert(`User "${user.displayName}" has been deactivated successfully.`);
      await loadUsers();
    } catch (err) {
      console.error(err);
      const errorMsg = err.response?.data?.message || err.response?.data || 'Failed to deactivate user.';
      setError(errorMsg);
      alert(`Error: ${errorMsg}`);
    } finally {
      setTogglingId(null);
    }
  }

  async function activateUser(user) {
    const confirmed = window.confirm(
      `Activate user "${user.displayName}" (${user.email})?\n\nThey will be able to log in again.`
    );
    
    if (!confirmed) return;

    try {
      setTogglingId(user.id);
      setError('');
      updateField(user.id, 'isActive', true);
      await apiClient.put(`/api/admin/users/${user.id}`, {
        role: user.role,
        isActive: true,
      });
      alert(`User "${user.displayName}" has been activated successfully.`);
      await loadUsers();
    } catch (err) {
      console.error(err);
      const errorMsg = err.response?.data || 'Failed to activate user.';
      setError(errorMsg);
      alert(`Error: ${errorMsg}`);
    } finally {
      setTogglingId(null);
    }
  }

  async function handleEnable2FA(user) {
    try {
      setLoading2FA(true);
      setError('');
      const res = await apiClient.post(`/api/admin/users/${user.id}/2fa/enable`);
      setSelected2FAUser(user);
      setQrCodeUri(res.data.qrCodeUri);
      setSecret(res.data.secret);
      setBackupCodes(res.data.backupCodes);
      setShow2FAModal(true);
      await loadUsers();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || err.response?.data || 'Failed to enable 2FA');
    } finally {
      setLoading2FA(false);
    }
  }

  async function handleDisable2FA(user) {
    if (!window.confirm(`Are you sure you want to disable 2FA for ${user.displayName}?`)) {
      return;
    }

    try {
      setLoading2FA(true);
      setError('');
      await apiClient.post(`/api/admin/users/${user.id}/2fa/disable`);
      await loadUsers();
      alert('2FA disabled successfully');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || err.response?.data || 'Failed to disable 2FA');
    } finally {
      setLoading2FA(false);
    }
  }

  async function handleReset2FA(user) {
    if (!window.confirm(`Reset 2FA for ${user.displayName}? This will generate new codes.`)) {
      return;
    }

    try {
      setLoading2FA(true);
      setError('');
      const res = await apiClient.post(`/api/admin/users/${user.id}/2fa/reset`);
      setSelected2FAUser(user);
      setQrCodeUri(res.data.qrCodeUri);
      setSecret(res.data.secret);
      setBackupCodes(res.data.backupCodes);
      setShow2FAModal(true);
      await loadUsers();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || err.response?.data || 'Failed to reset 2FA');
    } finally {
      setLoading2FA(false);
    }
  }

  function close2FAModal() {
    setShow2FAModal(false);
    setSelected2FAUser(null);
    setQrCodeUri('');
    setSecret('');
    setBackupCodes([]);
  }

  function downloadBackupCodes() {
    const text = `2FA Backup Codes for ${selected2FAUser.displayName} (${selected2FAUser.email})\n\n${backupCodes.join('\n')}`;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selected2FAUser.email}-backup-codes.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (loading) {
    return <div>Loading users...</div>;
  }

  return (
    <div style={{ padding: '1.5rem' }}>
      <h2 style={{ color: '#8b5a2b', marginBottom: '0.5rem' }}>
        Users & Access
      </h2>
      <p style={{ color: '#5d4037', marginBottom: '1rem', fontSize: 14 }}>
        Approve new users, manage their roles, and configure 2FA. Only active users can sign in to the RAMA Donations Console.
      </p>

      <div style={{ marginBottom: '1.5rem', padding: '1rem', borderRadius: 12, backgroundColor: '#fff', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
        <h3 style={{ marginTop: 0, color: '#8b5a2b' }}>Create User</h3>
        <p style={{ marginTop: 0, color: '#5d4037', fontSize: 13 }}>
          New users will receive an email to set their password and enroll 2FA. Only the approved super admin emails can be set as Admin for super-admins.
        </p>
        <form onSubmit={handleCreateUser} style={{ display: 'grid', gap: '0.75rem', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
          <label style={labelStyle}>
            Email
            <input
              type="email"
              required
              value={createForm.email}
              onChange={(e) => setCreateForm((f) => ({ ...f, email: e.target.value }))}
              style={inputStyle}
            />
          </label>
          <label style={labelStyle}>
            Display name
            <input
              type="text"
              required
              value={createForm.displayName}
              onChange={(e) => setCreateForm((f) => ({ ...f, displayName: e.target.value }))}
              style={inputStyle}
            />
          </label>
          <label style={labelStyle}>
            Role
            <select
              value={createForm.role}
              onChange={(e) => setCreateForm((f) => ({ ...f, role: e.target.value }))}
              style={inputStyle}
            >
              <option value="Admin">Admin</option>
              <option value="Collector">Collector</option>
              <option value="Viewer">Viewer</option>
              <option value="Devotee">Devotee</option>
              <option value="Teacher">Teacher</option>
              <option value="Priest">Priest</option>
            </select>
          </label>
          <label style={{ ...labelStyle, flexDirection: 'row', alignItems: 'center', gap: '0.5rem' }}>
            <input
              type="checkbox"
              checked={createForm.isActive}
              onChange={(e) => setCreateForm((f) => ({ ...f, isActive: e.target.checked }))}
            />
            Active
          </label>
          <div style={{ gridColumn: '1 / -1' }}>
            <button
              type="submit"
              disabled={creating}
              style={{
                padding: '0.6rem 1.2rem',
                borderRadius: 8,
                border: 'none',
                backgroundColor: creating ? '#ccc' : 'var(--color-saffron)',
                color: '#fff',
                fontWeight: 600,
                cursor: creating ? 'default' : 'pointer',
              }}
            >
              {creating ? 'Creating...' : 'Create User'}
            </button>
          </div>
        </form>
      </div>

      {error && (
        <div style={{ marginBottom: '0.75rem', color: '#d32f2f', fontSize: 14 }}>
          {error}
        </div>
      )}

      <div style={{ borderRadius: 12, overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', backgroundColor: '#ffffff' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead style={{ backgroundColor: '#ffe0b2' }}>
            <tr>
              <th style={th}>Email</th>
              <th style={th}>Name</th>
              <th style={th}>Role</th>
              <th style={th}>Active</th>
              <th style={th}>2FA</th>
              <th style={th}>Created</th>
              <th style={th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} style={{ backgroundColor: u.isActive ? '#fffdf8' : '#fff3e0' }}>
                <td style={td}>{u.email}</td>
                <td style={td}>{u.displayName}</td>
                <td style={td}>
                  <select value={u.role} onChange={e => updateField(u.id, 'role', e.target.value)} style={selectStyle}>
                    <option value="Admin">Admin</option>
                    <option value="Collector">Collector</option>
                    <option value="Viewer">Viewer</option>
                    <option value="Devotee">Devotee</option>
                    <option value="Teacher">Teacher</option>
                    <option value="Priest">Priest</option>
                  </select>
                </td>
                <td style={td}>
                  <input type="checkbox" checked={u.isActive} onChange={e => updateField(u.id, 'isActive', e.target.checked)} />
                </td>
                <td style={td}>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: u.twoFactorEnabled ? '#2e7d32' : '#d32f2f' }}>
                      {u.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                    </span>
                    {!u.twoFactorEnabled ? (
                      <button onClick={() => handleEnable2FA(u)} disabled={loading2FA} style={{ ...action2FAButtonStyle, backgroundColor: '#4caf50', borderColor: '#4caf50' }}>
                        Enable
                      </button>
                    ) : (
                      <>
                        <button onClick={() => handleReset2FA(u)} disabled={loading2FA} style={{ ...action2FAButtonStyle, backgroundColor: '#ff9800', borderColor: '#ff9800' }}>
                          Reset
                        </button>
                        <button onClick={() => handleDisable2FA(u)} disabled={loading2FA} style={{ ...action2FAButtonStyle, backgroundColor: '#d32f2f', borderColor: '#d32f2f' }}>
                          Disable
                        </button>
                      </>
                    )}
                  </div>
                </td>
                <td style={td}>{u.createdAt ? new Date(u.createdAt).toLocaleString() : ''}</td>
                <td style={td}>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <button 
                      onClick={() => saveUser(u)} 
                      disabled={savingId === u.id} 
                      style={{ 
                        padding: '0.35rem 0.75rem', 
                        borderRadius: 8, 
                        border: 'none', 
                        backgroundColor: savingId === u.id ? '#ccc' : '#f57c00', 
                        color: '#fff', 
                        fontWeight: 600, 
                        cursor: savingId === u.id ? 'default' : 'pointer',
                        fontSize: 12
                      }}
                    >
                      {savingId === u.id ? 'Saving...' : 'Save'}
                    </button>
                    {u.isActive ? (
                      <button 
                        onClick={() => deactivateUser(u)} 
                        disabled={togglingId === u.id} 
                        style={{ 
                          padding: '0.35rem 0.75rem', 
                          borderRadius: 8, 
                          border: '1px solid #ff9800', 
                          backgroundColor: togglingId === u.id ? '#ccc' : 'transparent', 
                          color: togglingId === u.id ? '#666' : '#ff9800', 
                          fontWeight: 600, 
                          cursor: togglingId === u.id ? 'default' : 'pointer',
                          fontSize: 12
                        }}
                      >
                        {togglingId === u.id ? 'Deactivating...' : 'Deactivate'}
                      </button>
                    ) : (
                      <button 
                        onClick={() => activateUser(u)} 
                        disabled={togglingId === u.id} 
                        style={{ 
                          padding: '0.35rem 0.75rem', 
                          borderRadius: 8, 
                          border: '1px solid #4caf50', 
                          backgroundColor: togglingId === u.id ? '#ccc' : 'transparent', 
                          color: togglingId === u.id ? '#666' : '#4caf50', 
                          fontWeight: 600, 
                          cursor: togglingId === u.id ? 'default' : 'pointer',
                          fontSize: 12
                        }}
                      >
                        
                        {togglingId === u.id ? 'Activating...' : 'Activate'}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td style={td} colSpan={7}>No users registered yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {show2FAModal && selected2FAUser && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={close2FAModal}>
          <div style={{ backgroundColor: '#fff', borderRadius: 12, padding: '2rem', maxWidth: 600, maxHeight: '90vh', overflow: 'auto', boxShadow: '0 8px 24px rgba(0,0,0,0.15)' }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ color: '#8b5a2b', marginBottom: '1rem' }}>2FA Setup for {selected2FAUser.displayName}</h3>
            <p style={{ color: '#5d4037', marginBottom: '1.5rem', fontSize: 14 }}>Share this QR code and backup codes with the user. They should scan the QR code with their authenticator app.</p>
            
            <div style={{ textAlign: 'center', padding: '1.5rem', backgroundColor: '#f5f5f5', borderRadius: 8, marginBottom: '1.5rem' }}>
              <img src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(qrCodeUri)}`} alt="2FA QR Code" style={{ maxWidth: 250, marginBottom: '1rem' }} />
              <p style={{ fontSize: 12, color: '#6d4c41', marginBottom: '0.5rem' }}>Cannot scan? Enter this code manually:</p>
              <code style={{ display: 'block', padding: '0.5rem', backgroundColor: '#fff', borderRadius: 4, fontSize: 14, letterSpacing: 2, wordBreak: 'break-all' }}>{secret}</code>
            </div>

            <h4 style={{ marginBottom: '0.75rem', color: '#8b5a2b' }}>Backup Codes</h4>
            <p style={{ marginBottom: '1rem', color: '#5d4037', fontSize: 14 }}>Save these backup codes in a safe place.</p>
            <div style={{ backgroundColor: '#f5f5f5', padding: '1rem', borderRadius: 8, marginBottom: '1.5rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem', marginBottom: '1rem' }}>
                {backupCodes.map((code, i) => (
                  <code key={i} style={{ padding: '0.5rem', backgroundColor: '#fff', borderRadius: 4, fontSize: 14, letterSpacing: 1, textAlign: 'center' }}>{code}</code>
                ))}
              </div>
              <button onClick={downloadBackupCodes} style={{ width: '100%', padding: '0.6rem 1.5rem', borderRadius: 8, border: '1px solid #e0c9a6', backgroundColor: '#fff', color: '#6d4c41', fontWeight: 600, cursor: 'pointer' }}>Download Backup Codes</button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
              <button onClick={close2FAModal} style={{ padding: '0.6rem 1.5rem', borderRadius: 999, border: 'none', backgroundColor: '#f57c00', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>Done</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const th = {
  padding: '0.5rem 0.75rem',
  textAlign: 'left',
  borderBottom: '1px solid #f0e0c2',
  color: '#5d4037',
};

const td = {
  padding: '0.5rem 0.75rem',
  borderBottom: '1px solid #f3e5c4',
  color: '#4e342e',
};

const selectStyle = {
  padding: '0.2rem 0.4rem',
  borderRadius: 6,
  border: '1px solid #e0c9a6',
  fontSize: 13,
};

const action2FAButtonStyle = {
  padding: '0.25rem 0.5rem',
  borderRadius: 6,
  border: '1px solid',
  color: '#fff',
  fontSize: 11,
  fontWeight: 600,
  cursor: 'pointer',
};

const labelStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.35rem',
  color: '#4e342e',
  fontSize: 14,
};

const inputStyle = {
  padding: '0.5rem',
  borderRadius: 6,
  border: '1px solid #ccc',
  fontSize: 14,
};

export default AdminUsersPage;
