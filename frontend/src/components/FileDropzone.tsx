import { useRef, useState } from 'react';

interface Props {
  onFileSelected: (file: File) => void;
  disabled?: boolean;
}

export default function FileDropzone({ onFileSelected, disabled }: Props) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;
    const file = e.dataTransfer.files?.[0];
    if (file) onFileSelected(file);
  }

  function handleBrowse(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) onFileSelected(file);
    e.target.value = ''; // allows re-selecting the same file twice in a row
  }

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      onClick={() => !disabled && inputRef.current?.click()}
      className={`border-2 border-dashed rounded-lg px-8 py-12 text-center cursor-pointer transition
        ${isDragging ? 'border-[#2A6DF4] bg-[#EAF2FF]' : 'border-[#C9DAD3] hover:border-[#9AAAB8]'}
        ${disabled ? 'opacity-50 pointer-events-none' : ''}`}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.docx"
        onChange={handleBrowse}
        className="hidden"
      />
      <p className="text-[#10243E] font-medium">
        {isDragging ? 'Drop it here' : 'Drag your CV here, or click to choose a file'}
      </p>
      <p className="mt-1 text-sm text-[#8891A6]">PDF or DOCX, up to 5MB</p>
    </div>
  );
}