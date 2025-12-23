import { useState } from 'react';
import apiClient from '../ApiClient/apiClient';
import { DONATION_TYPES } from '../Constants/Constants';

const initialForm = {
  donorId: '',
  phone: '',
  email: '',
  donationAmt: '',
  donationType: DONATION_TYPES.value,
  currency: 'USD',
  dateOfDonation: '',
  paymentMethod: '',
  paymentReference: '',
  isTaxDeductible: true,
  isAnonymous: false,
  internalNotes: '',
};

export function useDonationForm() {
  const [form, setForm] = useState(initialForm);
  const [donorInfo, setDonorInfo] = useState(null);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  }

  function validate() {
    const newErrors = {};

    if (!form.donorId && !form.phone && !form.email) {
      newErrors.donorSearch = 'Provide at least donor ID, phone, or email.';
    }

    if (form.email) {
      if (form.email.length > 255 || !form.email.includes('@')) {
        newErrors.email = 'Enter a valid email address.';
      }
    }

    if (form.phone && form.phone.length > 25) {
      newErrors.phone = 'Phone number is too long.';
    }

    if (form.donorId && isNaN(Number(form.donorId))) {
      newErrors.donorId = 'Donor ID must be numeric.';
    }

    if (!form.donationAmt || Number(form.donationAmt) <= 0) {
      newErrors.donationAmt = 'Donation amount must be greater than zero.';
    }

    if (!form.donationType.trim()) {
      newErrors.donationType = 'Donation type is required.';
    }

    if (!form.paymentMethod.trim()) {
      newErrors.paymentMethod = 'Payment method is required.';
    }

    return newErrors;
  }

  async function lookupDonor() {
    setSuccessMessage('');
    setErrors((prev) => ({ ...prev, donorSearch: undefined }));

    const donorId = form.donorId.trim();
    const phone = form.phone.trim();
    const email = form.email.trim();

    if (!donorId && !phone && !email) {
      setErrors((prev) => ({
        ...prev,
        donorSearch: 'Enter donor ID or phone or email to search.',
      }));
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    try {
      const params = new URLSearchParams();
      if (donorId) {
        if (isNaN(Number(donorId))) {
          setErrors((prev) => ({
            ...prev,
            donorId: 'Donor ID must be numeric.',
          }));
          window.scrollTo({ top: 0, behavior: 'smooth' });
          return;
        }
        params.append('donorId', donorId);
      }
      if (phone) params.append('phone', phone);
      if (email) params.append('email', email);

      const resp = await apiClient.get(`/api/donors/search?${params.toString()}`);
      const donors = resp.data || [];
      if (donors.length === 0) {
        setDonorInfo(null);
        setErrors((prev) => ({
          ...prev,
          donorSearch: 'No matching active donor found.',
        }));
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      const d = donors[0];

      setDonorInfo({
        donorId: d.donorId,
        firstName: d.firstName,
        lastName: d.lastName,
        phone: d.phone,
        email: d.email,
      });

      setForm((prev) => ({
        ...prev,
        donorId: d.donorId != null ? String(d.donorId) : prev.donorId,
        phone: prev.phone || d.phone || '',
        email: prev.email || d.email || '',
      }));

      setErrors((prev) => ({ ...prev, donorSearch: undefined }));
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      setDonorInfo(null);
      setErrors((prev) => ({
        ...prev,
        donorSearch: 'Unable to look up donor. Please try again.',
      }));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSuccessMessage('');
    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setSubmitting(true);
    try {
      let donorIdToUse = form.donorId ? Number(form.donorId) : null;

      if (!donorIdToUse) {
        if (donorInfo && donorInfo.donorId) {
          donorIdToUse = donorInfo.donorId;
        } else {
          const params = new URLSearchParams();
          if (form.phone) params.append('phone', form.phone.trim());
          if (form.email) params.append('email', form.email.trim());
          const searchResp = await apiClient.get(
            `/api/donors/search?${params.toString()}`
          );
          const donors = searchResp.data || [];
          if (donors.length === 0) {
            setErrors({
              donorSearch: 'No matching active donor found for phone/email.',
            });
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
          }
          donorIdToUse = donors[0].donorId;
        }
      }

      const payload = {
        donorId: donorIdToUse,
        donationAmt: Number(form.donationAmt),
        donationType: form.donationType.trim(),
        currency: form.currency.trim() || 'USD',
        dateOfDonation: form.dateOfDonation
          ? new Date(form.dateOfDonation).toISOString()
          : new Date().toISOString(),
        paymentMethod: form.paymentMethod.trim(),
        paymentReference: form.paymentReference.trim() || null,
        isTaxDeductible: form.isTaxDeductible,
        isAnonymous: form.isAnonymous,
        internalNotes: form.internalNotes || null,
      };

      const resp = await apiClient.post('/api/donorreceipts', payload);

      setSuccessMessage(
        `Donation recorded for donor ${donorIdToUse} (receipt ID ${resp.data.donorReceiptDetailId}).`
      );
      setErrors({});
      setForm(initialForm);
      setDonorInfo(null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setSuccessMessage('');
      if (err.response && err.response.data && err.response.data.errors) {
        const apiErrors = {};
        const serverErrors = err.response.data.errors;
        Object.keys(serverErrors).forEach((key) => {
          apiErrors[key] = serverErrors[key][0];
        });
        setErrors(apiErrors);
      } else {
        setErrors({
          global: 'Error saving donation. Please try again.',
        });
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setSubmitting(false);
    }
  }

  return {
    form,
    errors,
    submitting,
    successMessage,
    donorInfo,
    handleChange,
    handleSubmit,
    lookupDonor,
  };
}