// src/useQuickDonationForm.js
import { useState } from "react";
import apiClient from "../ApiClient/apiClient";
import { DONOR_TYPES } from "../Constants/Constants"; // you already have this

const initialState = {
  donor: {
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    address1: "",
    address2: "",
    city: "",
    state: "",
    country: "",
    postalCode: "",
    isOrganization: false,
    organizationName: "",
    donorType: DONOR_TYPES.Individual || "Individual",
  },
  donation: {
    donationAmt: "",
    donationType: "",
    dateOfDonation: new Date().toISOString().substring(0, 10),
    paymentMode: "",
    referenceNo: "",
    notes: "",
  },
};

export function useQuickDonationForm() {
  const [form, setForm] = useState(initialState);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [createdDonorId, setCreatedDonorId] = useState(null);

  function updateField(section, name, value) {
    setForm((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [name]: value,
      },
    }));
  }

  function validate() {
    setError("");
    const { donor, donation } = form;

    if (!donor.firstName.trim() || !donor.lastName.trim()) {
      setError("First name and last name are required.");
      return false;
    }
    if (!donation.donationAmt || Number(donation.donationAmt) <= 0) {
      setError("Donation amount must be greater than zero.");
      return false;
    }
    if (!donation.donationType) {
      setError("Donation type is required.");
      return false;
    }
    return true;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setError("");
    setSuccess("");
    setCreatedDonorId(null);

    try {
      const payload = {
        donor: form.donor,
        donation: {
          ...form.donation,
          donationAmt: Number(form.donation.donationAmt),
        },
      };

      const res = await apiClient.post(
        "/api/donorreceipts/quick-with-receipt",
        payload,
        { responseType: "blob" }
      );
      const data = res.data;

      // Get filename from Content-Disposition
      let fileName = "DonationReceipt.pdf";
      const disposition = res.headers["content-disposition"];
      if (disposition) {
        const match = disposition.match(
          /filename\*?=(?:UTF-8'')?\"?([^\";]+)/i
        );
        if (match && match[1]) {
          fileName = decodeURIComponent(match[1]);
        }
      }

      // Trigger download
      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName; // or from Content-Disposition header
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      setSuccess(
        `Donation saved. DonorId: ${data.donorId}, ReceiptId: ${data.donorReceiptDetailId}.`
      );
      setCreatedDonorId(data.donorId);
      // Optionally reset donation only
      setForm((prev) => ({
        ...prev,
        donation: {
          ...initialState.donation,
          dateOfDonation: prev.donation.dateOfDonation,
        },
      }));
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data ||
        "Failed to save donor and donation.";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  }

  return {
    form,
    updateField,
    handleSubmit,
    submitting,
    error,
    success,
    createdDonorId,
  };
}
