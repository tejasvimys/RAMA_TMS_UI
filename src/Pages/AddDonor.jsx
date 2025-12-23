import React from "react";
import { useDonorForm } from "../Logic/useDonorForm";
import { DONOR_TYPES } from "../Constants/Constants";
import {COUNTRIES, COUNTRY_STATES} from '../Constants/LocationOptions';

function AddDonorPage() {
  const {
    form,
    errors,
    submitting,
    successMessage,
    handleChange,
    handleSubmit,
  } = useDonorForm();

    const availableStates = COUNTRY_STATES[form.country] || [];

  function renderInput(label, name, props = {}) {
    return (
      <div style={{ marginBottom: "0.75rem" }}>
        <label
          htmlFor={name}
          style={{ display: "block", fontWeight: "600", marginBottom: 4 }}
        >
          {label}
        </label>
        <input
          id={name}
          name={name}
          value={form[name]}
          onChange={handleChange}
          style={{
            width: "100%",
            padding: "0.5rem 0.75rem",
            borderRadius: 6,
            border: errors[name] ? "1px solid #c62828" : "1px solid #d7ccc8",
            fontSize: 14,
            boxSizing: "border-box",
          }}
          {...props}
        />
        {errors[name] && (
          <div style={{ color: "#c62828", fontSize: 12, marginTop: 2 }}>
            {errors[name]}
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      style={{
        maxWidth: 700,
        margin: "0 auto",
        backgroundColor: "#fffdf3",
        borderRadius: 12,
        padding: "1.5rem 2rem 2rem",
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
      }}
    >
      <h2
        style={{
          fontFamily: "var(--font-heading)",
          marginBottom: "1rem",
          color: "var(--color-dark-brown)",
        }}
      >
        Add Donor
      </h2>

      {errors.global && (
        <div
          style={{
            backgroundColor: "#ffebee",
            borderRadius: 6,
            padding: "0.5rem 0.75rem",
            marginBottom: "0.75rem",
            color: "#c62828",
            fontSize: 14,
          }}
        >
          {errors.global}
        </div>
      )}

      {successMessage && (
        <div
          style={{
            backgroundColor: "#e8f5e9",
            borderRadius: 6,
            padding: "0.5rem 0.75rem",
            marginBottom: "0.75rem",
            color: "#2e7d32",
            fontSize: 14,
          }}
        >
          {successMessage}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Row 1: Name */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '0.75rem 1rem',
            marginBottom: '0.75rem',
          }}
        >
          {renderInput('First Name *', 'firstName')}
          {renderInput('Last Name *', 'lastName')}
        </div>

        {/* Row 2: Contact */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '0.75rem 1rem',
            marginBottom: '0.75rem',
          }}
        >
          {renderInput('Phone', 'phone')}
          {renderInput('Email', 'email', { type: 'email' })}
        </div>

        {/* Row 3: Country + State */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '0.75rem 1rem',
            marginBottom: '0.75rem',
          }}
        >
          {/* Country dropdown */}
          <div>
            <label
              htmlFor="country"
              style={{ display: 'block', fontWeight: '600', marginBottom: 4 }}
            >
              Country
            </label>
            <select
              id="country"
              name="country"
              value={form.country}
              onChange={(e) => {
                // country change + reset state
                handleChange(e);
                const newCountry = e.target.value;
                if (form.state && !(COUNTRY_STATES[newCountry] || []).includes(form.state)) {
                  // reset state if not valid for new country
                  handleChange({
                    target: { name: 'state', value: '' },
                  });
                }
              }}
              style={{
                width: '100%',
                padding: '0.5rem 0.75rem',
                borderRadius: 6,
                border: '1px solid #d7ccc8',
                fontSize: 14,
                boxSizing: 'border-box',
                backgroundColor: '#fff',
              }}
            >
              {COUNTRIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          {/* State dropdown – options depend on country */}
          <div>
            <label
              htmlFor="state"
              style={{ display: 'block', fontWeight: '600', marginBottom: 4 }}
            >
              State
            </label>
            <select
              id="state"
              name="state"
              value={form.state}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '0.5rem 0.75rem',
                borderRadius: 6,
                border: '1px solid #d7ccc8',
                fontSize: 14,
                boxSizing: 'border-box',
                backgroundColor: '#fff',
              }}
            >
              <option value="">Select state</option>
              {availableStates.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Row 4: Address lines + city + postal */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '0.75rem 1rem',
            marginBottom: '0.75rem',
          }}
        >
          {renderInput('Address 1', 'address1')}
          {renderInput('Address 2', 'address2')}
          {renderInput('City', 'city')}
          {renderInput('Postal Code', 'postalCode')}
        </div>

        <div style={{ marginTop: "1rem", marginBottom: "0.75rem" }}>
          <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <input
              type="checkbox"
              name="isOrganization"
              checked={form.isOrganization}
              onChange={handleChange}
            />
            <span>Donor is an organization</span>
          </label>
        </div>

        {form.isOrganization &&
          renderInput("Organization Name *", "organizationName")}

        <div style={{ marginBottom: "0.75rem" }}>
          <label
            htmlFor="donorType"
            style={{ display: "block", fontWeight: "600", marginBottom: 4 }}
          >
            Donor Type
          </label>
          <select
            id="donorType"
            name="donorType"
            value={form.donorType}
            onChange={handleChange}
            style={{
              width: "100%",
              padding: "0.5rem 0.75rem",
              borderRadius: 6,
              border: errors.donorType
                ? "1px solid #c62828"
                : "1px solid #d7ccc8",
              fontSize: 14,
              boxSizing: "border-box",
              backgroundColor: "#fff",
            }}
          >
            {DONOR_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
          {errors.donorType && (
            <div style={{ color: "#c62828", fontSize: 12, marginTop: 2 }}>
              {errors.donorType}
            </div>
          )}
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <label
            htmlFor="notes"
            style={{ display: "block", fontWeight: "600", marginBottom: 4 }}
          >
            Notes
          </label>
          <textarea
            id="notes"
            name="notes"
            value={form.notes}
            onChange={handleChange}
            rows={3}
            style={{
              width: "100%",
              padding: "0.5rem 0.75rem",
              borderRadius: 6,
              border: "1px solid #d7ccc8",
              fontSize: 14,
              boxSizing: "border-box",
              resize: "vertical",
            }}
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          style={{
            backgroundColor: "var(--color-saffron)",
            color: "var(--color-text-light)",
            border: "none",
            borderRadius: 6,
            padding: "0.6rem 1.5rem",
            fontWeight: "bold",
            cursor: submitting ? "default" : "pointer",
            boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
          }}
        >
          {submitting ? "Saving..." : "Save Donor"}
        </button>
      </form>
    </div>
  );
}

export default AddDonorPage;
