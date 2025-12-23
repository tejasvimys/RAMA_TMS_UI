// src/DonationListPage.js
import React from 'react';
import { useDonationList } from '../Logic/useDonationList';

export default function DonationListPage() {
  const {
    state: {
      year,
      search,
      sort,
      dir,
      page,
      pageSize,
      totalPages,
      items,
      totalCount,
      loading,
      error,
    },
    actions: {
      changeYear,
      changeSearch,
      toggleSort,
      changePage,
      changePageSize,
      downloadCsv,
    },
  } = useDonationList();

  const headerStyle = {
    padding: '0.5rem',
    cursor: 'pointer',
    userSelect: 'none',
    whiteSpace: 'nowrap',
    borderBottom: '1px solid #e5e7eb',
    backgroundColor: '#f9fafb',
  };

  const cellStyle = {
    padding: '0.4rem 0.5rem',
    borderBottom: '1px solid #f3f4f6',
    fontSize: '0.9rem',
  };

  const sortIndicator = (key) => {
    if (sort !== key) return '';
    return dir === 'asc' ? ' ▲' : ' ▼';
  };

  return (
    <div style={{ padding: '1.5rem' }}>
      <h2 style={{ marginBottom: '1rem' }}>Donations</h2>

      {/* Filters / actions */}
      <div
        style={{
          display: 'flex',
          gap: '1rem',
          alignItems: 'center',
          marginBottom: '1rem',
          flexWrap: 'wrap',
        }}
      >
        <div>
          <label style={{ marginRight: '0.5rem' }}>Year:</label>
          <input
            type="number"
            value={year}
            onChange={(e) => changeYear(Number(e.target.value) || new Date().getFullYear())}
            style={{ width: '6rem' }}
          />
        </div>

        <div>
          <label style={{ marginRight: '0.5rem' }}>Search:</label>
          <input
            type="text"
            value={search}
            onChange={(e) => changeSearch(e.target.value)}
            placeholder="Donor / email / notes"
          />
        </div>

        <div>
          <label style={{ marginRight: '0.5rem' }}>Page size:</label>
          <select
            value={pageSize}
            onChange={(e) => changePageSize(Number(e.target.value))}
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>

        <button
          type="button"
          onClick={downloadCsv}
          style={{
            marginLeft: 'auto',
            backgroundColor: '#15803d',
            color: 'white',
            border: 'none',
            borderRadius: 4,
            padding: '0.4rem 0.9rem',
            cursor: 'pointer',
          }}
        >
          Download CSV for {year}
        </button>
      </div>

      {error && (
        <div style={{ color: 'red', marginBottom: '0.75rem' }}>{error}</div>
      )}

      <div style={{ overflowX: 'auto' }}>
        <table style={{ borderCollapse: 'collapse', width: '100%' }}>
          <thead>
            <tr>
              <th
                style={headerStyle}
                onClick={() => toggleSort('receiptid')}
              >
                Receipt Id{sortIndicator('receiptid')}
              </th>
              <th style={headerStyle} onClick={() => toggleSort('date')}>
                Date{sortIndicator('date')}
              </th>
              <th style={headerStyle} onClick={() => toggleSort('donor')}>
                Donor{sortIndicator('donor')}
              </th>
              <th style={headerStyle}>Email</th>
              <th style={headerStyle} onClick={() => toggleSort('amount')}>
                Amount{sortIndicator('amount')}
              </th>
              <th style={headerStyle}>Type</th>
              <th style={headerStyle}>Payment</th>
              <th style={headerStyle}>Ref</th>
              <th style={headerStyle}>Notes</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td style={cellStyle} colSpan={9}>
                  Loading...
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td style={cellStyle} colSpan={9}>
                  No donations found.
                </td>
              </tr>
            ) : (
              items.map((d) => (
                <tr key={d.donorReceiptDetailId}>
                  <td style={cellStyle}>{d.donorReceiptDetailId}</td>
                  <td style={cellStyle}>
                    {new Date(d.dateOfDonation).toLocaleDateString()}
                  </td>
                  <td style={cellStyle}>
                    {`${d.donorFirstName} ${d.donorLastName}`.trim()}
                  </td>
                  <td style={cellStyle}>{d.donorEmail}</td>
                  <td style={cellStyle}>
                    {d.donationAmt?.toLocaleString('en-US', {
                      style: 'currency',
                      currency: 'USD',
                    })}
                  </td>
                  <td style={cellStyle}>{d.donationType}</td>
                  <td style={cellStyle}>{d.paymentMode}</td>
                  <td style={cellStyle}>{d.referenceNo}</td>
                  <td style={cellStyle}>{d.notes}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          marginTop: '0.75rem',
        }}
      >
        <span>
          Page {page} of {totalPages} (Total {totalCount})
        </span>

        <button
          type="button"
          disabled={page <= 1}
          onClick={() => changePage(page - 1)}
        >
          Prev
        </button>
        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => changePage(page + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}