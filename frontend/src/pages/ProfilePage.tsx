import { useEffect, useState } from 'react';
import { api, type Profile } from '../services/api';
import TagInput from '../components/TagInput';

const EMPTY_PROFILE: Profile = {
  highest_qualification: '',
  institution: '',
  field_of_study: '',
  graduation_year: null,
  years_of_experience: 0,
  employment_status: 'student',
  career_interests: [],
  technical_skills: [],
  soft_skills: [],
  languages: [],
};

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile>(EMPTY_PROFILE);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState('');

  useEffect(() => {
    api.getProfile().then((data) => {
      setProfile(data);
      setLoading(false);
    });
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSavedMessage('');

    try {
      const updated = await api.updateProfile(profile);
      setProfile(updated);
      setSavedMessage('Saved.');
    } finally {
      setSaving(false);
    }
  }

  function field<K extends keyof Profile>(key: K, value: Profile[K]) {
    setProfile((prev) => ({ ...prev, [key]: value }));
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#101826] flex items-center justify-center text-[#8891A6]">
        Loading profile…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#101826] text-[#E8EAF0] px-6 py-12 md:px-16">
      <form onSubmit={handleSave} className="max-w-xl mx-auto space-y-8">
        <h1 className="text-2xl" style={{ fontFamily: "'Fraunces', serif" }}>Your profile</h1>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm text-[#8891A6] mb-1">Highest qualification</label>
            <input
              value={profile.highest_qualification}
              onChange={(e) => field('highest_qualification', e.target.value)}
              className="w-full bg-transparent border-b border-[#2A3448] py-2 focus:outline-none focus:border-[#D6A756]"
            />
          </div>
          <div>
            <label className="block text-sm text-[#8891A6] mb-1">Field of study</label>
            <input
              value={profile.field_of_study}
              onChange={(e) => field('field_of_study', e.target.value)}
              className="w-full bg-transparent border-b border-[#2A3448] py-2 focus:outline-none focus:border-[#D6A756]"
            />
          </div>
          <div>
            <label className="block text-sm text-[#8891A6] mb-1">Institution</label>
            <input
              value={profile.institution}
              onChange={(e) => field('institution', e.target.value)}
              className="w-full bg-transparent border-b border-[#2A3448] py-2 focus:outline-none focus:border-[#D6A756]"
            />
          </div>
          <div>
            <label className="block text-sm text-[#8891A6] mb-1">Graduation year</label>
            <input
              type="number"
              value={profile.graduation_year ?? ''}
              onChange={(e) => field('graduation_year', e.target.value ? Number(e.target.value) : null)}
              className="w-full bg-transparent border-b border-[#2A3448] py-2 focus:outline-none focus:border-[#D6A756]"
            />
          </div>
          <div>
            <label className="block text-sm text-[#8891A6] mb-1">Years of experience</label>
            <input
              type="number"
              min={0}
              value={profile.years_of_experience}
              onChange={(e) => field('years_of_experience', Number(e.target.value))}
              className="w-full bg-transparent border-b border-[#2A3448] py-2 focus:outline-none focus:border-[#D6A756]"
            />
          </div>
          <div>
            <label className="block text-sm text-[#8891A6] mb-1">Employment status</label>
            <select
              value={profile.employment_status}
              onChange={(e) => field('employment_status', e.target.value as Profile['employment_status'])}
              className="w-full bg-[#101826] border-b border-[#2A3448] py-2 focus:outline-none focus:border-[#D6A756]"
            >
              <option value="student">Student</option>
              <option value="unemployed">Unemployed</option>
              <option value="employed">Employed</option>
              <option value="interning">Interning</option>
            </select>
          </div>
        </div>

        <TagInput
          label="Technical skills"
          values={profile.technical_skills}
          onChange={(v) => field('technical_skills', v)}
          placeholder="e.g. Python — press Enter"
        />
        <TagInput
          label="Soft skills"
          values={profile.soft_skills}
          onChange={(v) => field('soft_skills', v)}
          placeholder="e.g. Communication — press Enter"
        />
        <TagInput
          label="Career interests"
          values={profile.career_interests}
          onChange={(v) => field('career_interests', v)}
          placeholder="e.g. Backend development — press Enter"
        />
        <TagInput
          label="Languages"
          values={profile.languages}
          onChange={(v) => field('languages', v)}
          placeholder="e.g. Zulu — press Enter"
        />

        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2.5 bg-[#D6A756] text-[#101826] font-medium hover:bg-[#E0B76C] transition disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save profile'}
          </button>
          {savedMessage && <span className="text-sm text-[#8891A6]">{savedMessage}</span>}
        </div>
      </form>
    </div>
  );
}