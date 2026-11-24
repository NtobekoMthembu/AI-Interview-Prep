import { useEffect, useState } from 'react';
import { api, type Resume, type ResumeAnalysis } from '../services/api';
import FileDropzone from '../components/FileDropzone';

function formatSize(bytes: number): string {
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

const EXPERIENCE_LABELS: Record<ResumeAnalysis['experience_level'], string> = {
  entry: 'Entry level',
  junior: 'Junior',
  mid: 'Mid level',
  senior: 'Senior',
};

export default function ResumePage() {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  // Track analysis state per-resume, since a user could in principle
  // have more than one uploaded — each needs its own independent state.
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);
  const [analysisErrors, setAnalysisErrors] = useState<Record<string, string>>({});
  const [analyses, setAnalyses] = useState<Record<string, ResumeAnalysis>>({});

  useEffect(() => {
    loadResumes();
  }, []);

  function loadResumes() {
    api.getResumes().then((data) => {
      setResumes(data);
      setLoading(false);
    });
  }

  async function handleFileSelected(file: File) {
    setError('');
    setUploading(true);
    try {
      await api.uploadResume(file);
      loadResumes();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed.');
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(id: string) {
    await api.deleteResume(id);
    setResumes((prev) => prev.filter((r) => r.id !== id));
  }

  async function handleAnalyze(id: string) {
    setAnalyzingId(id);
    setAnalysisErrors((prev) => ({ ...prev, [id]: '' }));
    try {
      const result = await api.analyzeResume(id);
      setAnalyses((prev) => ({ ...prev, [id]: result }));
    } catch (err) {
      setAnalysisErrors((prev) => ({
        ...prev,
        [id]: err instanceof Error ? err.message : 'Analysis failed.',
      }));
    } finally {
      setAnalyzingId(null);
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
      <div className="max-w-xl mx-auto">
        <h1 className="text-2xl text-[#10243E] mb-2" style={{ fontFamily: "'Fraunces', serif" }}>
          Your CV
        </h1>
        <p className="text-[#4C5F70] mb-8">
          Upload your CV so we can tailor interview questions to your background.
        </p>

        <FileDropzone onFileSelected={handleFileSelected} disabled={uploading} />

        {uploading && <p className="mt-4 text-sm text-[#4C5F70]">Uploading…</p>}
        {error && <p className="mt-4 text-sm text-[#D9534F]" role="alert">{error}</p>}

        {resumes.length > 0 && (
          <div className="mt-10 space-y-4">
            <h2 className="text-sm text-[#8891A6] uppercase tracking-wide">Uploaded</h2>
            {resumes.map((resume) => {
              const analysis = analyses[resume.id];
              const analysisError = analysisErrors[resume.id];
              const isAnalyzing = analyzingId === resume.id;

              return (
                <div key={resume.id} className="bg-white border border-[#E2EBE7]">
                  <div className="flex items-center justify-between px-4 py-3">
                    <div>
                      <p className="text-[#10243E] text-sm">{resume.original_filename}</p>
                      <p className="text-[#8891A6] text-xs">{formatSize(resume.file_size)}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      {!analysis && (
                        <button
                          onClick={() => handleAnalyze(resume.id)}
                          disabled={isAnalyzing}
                          className="text-sm text-[#2A6DF4] hover:underline disabled:opacity-50 disabled:no-underline"
                        >
                          {isAnalyzing ? 'Analysing…' : 'Analyse'}
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(resume.id)}
                        className="text-sm text-[#D9534F] hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  </div>

                  {analysisError && (
                    <p className="px-4 pb-4 text-sm text-[#D9534F]" role="alert">{analysisError}</p>
                  )}

                  {analysis && <AnalysisSummary analysis={analysis} />}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function AnalysisSummary({ analysis }: { analysis: ResumeAnalysis }) {
  return (
    <div className="border-t border-[#E2EBE7] px-4 py-4 space-y-4 bg-[#FAFDFC]">
      <div className="flex items-center gap-2">
        <span className="text-xs px-2 py-1 bg-[#EAF2FF] text-[#2A6DF4] font-medium">
          {EXPERIENCE_LABELS[analysis.experience_level]}
        </span>
      </div>

      <p className="text-sm text-[#4C5F70]">{analysis.experience_summary}</p>

      <TagList label="Potential roles" items={analysis.potential_job_roles} />
      <TagList label="Technical skills" items={analysis.technical_skills} />
      <TagList label="Soft skills" items={analysis.soft_skills} />
      <TagList label="Qualifications" items={analysis.qualifications} />
    </div>
  );
}

function TagList({ label, items }: { label: string; items: string[] }) {
  if (items.length === 0) return null;
  return (
    <div>
      <p className="text-xs text-[#8891A6] uppercase tracking-wide mb-1.5">{label}</p>
      <div className="flex flex-wrap gap-1.5">
        {items.map((item) => (
          <span key={item} className="text-xs px-2 py-1 bg-white border border-[#E2EBE7] text-[#10243E]">
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}