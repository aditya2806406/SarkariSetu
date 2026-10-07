import React from 'react';
import { Search, Filter } from 'lucide-react';

export const SchemeFilter = ({ search, setSearch, category, setCategory, categories = [] }) => {
  return (
    <div className="glass-panel p-4 rounded-2xl border border-slate-800 mb-8 flex flex-col md:flex-row items-center gap-4">
      {/* Search Input */}
      <div className="relative flex-1 w-full">
        <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search schemes by name, keyword, benefits..."
          className="w-full bg-slate-900 border border-slate-700 text-white text-sm rounded-xl pl-11 pr-4 py-2.5 placeholder-slate-500 focus:outline-none focus:border-orange-500"
        />
      </div>

      {/* Category Dropdown */}
      <div className="flex items-center gap-2 w-full md:w-auto">
        <Filter className="w-4 h-4 text-slate-400 shrink-0" />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full md:w-48 bg-slate-900 border border-slate-700 text-slate-200 text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:border-orange-500 cursor-pointer"
        >
          <option value="All">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};
