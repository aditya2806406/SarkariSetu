import React, { useState, useEffect } from 'react';
import api from '../lib/axios';
import { SchemeCard } from '../components/schemes/SchemeCard';
import { useUser } from '../hooks/useUser';
import { Bookmark } from 'lucide-react';

export const SavedPage = () => {
  const { savedSchemeIds, toggleSaveScheme } = useUser();
  const [savedSchemes, setSavedSchemes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSaved = async () => {
      setLoading(true);
      try {
        const response = await api.get('/schemes');
        if (response.data?.success) {
          const filtered = response.data.data.filter((s) =>
            savedSchemeIds.includes(s._id) || savedSchemeIds.includes(s.schemeId)
          );
          setSavedSchemes(filtered);
        }
      } catch (err) {
        console.error('Fetch saved schemes error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSaved();
  }, [savedSchemeIds]);

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-white mb-2 flex items-center gap-2">
          <Bookmark className="w-7 h-7 text-orange-400" />
          Saved Schemes & Application Drafts
        </h1>
        <p className="text-slate-400 text-sm">
          Keep track of government schemes you intend to apply for along with your document readiness scores.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-400">Loading saved schemes...</div>
      ) : savedSchemes.length === 0 ? (
        <div className="glass-panel p-16 rounded-3xl text-center border border-slate-800 text-slate-400">
          <Bookmark className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-white mb-1">No Saved Schemes Yet</h3>
          <p className="text-xs text-slate-400">Bookmark schemes while browsing to save them for quick access later.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedSchemes.map((scheme) => (
            <SchemeCard
              key={scheme._id}
              scheme={scheme}
              onSave={toggleSaveScheme}
              isSaved={true}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default SavedPage;
