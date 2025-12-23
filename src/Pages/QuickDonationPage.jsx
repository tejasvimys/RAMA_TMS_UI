// src/QuickDonationPage.js
import React from 'react';
import { useQuickDonationForm } from '../Logic/useQuickDonationForm';
import { DONATION_TYPES } from '../Constants/Constants'; // you already use this list

function QuickDonationPage() {
  const {
    form,
    updateField,
    handleSubmit,
    submitting,
    error,
    success,
    createdDonorId,
  } = useQuickDonationForm();

  const labelStyle = { fontWeight: 600, marginBottom: '0.25rem', display: 'block' };
  const inputStyle = {
    width: '100%',
    padding: '0.4rem 0.6rem',
    borderRadius: 4,
    border: '1px solid #d7b57a',
    marginBottom: '0.5rem',
  };

  return (
    <div style={{ padding: '1.5rem' }}>
      <h2 style={{ color: '#b24a00', marginBottom: '1rem' }}>
        Quick Donation (New Donor)
      </h2>

      {error && (
        <div style={{ background: '#ffe5e5', color: '#900', padding: '0.75rem', borderRadius: 4, marginBottom: '0.75rem' }}>
          {error}
        </div>
      )}
      {success && (
        <div style={{ background: '#e5ffe9', color: '#046c2c', padding: '0.75rem', borderRadius: 4, marginBottom: '0.75rem' }}>
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1.2fr 1fr',
            gap: '1.5rem',
            alignItems: 'flex-start',
          }}
        >
          {/* Donor block */}
          <div
            style={{
              background: '#fffaf0',
              borderRadius: 8,
              padding: '1rem 1.25rem',
              boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
            }}
          >
            <h3 style={{ color: '#a04a00', marginBottom: '0.75rem' }}>Donor Details</h3>

            <label style={labelStyle}>First Name *</label>
            <input
              style={inputStyle}
              value={form.donor.firstName}
              onChange={e => updateField('donor', 'firstName', e.target.value)}
            />

            <label style={labelStyle}>Last Name *</label>
            <input
              style={inputStyle}
              value={form.donor.lastName}
              onChange={e => updateField('donor', 'lastName', e.target.value)}
            />

            <label style={labelStyle}>Phone</label>
            <input
              style={inputStyle}
              value={form.donor.phone}
              onChange={e => updateField('donor', 'phone', e.target.value)}
            />

            <label style={labelStyle}>Email</label>
            <input
              style={inputStyle}
              value={form.donor.email}
              onChange={e => updateField('donor', 'email', e.target.value)}
            />

            <label style={labelStyle}>Donor Type</label>
            <select
              style={inputStyle}
              value={form.donor.donorType}
              onChange={e => updateField('donor', 'donorType', e.target.value)}
            >
              <option value="Individual">Individual</option>
              <option value="Corporate">Corporate</option>
            </select>

            {/* You can add address / org fields here, same pattern */}
          </div>

          {/* Donation block */}
          <div
            style={{
              background: '#fffaf0',
              borderRadius: 8,
              padding: '1rem 1.25rem',
              boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
            }}
          >
            <h3 style={{ color: '#a04a00', marginBottom: '0.75rem' }}>Donation Details</h3>

            <label style={labelStyle}>Amount *</label>
            <input
              type="number"
              step="0.01"
              style={inputStyle}
              value={form.donation.donationAmt}
              onChange={e => updateField('donation', 'donationAmt', e.target.value)}
            />

            <label style={labelStyle}>Donation Type *</label>
            <select
              style={inputStyle}
              value={form.donation.donationType}
              onChange={e => updateField('donation', 'donationType', e.target.value)}
            >
              <option value="">Select...</option>
              {DONATION_TYPES.map(t => (
                <option key={t.label} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>

            <label style={labelStyle}>Donation Date</label>
            <input
              type="date"
              style={inputStyle}
              value={form.donation.dateOfDonation}
              onChange={e => updateField('donation', 'dateOfDonation', e.target.value)}
            />

            <label style={labelStyle}>Payment Mode</label>
            <input
              style={inputStyle}
              value={form.donation.paymentMode}
              onChange={e => updateField('donation', 'paymentMode', e.target.value)}
            />

            <label style={labelStyle}>Reference No</label>
            <input
              style={inputStyle}
              value={form.donation.referenceNo}
              onChange={e => updateField('donation', 'referenceNo', e.target.value)}
            />

            <label style={labelStyle}>Notes</label>
            <textarea
              rows={3}
              style={{ ...inputStyle, resize: 'vertical' }}
              value={form.donation.notes}
              onChange={e => updateField('donation', 'notes', e.target.value)}
            />

            {createdDonorId && (
              <div style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: '#555' }}>
                New DonorId: <strong>{createdDonorId}</strong>
              </div>
            )}
          </div>
        </div>

        <div style={{ marginTop: '1.25rem' }}>
          <button
            type="submit"
            disabled={submitting}
            style={{
              background: submitting ? '#c7a36f' : '#d97706',
              color: 'white',
              border: 'none',
              borderRadius: 6,
              padding: '0.7rem 1.8rem',
              fontWeight: 'bold',
              cursor: submitting ? 'default' : 'pointer',
              boxShadow: '0 2px 5px rgba(0,0,0,0.25)',
            }}
          >
            {submitting ? 'Saving...' : 'Save Donor & Donation'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default QuickDonationPage;
