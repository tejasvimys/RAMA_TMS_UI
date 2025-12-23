import { useEffect, useState } from 'react';
import apiClient from '../ApiClient/apiClient';

function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    try {
      setLoading(true);
      setError('');
      const res = await apiClient.get('/api/admin/users');
      setUsers(res.data);
    } catch (err) {
      console.error(err);
      setError('Failed to load users.');
    } finally {
      setLoading(false);
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

  if (loading) {
    return <div>Loading users...</div>;
  }

  return (
    <div style={{ padding: '1.5rem' }}>
      <h2 style={{ color: '#8b5a2b', marginBottom: '0.5rem' }}>
        Users & Access
      </h2>
      <p style={{ color: '#5d4037', marginBottom: '1rem', fontSize: 14 }}>
        Approve new users and manage their roles. Only active users can sign in
        to the RAMA Donations Console.
      </p>

      {error && (
        <div
          style={{
            marginBottom: '0.75rem',
            color: '#d32f2f',
            fontSize: 14,
          }}
        >
          {error}
        </div>
      )}

      <div
        style={{
          borderRadius: 12,
          overflow: 'hidden',
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          backgroundColor: '#ffffff',
        }}
      >
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: 14,
          }}
        >
          <thead style={{ backgroundColor: '#ffe0b2' }}>
            <tr>
              <th style={th}>Email</th>
              <th style={th}>Name</th>
              <th style={th}>Role</th>
              <th style={th}>Active</th>
              <th style={th}>Created</th>
              <th style={th}></th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr
                key={u.id}
                style={{
                  backgroundColor: u.isActive ? '#fffdf8' : '#fff3e0',
                }}
              >
                <td style={td}>{u.email}</td>
                <td style={td}>{u.displayName}</td>
                <td style={td}>
                  <select
                    value={u.role}
                    onChange={e =>
                      updateField(u.id, 'role', e.target.value)
                    }
                    style={selectStyle}
                  >
                    <option value="Admin">Admin</option>
                    <option value="Collector">Collector</option>
                    <option value="Viewer">Viewer</option>
                  </select>
                </td>
                <td style={td}>
                  <input
                    type="checkbox"
                    checked={u.isActive}
                    onChange={e =>
                      updateField(u.id, 'isActive', e.target.checked)
                    }
                  />
                </td>
                <td style={td}>
                  {u.createdAt
                    ? new Date(u.createdAt).toLocaleString()
                    : ''}
                </td>
                <td style={td}>
                  <button
                    onClick={() => saveUser(u)}
                    disabled={savingId === u.id}
                    style={{
                      padding: '0.35rem 0.75rem',
                      borderRadius: 8,
                      border: 'none',
                      backgroundColor:
                        savingId === u.id ? '#ccc' : '#f57c00',
                      color: '#fff',
                      fontWeight: 600,
                      cursor:
                        savingId === u.id ? 'default' : 'pointer',
                    }}
                  >
                    {savingId === u.id ? 'Saving...' : 'Save'}
                  </button>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td style={td} colSpan={6}>
                  No users registered yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
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

export default AdminUsersPage;
