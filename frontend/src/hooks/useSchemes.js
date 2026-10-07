import { useState, useEffect } from 'react';
import api from '../lib/axios';

export const useSchemes = (filters = {}) => {
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSchemes = async () => {
    setLoading(true);
    try {
      const response = await api.get('/schemes', { params: filters });
      if (response.data?.success) {
        setSchemes(response.data.data);
      }
    } catch (err) {
      console.error('Fetch schemes error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchemes();
  }, [filters.category, filters.search, filters.state]);

  return { schemes, loading, error, refetch: fetchSchemes };
};
