import React, { useState } from 'react';
import api from '../lib/axios';
import { SchemeCard } from '../components/schemes/SchemeCard';
import { Button } from '../components/ui/Button';
import { CheckCircle2, UserCheck, ArrowRight, RefreshCw } from 'lucide-react';

export const EligibilityPage = () => {
  const [formData, setFormData] = useState({
    age: '',
    gender: 'All',
    state: 'All',
    annualIncome: '',
    casteCategory: 'General',
    occupation: ''
  });

  const [matches, setMatches] = useState(null);
  const [analysis, setAnalysis] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setAnalysis("");
    try {
      const ageNum = formData.age ? parseInt(formData.age, 10) : undefined;
      const payload = {
        age: ageNum,
        gender: formData.gender,
        state: formData.state === "All" ? "" : formData.state,
        annualIncome: formData.annualIncome ? parseInt(formData.annualIncome, 10) : undefined,
        category: formData.casteCategory.toLowerCase(),
        isWoman: formData.gender === "Female",
        isSeniorCitizen: ageNum ? ageNum >= 60 : false,
      };

      const response = await api.post('/eligibility/check', payload);
      if (response.data?.success) {
        setMatches(response.data.data.schemes || []);
        setAnalysis(response.data.data.analysis || "");
      } else {
        alert(response.data?.message || "Failed to check eligibility.");
      }
    } catch (err) {
      console.error('Eligibility check error:', err);
      alert(err.response?.data?.message || "An error occurred while checking eligibility.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto min-h-screen">
      <div className="text-center max-w-3xl mx-auto mb-10">
        <h1 className="text-3xl font-extrabold text-white mb-2">
          Personalized <span className="text-orange-400">Eligibility Navigator</span>
        </h1>
        <p className="text-slate-400 text-sm">
          Fill in your details below to instantly evaluate which central and state government schemes you are eligible to apply for.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Column */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 h-fit">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-orange-400" />
            Your Profile Parameters
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Age (Years)</label>
              <input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleChange}
                placeholder="e.g. 28"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Annual Family Income (INR)</label>
              <input
                type="number"
                name="annualIncome"
                value={formData.annualIncome}
                onChange={handleChange}
                placeholder="e.g. 180000"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Gender</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500"
              >
                <option value="All">All / Prefer not to say</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Transgender">Transgender</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Caste Category</label>
              <select
                name="casteCategory"
                value={formData.casteCategory}
                onChange={handleChange}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500"
              >
                <option value="General">General</option>
                <option value="OBC">OBC</option>
                <option value="SC">SC</option>
                <option value="ST">ST</option>
                <option value="EWS">EWS</option>
              </select>
            </div>

            <Button type="submit" disabled={loading} className="w-full mt-4">
              {loading ? 'Evaluating Eligibility...' : 'Find Matching Schemes'}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>
        </div>

        {/* Results Column */}
        <div className="lg:col-span-2">
          {matches === null ? (
            <div className="glass-panel p-12 rounded-2xl border border-slate-800 text-center text-slate-400">
              <CheckCircle2 className="w-12 h-12 text-orange-400/40 mx-auto mb-3" />
              <h4 className="text-lg font-semibold text-white mb-1">Ready to Check</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Submit your profile parameters on the left to see instant matched schemes with eligibility details.
              </p>
            </div>
          ) : matches.length === 0 ? (
            <div className="glass-panel p-12 rounded-2xl border border-slate-800 text-center text-slate-400">
              No matching schemes found for the specified criteria. Try adjusting income or age parameters.
            </div>
          ) : (
            <div>
              {analysis && (
                <div className="glass-panel p-5 rounded-2xl border border-orange-500/30 bg-orange-500/10 mb-6 text-sm text-slate-200 leading-relaxed">
                  <span className="font-bold text-orange-400 block mb-1">🤖 SarkariSetu AI Evaluation:</span>
                  {analysis}
                </div>
              )}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">
                  Matched Schemes ({matches.length})
                </h3>
                <span className="text-xs text-emerald-400 font-semibold bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                  High Eligibility Score
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {matches.map((scheme) => (
                  <SchemeCard key={scheme._id} scheme={scheme} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EligibilityPage;
