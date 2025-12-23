import React from 'react';
import { useDonationImport } from '../Logic/useDonationImport';

function AnnualImportPage() {
  const {
    year,
    file,
    summary,
    loading,
    error,
    handleYearChange,
    handleFileChange,
    runDryRun,
    runRealImport,
    downloadFailedRows,
  } = useDonationImport();

  const currentYear = new Date().getFullYear();
  const years = [];
  for (let y = currentYear - 3; y <= currentYear + 1; y++) {
    years.push(y);
  }

  const thMini = {
  padding: '0.35rem 0.45rem',
  textAlign: 'left',
  borderBottom: '1px solid #f0e0c2',
};

const tdMini = {
  padding: '0.3rem 0.45rem',
  borderBottom: '1px solid #f3e5c4',
};

  return (
    <div
      style={{
        maxWidth: 700,
        margin: '0 auto',
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
        Annual Donation Import
      </h2>

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

      {summary && (
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
          <div>
            <strong>Year:</strong> {year}
          </div>
          <div>
            <strong>Donors created:</strong> {summary.donorsCreated}
          </div>
          <div>
            <strong>Donors matched:</strong> {summary.donorsMatched}
          </div>
          <div>
            <strong>Donations imported:</strong> {summary.donationsImported}
          </div>
          <div>
            <strong>Rows failed:</strong> {summary.rowsFailed}
          </div>
          {summary.rowsFailed > 0 && summary.failedRowDtos?.length > 0 && (
            <button
              type="button"
              onClick={downloadFailedRows}
              style={{
                marginTop: '0.5rem',
                backgroundColor: '#f57c00',
                color: '#fff',
                border: 'none',
                borderRadius: 6,
                padding: '0.4rem 1rem',
                fontWeight: 'bold',
                cursor: 'pointer',
              }}
            >
              Download Failed Rows
            </button>
          )}
        </div>
      )}

            {summary && summary.importedRows && summary.importedRows.length > 0 && (
        <div
          style={{
            marginBottom: '1.5rem',
            marginTop: '0.5rem',
            borderRadius: 10,
            border: '1px solid #f0e0c2',
            padding: '0.5rem',
            backgroundColor: '#fffdf8',
          }}
        >
          <div
            style={{
              fontWeight: '600',
              marginBottom: '0.5rem',
              color: 'var(--color-dark-brown)',
            }}
          >
            Last import preview (showing first 50 rows)
          </div>
          <div style={{ maxHeight: 260, overflowY: 'auto' }}>
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: 13,
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
                  <th style={thMini}>Donor ID</th>
                  <th style={thMini}>Name</th>
                  <th style={thMini}>Email</th>
                  <th style={thMini}>Phone</th>
                  <th style={thMini}>Amount</th>
                  <th style={thMini}>Date</th>
                  <th style={thMini}>Status</th>
                </tr>
              </thead>
              <tbody>
                {summary.importedRows.slice(0, 50).map((r, idx) => (
                  <tr
                    key={idx}
                    style={{
                      backgroundColor: idx % 2 === 0 ? '#fffdf8' : '#fff7e6',
                    }}
                  >
                    <td style={tdMini}>{r.donorId || '-'}</td>
                    <td style={tdMini}>{r.donorName}</td>
                    <td style={tdMini}>{r.email}</td>
                    <td style={tdMini}>{r.phone}</td>
                    <td style={tdMini}>
                      {r.donationAmount != null
                        ? Number(r.donationAmount).toFixed(2)
                        : '-'}
                    </td>
                    <td style={tdMini}>
                      {r.dateOfDonation
                        ? new Date(r.dateOfDonation).toLocaleDateString()
                        : '-'}
                    </td>
                    <td style={tdMini}>{r.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div style={{ marginBottom: '1rem' }}>
        <label
          htmlFor="importYear"
          style={{ display: 'block', fontWeight: '600', marginBottom: 4 }}
        >
          Tax Year
        </label>
        <select
          id="importYear"
          value={year}
          onChange={handleYearChange}
          style={{
            width: '160px',
            padding: '0.4rem 0.6rem',
            borderRadius: 6,
            border: '1px solid #d7ccc8',
            fontSize: 14,
            backgroundColor: '#fff',
          }}
        >
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: '1.25rem' }}>
        <label
          htmlFor="importFile"
          style={{ display: 'block', fontWeight: '600', marginBottom: 4 }}
        >
          Donation CSV / Excel
        </label>
        <input
          id="importFile"
          type="file"
          accept=".csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
          onChange={handleFileChange}
          style={{ fontSize: 14 }}
        />
        {file && (
          <div style={{ fontSize: 12, marginTop: 4 }}>
            Selected: {file.name} ({Math.round(file.size / 1024)} KB)
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <button
          type="button"
          disabled={loading}
          onClick={runDryRun}
          style={{
            backgroundColor: '#0288d1',
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            padding: '0.6rem 1.2rem',
            fontWeight: 'bold',
            cursor: loading ? 'default' : 'pointer',
            boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
          }}
        >
          {loading ? 'Running...' : 'Dry Run'}
        </button>

        <button
          type="button"
          disabled={loading}
          onClick={runRealImport}
          style={{
            backgroundColor: 'var(--color-saffron)',
            color: 'var(--color-text-light)',
            border: 'none',
            borderRadius: 6,
            padding: '0.6rem 1.4rem',
            fontWeight: 'bold',
            cursor: loading ? 'default' : 'pointer',
            boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
          }}
        >
          {loading ? 'Importing...' : 'Import'}
        </button>
      </div>
    </div>

  );
}

export default AnnualImportPage;
