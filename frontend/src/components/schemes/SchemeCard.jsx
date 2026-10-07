import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { ExternalLink, CheckCircle, ArrowRight, Bookmark } from 'lucide-react';

export const SchemeCard = ({ scheme, onSave, isSaved }) => {
  const schemeSlug = scheme.schemeId || scheme._id;
  const stateText = (scheme.eligibility?.states && scheme.eligibility.states.length > 0)
    ? scheme.eligibility.states.join(", ")
    : (scheme.state || 'Central');

  return (
    <Card className="flex flex-col justify-between h-full group hover:border-orange-500/40">
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <Badge variant="orange">{scheme.category}</Badge>
          <span className="text-xs text-slate-400 font-medium">{stateText}</span>
        </div>

        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-orange-400 transition-colors">
          {scheme.name || scheme.title}
        </h3>

        <p className="text-slate-300 text-sm mb-4 line-clamp-2 leading-relaxed">
          {scheme.tagline || scheme.shortDescription || scheme.description}
        </p>

        {scheme.benefits && scheme.benefits.length > 0 && (
          <div className="mb-4 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
            <span className="text-xs font-semibold text-amber-400 block mb-1">Key Benefit:</span>
            <p className="text-xs text-slate-300 flex items-start gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
              <span>{scheme.benefits[0]}</span>
            </p>
          </div>
        )}
      </div>

      <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-2">
        <Link to={`/schemes/${schemeSlug}`}>
          <Button variant="outline" className="text-xs py-2 px-3">
            View Details & Checklist
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </Link>

        {onSave && (
          <button
            onClick={() => onSave(scheme._id)}
            className={`p-2 rounded-lg border transition-all ${
              isSaved
                ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
            }`}
            title={isSaved ? 'Saved' : 'Bookmark Scheme'}
          >
            <Bookmark className="w-4 h-4" />
          </button>
        )}
      </div>
    </Card>
  );
};
