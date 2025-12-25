import { FileText } from 'lucide-react';
import { useRef, useState } from 'react';

interface KeyEditorProps {
  value: string;
  onChange: (val: string) => void;
}

export const KeyEditor = ({ value, onChange }: KeyEditorProps) => {
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        onChange(e.target.result as string);
      }
    };
    reader.readAsText(file);
  };

  const onDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave" || e.type === "drop") setDragActive(false);
  };

  const onDrop = (e: React.DragEvent) => {
    onDrag(e);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <label className="text-[10px] text-gray-400 uppercase font-bold">Private Key Contents</label>
        <textarea
          placeholder="-----BEGIN OPENSSH PRIVATE KEY-----"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className="w-full h-24 bg-[#1e1f24] border border-gray-700 text-gray-200 text-xs font-mono rounded-lg px-3 py-2 resize-none focus:outline-none focus:border-emerald-500"
        />
      </div>

      <div
        onDragEnter={onDrag} onDragOver={onDrag} onDragLeave={onDrag} onDrop={onDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border border-dashed rounded-lg p-2 flex items-center justify-center cursor-pointer transition-colors ${dragActive ? 'border-emerald-500 bg-[#2b2d33]' : 'border-gray-600 hover:border-gray-500'}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={(e) => e.target.files && handleFiles(e.target.files[0])}
        />
        <span className="text-xs text-gray-400 flex items-center gap-2">
          <FileText size={14} /> {value ? "File loaded (Click to replace)" : "Import File"}
        </span>
      </div>
    </div>
  );
};
