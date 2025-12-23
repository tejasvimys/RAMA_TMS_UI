import React from "react";
import { useDonationForm } from "../Logic/useDonationForm";
import { DONATION_TYPES } from "../Constants/Constants";

function Donation() {
  const {
    form,
    errors,
    submitting,
    successMessage,
    donorInfo,
    handleChange,
    handleSubmit,
    lookupDonor,
  } = useDonationForm();

  function renderInput(label, name, extraProps = {}) {
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
          {...extraProps}
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
        Record Donation
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

      {errors.donorSearch && (
        <div
          style={{
            backgroundColor: "#fff3e0",
            borderRadius: 6,
            padding: "0.5rem 0.75rem",
            marginBottom: "0.75rem",
            color: "#e65100",
            fontSize: 14,
          }}
        >
          {errors.donorSearch}
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
        {/* Donor identification row */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "0.75rem 1rem",
            marginBottom: "0.5rem",
          }}
        >
          {renderInput("Donor ID", "donorId")}
          {renderInput("Phone", "phone")}
          {renderInput("Email", "email", { type: "email" })}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            marginBottom: "0.75rem",
          }}
        >
          <button
            type="button"
            onClick={lookupDonor}
            style={{
              backgroundColor: "var(--color-saffron)",
              color: "var(--color-text-light)",
              border: "none",
              borderRadius: 6,
              padding: "0.4rem 1rem",
              fontWeight: "bold",
              cursor: "pointer",
              boxShadow: "0 2px 4px rgba(0,0,0,0.15)",
              fontSize: 14,
            }}
          >
            Lookup Donor
          </button>

          {donorInfo && (
            <div style={{ fontSize: 14, color: "var(--color-dark-brown)" }}>
              <strong>Donor:</strong> {donorInfo.firstName} {donorInfo.lastName}{" "}
              (ID: {donorInfo.donorId}, Phone: {donorInfo.phone || "N/A"},
              Email: {donorInfo.email || "N/A"})
            </div>
          )}
        </div>

        {/* Donation core details */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "0.75rem 1rem",
            marginBottom: "0.75rem",
          }}
        >
          {renderInput("Amount *", "donationAmt", {
            type: "number",
            step: "0.01",
            min: "0",
          })}
          <div style={{ marginBottom: "0.75rem" }}>
            <label
              htmlFor="donationType"
              style={{ display: "block", fontWeight: "600", marginBottom: 4 }}
            >
              Donation Type *
            </label>
            <select
              id="donationType"
              name="donationType"
              value={form.donationType}
              onChange={handleChange}
              style={{
                width: "100%",
                padding: "0.5rem 0.75rem",
                borderRadius: 6,
                border: errors.donationType
                  ? "1px solid #c62828"
                  : "1px solid #d7ccc8",
                fontSize: 14,
                boxSizing: "border-box",
                backgroundColor: "#fff",
              }}
            >
              {DONATION_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
            {errors.donationType && (
              <div style={{ color: "#c62828", fontSize: 12, marginTop: 2 }}>
                {errors.donationType}
              </div>
            )}
          </div>
          <div style={{ marginBottom: "0.75rem" }}>
            <label
              htmlFor="currency"
              style={{ display: "block", fontWeight: "600", marginBottom: 4 }}
            >
              Currency
            </label>
            <select
              id="currency"
              name="currency"
              value={form.currency}
              onChange={handleChange}
              style={{
                width: "100%",
                padding: "0.5rem 0.75rem",
                borderRadius: 6,
                border: "1px solid #d7ccc8",
                fontSize: 14,
                boxSizing: "border-box",
                backgroundColor: "#fff",
              }}
            >
              <option value="USD">USD</option>
              <option value="INR">INR</option>
            </select>
          </div>
          <div style={{ marginBottom: "0.75rem" }}>
            <label
              htmlFor="dateOfDonation"
              style={{ display: "block", fontWeight: "600", marginBottom: 4 }}
            >
              Date
            </label>
            <input
              id="dateOfDonation"
              name="dateOfDonation"
              type="date"
              value={form.dateOfDonation}
              onChange={handleChange}
              style={{
                width: "100%",
                padding: "0.5rem 0.75rem",
                borderRadius: 6,
                border: "1px solid #d7ccc8",
                fontSize: 14,
                boxSizing: "border-box",
              }}
            />
          </div>
        </div>

        {/* Payment details */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "0.75rem 1rem",
            marginBottom: "0.75rem",
          }}
        >
          <div style={{ marginBottom: "0.75rem" }}>
            <label
              htmlFor="paymentMethod"
              style={{ display: "block", fontWeight: "600", marginBottom: 4 }}
            >
              Payment Method *
            </label>
            <select
              id="paymentMethod"
              name="paymentMethod"
              value={form.paymentMethod}
              onChange={handleChange}
              style={{
                width: "100%",
                padding: "0.5rem 0.75rem",
                borderRadius: 6,
                border: errors.paymentMethod
                  ? "1px solid #c62828"
                  : "1px solid #d7ccc8",
                fontSize: 14,
                boxSizing: "border-box",
                backgroundColor: "#fff",
              }}
            >
              <option value="">Select</option>
              <option value="Cash">Cash</option>
              <option value="Card">Card</option>
              <option value="Check">Check</option>
              <option value="Online">Online</option>
            </select>
            {errors.paymentMethod && (
              <div style={{ color: "#c62828", fontSize: 12, marginTop: 2 }}>
                {errors.paymentMethod}
              </div>
            )}
          </div>

          {renderInput("Payment Reference", "paymentReference")}
        </div>

        {/* Flags & notes */}
        <div style={{ marginBottom: "0.75rem" }}>
          <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <input
              type="checkbox"
              name="isTaxDeductible"
              checked={form.isTaxDeductible}
              onChange={handleChange}
            />
            <span>Tax deductible</span>
          </label>
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginTop: 4,
            }}
          >
            <input
              type="checkbox"
              name="isAnonymous"
              checked={form.isAnonymous}
              onChange={handleChange}
            />
            <span>Anonymous donor</span>
          </label>
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <label
            htmlFor="internalNotes"
            style={{ display: "block", fontWeight: "600", marginBottom: 4 }}
          >
            Internal Notes
          </label>
          <textarea
            id="internalNotes"
            name="internalNotes"
            value={form.internalNotes}
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
          {submitting ? "Saving..." : "Save Donation"}
        </button>
      </form>
    </div>
  );
}

export default Donation;
