import { useState, useEffect } from 'react';
import api from '../lib/axios';

export const useUser = (clerkId = 'guest_user') => {
  const [savedSchemeIds, setSavedSchemeIds] = useState(() => {
    try {
      const stored = localStorage.getItem('sarkarisetu_saved_schemes');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem('sarkarisetu_saved_schemes', JSON.stringify(savedSchemeIds));
    } catch (err) {
      console.error('Failed to update saved schemes in localStorage:', err);
    }
  }, [savedSchemeIds]);

  const toggleSaveScheme = async (schemeId) => {
    setSavedSchemeIds((prev) =>
      prev.includes(schemeId) ? prev.filter((id) => id !== schemeId) : [...prev, schemeId]
    );
  };

  return { savedSchemeIds, toggleSaveScheme, loading };
};
