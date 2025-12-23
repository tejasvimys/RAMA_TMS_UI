import { useState } from 'react';
import apiClient from '../ApiClient/apiClient';

export function useDonationImport() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [file, setFile] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function handleYearChange(e) {
    setYear(Number(e.target.value));
  }

  function handleFileChange(e) {
    const f = e.target.files?.[0] || null;
    setFile(f);
  }

  async function runImport(kind) {
    if (!year) {
      setError('Please select a year.');
      return;
    }
    if (!file) {
      setError('Please choose a file.');
      return;
    }

    setLoading(true);
    setError('');
    setSummary(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const url =
        kind === 'dryrun'
          ? `/api/donationimport/dryrun?year=${year}`
          : `/api/donationimport?year=${year}`;

      const response = await apiClient.post(url, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setSummary(response.data);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setSummary(null);
      setError('Error running import. Please check the server logs.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setLoading(false);
    }
  }

  function runDryRun() {
    runImport('dryrun');
  }

  function runRealImport() {
    runImport('import');
  }

  function downloadFailedRows() {
    if (!summary || !summary.failedRowDtos || summary.failedRowDtos.length === 0) {
      return;
    }

    const rows = summary.failedRowDtos;
    const headers = [
      'FullName',
      'DonationAmountRaw',
      'Email',
      'Phone',
      'DateRaw',
      'ErrorMessage',
    ];

    const csvLines = [];
    csvLines.push(headers.join(','));

    rows.forEach((r) => {
      const values = [
        r.fullName || '',
        r.donationAmountRaw || '',
        r.email || '',
        r.phone || '',
        r.dateRaw || '',
        (r.errorMessage || '').replace(/"/g, '""'),
      ];

      const line = values
        .map((v) => {
          if (v.includes(',') || v.includes('"') || v.includes('\n')) {
            return `"${v.replace(/"/g, '""')}"`;
          }
          return v;
        })
        .join(',');

      csvLines.push(line);
    });

    const blob = new Blob([csvLines.join('\n')], {
      type: 'text/csv;charset=utf-8;',
    });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    const fileName = `FailedRows_${year}.csv`;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return {
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
  };
}
