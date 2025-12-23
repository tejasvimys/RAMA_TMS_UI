import { useEffect, useState } from 'react';
import apiClient from '../ApiClient/apiClient';

export function useDonorList() {
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionMessage, setActionMessage] = useState('');

  async function loadDonors() {
    setLoading(true);
    setError('');
    try {
      const response = await apiClient.get('/api/donors');
      setDonors(response.data || []);
    } catch (err) {
      setError('Unable to load donors. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDonors();
  }, []);

  async function deleteDonor(donorId) {
    if (!window.confirm('Are you sure you want to delete this donor?')) return;

    try {
      await apiClient.delete(`/api/donors/${donorId}`);
      setActionMessage(`Donor ${donorId} deleted.`);
      setDonors((prev) => prev.filter((d) => d.donorId !== donorId));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setActionMessage('Failed to delete donor.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  function editDonor(donorId) {
    // For now just log; later you’ll route to an Edit page
    console.log('Edit donor', donorId);
    setActionMessage(`Edit donor ${donorId} (hooked up later).`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return { donors, loading, error, actionMessage, deleteDonor, editDonor };
}
