import { useState } from 'react';
import apiClient from '../ApiClient/apiClient';
import { COUNTRIES } from '../Constants/LocationOptions';
import { DONOR_TYPES } from '../Constants/Constants';

const initialForm = {
  firstName: '',
  lastName: '',
  phone: '',
  email: '',
  address1: '',
  address2: '',
  city: '',
  state: '',
  country: COUNTRIES[0].value,
  postalCode: '',
  isOrganization: false,
  organizationName: '',
  donorType: DONOR_TYPES[0].value,
  notes: '',
};



export function useDonorForm() {
  const [form, setForm] = useState(initialForm);
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

    if (!form.firstName.trim()) newErrors.firstName = 'First name is required.';
    if (!form.lastName.trim()) newErrors.lastName = 'Last name is required.';

    if (form.email) {
      if (form.email.length > 255 || !form.email.includes('@')) {
        newErrors.email = 'Enter a valid email address.';
      }
    }

    if (form.phone && form.phone.length > 25) {
      newErrors.phone = 'Phone number is too long.';
    }

    if (form.isOrganization && !form.organizationName.trim()) {
      newErrors.organizationName =
        'Organization name is required for organization donors.';
    }

    return newErrors;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSuccessMessage('');
    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setSubmitting(true);
    try {
      const payload = {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        phone: form.phone.trim() || null,
        email: form.email.trim() || null,
        address1: form.address1.trim() || null,
        address2: form.address2.trim() || null,
        city: form.city.trim() || null,
        state: form.state.trim() || null,
        country: form.country.trim() || null,
        postalCode: form.postalCode.trim() || null,
        isOrganization: form.isOrganization,
        organizationName: form.organizationName.trim() || null,
        donorType: form.donorType.trim() || null,
        notes: form.notes || null,
        allowEmail: true,
        allowSms: false,
        allowMail: true,
      };

      const response = await apiClient.post('/api/donors', payload);
      setSuccessMessage(`Donor created with ID ${response.data.donorId}.`);
      setForm(initialForm);
      setErrors({});
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
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setErrors({
          global: 'An error occurred while saving donor. Please try again.',
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } finally {
      setSubmitting(false);
    }
  }

  return {
    form,
    errors,
    submitting,
    successMessage,
    handleChange,
    handleSubmit,
  };
}