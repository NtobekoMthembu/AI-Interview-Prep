import { useEffect, useState } from 'react';
import { api, type JobRecommendation } from '../services/api';

export default function CareerRecommendationsPage() {
  const [recommendations, setRecommendations] = useState<JobRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getCareerRecommendations().then((data) => {
      setRecommendations(data);
      setLoading(false);
    });
  }, []);

  async function handleGenerate() {
    setError('');
    setGenerating(true);
    try {
      const data = await api.generateCareerRecommendations();
      setRecommendations(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not generate recommendations.');
    } finally {
      setGenerating(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7FBFA] flex items-center justify-center text-[#8891A6]">
        Loading…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7FBFA] px-6 py-12 md:px-16">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl text-[#10243E] mb-2" style={{ fontFamily: "'Fraunces', serif" }}>
          Career matches
        </h1>
        <p className="text-[#4C5F70] mb-8">
          Roles worth applying for, based on your CV and profile.
        </p>

        {recommendations.length === 0 && (
          <div className="bg-white border border-[#E2EBE7] px-6 py-8 text-center">
            <p className="text-[#4C5F70] mb-4">
              No career matches yet. Generate them from your most recently analysed CV.
            </p>
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="px-5 py-2.5 bg-[#2A6DF4] text-white font-medium hover:bg-[#1F58D1] transition disabled:opacity-50"
            >
              {generating ? 'Finding your matches…' : 'Find my matches'}
            </button>
            {error && (
              <p className="mt-4 text-sm text-[#D9534F]" role="alert">
                {error}{' '}
                {error.includes('Upload and analyse') && (
                  <a href="/cv" className="underline">Go to CV upload →</a>
                )}
              </p>
            )}
          </div>
        )}

        {recommendations.length > 0 && (
          <div className="space-y-4">
            {recommendations.map((rec) => (
              <RecommendationCard key={rec.id} rec={rec} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function RecommendationCard({ rec }: { rec: JobRecommendation }) {
  return (
    <div className="bg-white border border-[#E2EBE7] p-5">
      <div className="flex items-start justify-between gap-4">
        <h3 className="text-lg text-[#10243E] font-medium">{rec.job_title}</h3>
        <MatchBadge percentage={rec.match_percentage} />
      </div>

      <p className="mt-2 text-sm text-[#4C5F70]">{rec.why_you_match}</p>

      {rec.relevant_skills.length > 0 && (
        <div className="mt-4">
          <p className="text-xs text-[#8891A6] uppercase tracking-wide mb-1.5">You already have</p>
          <div className="flex flex-wrap gap-1.5">
            {rec.relevant_skills.map((s) => (
              <span key={s} className="text-xs px-2 py-1 bg-[#EAF7F2] text-[#10243E]">{s}</span>
            ))}
          </div>
        </div>
      )}

      {rec.missing_skills.length > 0 && (
        <div className="mt-3">
          <p className="text-xs text-[#8891A6] uppercase tracking-wide mb-1.5">Worth building up</p>
          <div className="flex flex-wrap gap-1.5">
            {rec.missing_skills.map((s) => (
              <span key={s} className="text-xs px-2 py-1 bg-[#FFF6EA] text-[#10243E]">{s}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// A plain number is easy to misread at a glance — color banding gives an
// instant sense of "strong / decent / stretch" fit without reading digits.
function MatchBadge({ percentage }: { percentage: number }) {
  const color =
    percentage >= 75 ? 'bg-[#EAF7F2] text-[#1E8A63]' :
    percentage >= 50 ? 'bg-[#FFF6EA] text-[#B37B1E]' :
    'bg-[#FCEEEC] text-[#B34534]';

  return (
    <span className={`shrink-0 text-sm font-medium px-2.5 py-1 ${color}`}>
      {percentage}% match
    </span>
  );
}