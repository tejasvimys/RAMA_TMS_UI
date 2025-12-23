import React from 'react';
import { useDonorList } from '../Logic/useDonorList';

function DonorList() {
  const {
    donors,
    loading,
    error,
    actionMessage,
    deleteDonor,
    editDonor,
  } = useDonorList();

  return (
    <div
  style={{
    maxWidth: 1100,          // was 900
    margin: '10px auto',     // 10px margin all sides
    backgroundColor: '#fffdf3',
    borderRadius: 12,
    padding: '1.5rem 2rem 2rem',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
  }}
>
      <h2
        style={{
          fontFamily: 'var(--font-heading)',
          marginBottom: '1rem',
          color: 'var(--color-dark-brown)',
        }}
      >
        Manage Donors
      </h2>

      {actionMessage && (
        <div
          style={{
            backgroundColor: '#e3f2fd',
            borderRadius: 6,
            padding: '0.5rem 0.75rem',
            marginBottom: '0.75rem',
            color: '#1565c0',
            fontSize: 14,
          }}
        >
          {actionMessage}
        </div>
      )}

      {loading && <p>Loading donors...</p>}

      {error && (
        <div
          style={{
            backgroundColor: '#ffebee',
            borderRadius: 6,
            padding: '0.5rem 0.75rem',
            marginBottom: '0.75rem',
            color: '#c62828',
            fontSize: 14,
          }}
        >
          {error}
        </div>
      )}

      {!loading && !error && donors.length === 0 && (
        <p>No active donors found.</p>
      )}

      {!loading && !error && donors.length > 0 && (
       <div
  style={{
    borderRadius: 10,
    border: '1px solid #f0e0c2',
    padding: '0.25rem',     // a bit of inner space
    overflowX: 'visible',   // no horizontal scroll
  }}
>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: 14,
            }}
          >
            <thead
              style={{
                background:
                  'linear-gradient(90deg, var(--color-saffron) 0%, #ffd95a 100%)',
                color: 'var(--color-dark-brown)',
              }}
            >
              <tr>
                <th style={thStyle}>Donor ID</th>
                <th style={thStyle}>Name</th>
                <th style={thStyle}>Type</th>
                <th style={thStyle}>Phone</th>
                <th style={thStyle}>Email</th>
                <th style={thStyle}>City</th>
                <th style={thStyle}>Country</th>
               <th style={{ ...thStyle, width: 140, textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {donors.map((d, idx) => (
                <tr
                  key={d.donorId}
                  style={{
                    backgroundColor: idx % 2 === 0 ? '#fffdf8' : '#fff7e6',
                  }}
                >
                  <td style={tdStyle}>{d.donorId}</td>
                  <td style={tdStyle}>
                    {d.firstName} {d.lastName}
                  </td>
                  <td style={tdStyle}>{d.donorType || 'Individual'}</td>
                  <td style={tdStyle}>{d.phone || '-'}</td>
                  <td style={tdStyle}>{d.email || '-'}</td>
                  <td style={tdStyle}>{d.city || '-'}</td>
                  <td style={tdStyle}>{d.country || '-'}</td>
                  <td
  style={{
    ...tdStyle,
    whiteSpace: 'nowrap',
    textAlign: 'center',
  }}
>
  <button
    type="button"
    onClick={() => editDonor(d.donorId)}
    style={editButtonStyle}
  >
    Edit
  </button>
  <button
    type="button"
    onClick={() => deleteDonor(d.donorId)}
    style={deleteButtonStyle}
  >
    Delete
  </button>
</td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const thStyle = {
  padding: '0.6rem 0.75rem',
  textAlign: 'left',
  borderBottom: '1px solid #f0e0c2',
};

const tdStyle = {
  padding: '0.5rem 0.75rem',
  borderBottom: '1px solid #f3e5c4',
};

const editButtonStyle = {
  backgroundColor: '#2e7d32',
  color: '#fff',
  border: 'none',
  borderRadius: 4,
  padding: '0.25rem 0.5rem',   // slightly smaller
  fontSize: 12,
  fontWeight: 'bold',
  marginRight: 6,
  cursor: 'pointer',
};

const deleteButtonStyle = {
  backgroundColor: '#c62828',
  color: '#fff',
  border: 'none',
  borderRadius: 4,
  padding: '0.25rem 0.5rem',   // slightly smaller
  fontSize: 12,
  fontWeight: 'bold',
  cursor: 'pointer',
};


export default DonorList;
