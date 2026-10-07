import React, { useState } from 'react';
import { SchemeFilter } from '../components/schemes/SchemeFilter';
import { SchemeCard } from '../components/schemes/SchemeCard';
import { useSchemes } from '../hooks/useSchemes';
import { useUser } from '../hooks/useUser';

export const SchemesPage = () => {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');

  const filterCategory = category === 'All' ? undefined : category.toLowerCase();
  const { schemes, loading } = useSchemes({ search: search || undefined, category: filterCategory });
  const { savedSchemeIds, toggleSaveScheme } = useUser();

  const categories = [
    'Agriculture',
    'Education',
    'Healthcare',
    'Housing',
    'Women & Child',
    'Employment',
    'Finance',
    'Social Welfare'
  ];

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-white mb-2">Browse Government Schemes</h1>
        <p className="text-slate-400 text-sm">
          Explore official welfare programs across agriculture, healthcare, housing, financial loans, and education.
        </p>
      </div>

      <SchemeFilter
        search={search}
        setSearch={setSearch}
        category={category}
        setCategory={setCategory}
        categories={categories}
      />

      {loading ? (
        <div className="text-center py-20 text-slate-400 text-sm">Loading schemes...</div>
      ) : schemes.length === 0 ? (
        <div className="text-center py-20 glass-panel rounded-2xl border border-slate-800 text-slate-400">
          No schemes found matching your search criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {schemes.map((scheme) => (
            <SchemeCard
              key={scheme._id}
              scheme={scheme}
              onSave={toggleSaveScheme}
              isSaved={savedSchemeIds.includes(scheme.schemeId) || savedSchemeIds.includes(scheme._id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default SchemesPage;
