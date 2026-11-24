import { useState } from 'react';

interface Props {
  label: string;
  values: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
}

export default function TagInput({ label, values, onChange, placeholder }: Props) {
  const [draft, setDraft] = useState('');

  function addTag() {
    const trimmed = draft.trim();
    if (trimmed && !values.includes(trimmed)) {
      onChange([...values, trimmed]);
    }
    setDraft('');
  }

  function removeTag(tag: string) {
    onChange(values.filter((v) => v !== tag));
  }

  return (
    <div>
      <label className="block text-sm text-[#8891A6] mb-2">{label}</label>

      <div className="flex flex-wrap gap-2 mb-2">
        {values.map((tag) => (
          <span
            key={tag}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-[#1B2436] text-[#E8EAF0] text-sm"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="text-[#8891A6] hover:text-[#E08B79]"
              aria-label={`Remove ${tag}`}
            >
              ×
            </button>
          </span>
        ))}
      </div>

      <input
        type="text"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            addTag();
          }
        }}
        placeholder={placeholder || 'Type and press Enter'}
        className="w-full bg-transparent border-b border-[#2A3448] text-[#E8EAF0] py-2
                   focus:outline-none focus:border-[#D6A756] transition"
      />
    </div>
  );
}