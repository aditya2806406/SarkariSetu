import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../lib/axios';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { ExternalLink, CheckSquare, Square, ArrowLeft, ShieldCheck, FileText, CheckCircle2 } from 'lucide-react';

export const SchemeDetail = () => {
  const { schemeId } = useParams();
  const [scheme, setScheme] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkedDocs, setCheckedDocs] = useState({});

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const response = await api.get(`/schemes/${schemeId}`);
        if (response.data?.success) {
          setScheme(response.data.data);
        }
      } catch (err) {
        console.error('Fetch detail error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [schemeId]);

  const toggleDoc = (index) => {
    setCheckedDocs((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  if (loading) return <div className="text-center py-20 text-slate-400">Loading scheme detail...</div>;
  if (!scheme) return <div className="text-center py-20 text-slate-400">Scheme not found.</div>;

  const totalDocs = scheme.documentsRequired?.length || 0;
  const readyDocs = Object.values(checkedDocs).filter(Boolean).length;
  const readinessPercent = totalDocs > 0 ? Math.round((readyDocs / totalDocs) * 100) : 100;

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto min-h-screen">
      <Link to="/schemes" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to Schemes
      </Link>

      <div className="glass-panel p-6 md:p-8 rounded-3xl border border-slate-800 mb-8">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <Badge variant="orange">{scheme.category}</Badge>
            <span className="text-xs text-slate-400 font-medium">
              {(scheme.eligibility?.states && scheme.eligibility.states.length > 0)
                ? scheme.eligibility.states.join(", ")
                : (scheme.state || 'Central / All India')}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
            <ShieldCheck className="w-4 h-4" /> Official Source Verified
          </div>
        </div>

        <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-4">{scheme.name || scheme.title}</h1>
        <p className="text-slate-300 text-base leading-relaxed mb-4">{scheme.tagline || scheme.shortDescription}</p>

        {(scheme.description || scheme.detailedDescription) && (
          <p className="text-slate-400 text-sm leading-relaxed mb-6">{scheme.description || scheme.detailedDescription}</p>
        )}

        <div className="flex flex-wrap gap-4 pt-6 border-t border-slate-800">
          <a href={scheme.officialWebsite || scheme.officialPortalUrl || "#"} target="_blank" rel="noreferrer">
            <Button variant="primary">
              Proceed to Official Portal <ExternalLink className="w-4 h-4" />
            </Button>
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* Key Benefits */}
        <Card>
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            Key Benefits
          </h3>
          <ul className="space-y-3">
            {scheme.benefits?.map((ben, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-slate-300">
                <span className="w-2 h-2 rounded-full bg-emerald-400 mt-2 shrink-0" />
                <span>{ben}</span>
              </li>
            ))}
          </ul>
        </Card>

        {/* Eligibility Criteria */}
        <Card>
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-orange-400" />
            Eligibility Rules
          </h3>
          <div className="space-y-2 text-sm text-slate-300">
            {(scheme.eligibility?.minAge || scheme.eligibilityCriteria?.minAge) && (
              <div className="flex justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-400">Min Age:</span>
                <span className="font-semibold text-white">{scheme.eligibility?.minAge || scheme.eligibilityCriteria?.minAge} Years</span>
              </div>
            )}
            {(scheme.eligibility?.maxAge) && (
              <div className="flex justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-400">Max Age:</span>
                <span className="font-semibold text-white">{scheme.eligibility.maxAge} Years</span>
              </div>
            )}
            {(scheme.eligibility?.maxAnnualIncome || scheme.eligibilityCriteria?.maxIncomeLimit) && (
              <div className="flex justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-400">Max Family Income:</span>
                <span className="font-semibold text-white">₹{(scheme.eligibility?.maxAnnualIncome || scheme.eligibilityCriteria?.maxIncomeLimit).toLocaleString()} / year</span>
              </div>
            )}
            <div className="flex justify-between py-1.5 border-b border-slate-800">
              <span className="text-slate-400">Categories:</span>
              <span className="font-semibold text-white">
                {(scheme.eligibility?.categories && scheme.eligibility.categories.length > 0)
                  ? scheme.eligibility.categories.join(", ").toUpperCase()
                  : "All Categories"}
              </span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-slate-400">State / Scope:</span>
              <span className="font-semibold text-white">
                {(scheme.eligibility?.states && scheme.eligibility.states.length > 0)
                  ? scheme.eligibility.states.join(", ")
                  : 'All India'}
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* Document Readiness Checklist */}
      <Card className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-xl font-bold text-white">Document Readiness Checklist</h3>
            <p className="text-xs text-slate-400">Check off documents you currently possess to measure your application readiness.</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-xs text-slate-400">Readiness Score</span>
              <span className="block text-lg font-bold text-amber-400">{readinessPercent}%</span>
            </div>
            <div className="w-24 bg-slate-800 h-3 rounded-full overflow-hidden border border-slate-700">
              <div
                className="bg-gradient-to-r from-orange-500 to-emerald-400 h-full transition-all duration-300"
                style={{ width: `${readinessPercent}%` }}
              />
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {scheme.documentsRequired?.map((doc, idx) => {
            const isChecked = !!checkedDocs[idx];
            return (
              <div
                key={idx}
                onClick={() => toggleDoc(idx)}
                className={`p-3.5 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
                  isChecked
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-white'
                    : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                {isChecked ? (
                  <CheckSquare className="w-5 h-5 text-emerald-400 shrink-0" />
                ) : (
                  <Square className="w-5 h-5 text-slate-500 shrink-0" />
                )}
                <span className="text-sm font-medium">{doc}</span>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};

export default SchemeDetail;
