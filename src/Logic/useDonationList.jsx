// src/useDonationList.js
import { useEffect, useState } from 'react';
import apiClient from '../ApiClient/apiClient';

export function useDonationList() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('date');     // "date" | "amount" | "donor" | "receiptid"
  const [dir, setDir] = useState('desc');       // "asc" | "desc"
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const [items, setItems] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!year) return;
      setLoading(true);
      setError('');
      try {
        const res = await apiClient.get('/api/donorreceipts', {
          params: {
            year,
            page,
            pageSize,
            search: search || undefined,
            sort,
            dir,
          },
        }); // query params pattern [web:310][web:316]

        if (cancelled) return;

        setItems(res.data.items || []);
        setTotalCount(res.data.totalCount || 0);
      } catch (err) {
        if (cancelled) return;
        const msg =
          err.response?.data?.message ||
          err.response?.data ||
          'Failed to load donations.';
        setError(msg);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [year, search, sort, dir, page, pageSize]);

  function toggleSort(columnKey) {
    if (sort === columnKey) {
      setDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSort(columnKey);
      setDir('asc');
    }
    setPage(1);
  }

  function changeYear(newYear) {
    setYear(newYear);
    setPage(1);
  }

  function changeSearch(value) {
    setSearch(value);
    setPage(1);
  }

  function changePage(newPage) {
    setPage(newPage);
  }

  function changePageSize(newSize) {
    setPageSize(newSize);
    setPage(1);
  }

  async function downloadCsv() {
    if (!year) return;
    try {
      const res = await apiClient.get('/api/donorreceipts/export', {
        params: { year },
        responseType: 'blob',
      }); // file download pattern [web:311][web:314]

      const blob = new Blob([res.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `RAMA-Donations-${year}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert(
        err.response?.data?.message ||
          'Failed to download donations CSV for this year.'
      );
    }
  }

  const totalPages =
    pageSize > 0 ? Math.max(1, Math.ceil(totalCount / pageSize)) : 1;

  return {
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
  };
}
