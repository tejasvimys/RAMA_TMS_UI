import { useEffect, useRef, useState } from 'react';
import apiClient from '../ApiClient/apiClient';

export function useDonationImport() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [file, setFile] = useState(null);
  const [summary, setSummary] = useState(null);
  const [jobId, setJobId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const pollRef = useRef(null);

  function handleYearChange(e) {
    setYear(Number(e.target.value));
  }

  async function downloadReceipts() {
    const id = summary?.jobId;
    if (!id) return;
    try {
      const res = await apiClient.get(`/api/donationimport/receipts/${id}`, {
        responseType: 'blob',
      });
      const blob = new Blob([res.data], { type: 'application/zip' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.setAttribute('download', `receipts_${summary?.year || ''}_${id}.zip`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      setError('Unable to download receipts.');
    }
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
    setJobId(null);
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }

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
      if (response.data?.jobId) {
        setJobId(response.data.jobId);
        startPolling(response.data.jobId);
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setSummary(null);
      setError('Error running import. Please check the server logs.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setLoading(false);
    }

  function startPolling(id) {
    if (!id) return;
    if (pollRef.current) {
      clearInterval(pollRef.current);
    }

    pollRef.current = setInterval(async () => {
      try {
        const res = await apiClient.get(`/api/donationimport/status/${id}`);
        const data = res.data;
        setSummary(data);

        const totalEmails = data?.emailStatuses?.length || 0;
        const completed = (data?.emailsSent || 0) + (data?.emailsFailed || 0);
        const anyProcessing = data?.emailStatuses?.some((s) =>
          ['Processing', 'Pending (dry run)'].includes(s.status)
        );

        if (totalEmails > 0 && completed >= totalEmails && !anyProcessing) {
          clearInterval(pollRef.current);
          pollRef.current = null;
        }
      } catch (e) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    }, 1000);
  }

  useEffect(() => {
    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
  }, []);
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

  function downloadEmailStatus() {
    if (!summary || !summary.emailStatuses || summary.emailStatuses.length === 0) {
      return;
    }

    const headers = ['DonorId', 'Email', 'Status', 'Attempts', 'ErrorMessage'];
    const csvLines = [];
    csvLines.push(headers.join(','));

    summary.emailStatuses.forEach((r) => {
      const values = [
        r.donorId ?? '',
        r.email ?? '',
        r.status ?? '',
        r.attempts ?? 0,
        (r.errorMessage || '').replace(/"/g, '""'),
      ];

      const line = values
        .map((v) => {
          const str = `${v}`;
          if (str.includes(',') || str.includes('"') || str.includes('\n')) {
            return `"${str.replace(/"/g, '""')}"`;
          }
          return str;
        })
        .join(',');

      csvLines.push(line);
    });

    const blob = new Blob([csvLines.join('\n')], {
      type: 'text/csv;charset=utf-8;',
    });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    const fileName = `EmailStatus_${year}.csv`;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return {
    year,
    file,
    summary,
    jobId,
    loading,
    error,
    handleYearChange,
    handleFileChange,
    runDryRun,
    runRealImport,
    downloadFailedRows,
    downloadEmailStatus,
    downloadReceipts,
  };
}
