import { useRef, useState } from 'react';
import { X, Upload, Trash2 } from 'lucide-react';

const MONTH_NAMES = [
  '', 'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

interface Props {
  month: string;
  currentImagePath: string;
  onSave: (file: File) => Promise<unknown>;
  onClose: () => void;
}

export default function MonthImageModal({ month, currentImagePath, onSave, onClose }: Props) {
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const monthName = MONTH_NAMES[parseInt(month, 10)];
  const existingImage = currentImagePath
    ? `${import.meta.env.VITE_API_URL ?? ''}${currentImagePath}`
    : null;

  const handleFile = (f: File) => {
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f?.type.startsWith('image/')) handleFile(f);
  };

  const handleSubmit = async () => {
    if (!file) return;
    setSaving(true);
    try {
      await onSave(file);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">{monthName} — background image</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* current image */}
          {existingImage && !preview && (
            <div className="relative rounded-xl overflow-hidden h-36">
              <img src={existingImage} alt="Current" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/20 flex items-end p-3">
                <span className="text-white text-xs font-medium">Current image</span>
              </div>
            </div>
          )}

          {/* new image preview */}
          {preview && (
            <div className="relative rounded-xl overflow-hidden h-36">
              <img src={preview} alt="Preview" className="w-full h-full object-cover" />
              <button
                onClick={() => { setPreview(null); setFile(null); }}
                className="absolute top-2 right-2 p-1.5 bg-black/50 rounded-lg text-white hover:bg-black/70 transition-colors"
              >
                <Trash2 size={14} />
              </button>
            </div>
          )}

          {/* drop zone */}
          {!preview && (
            <div
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                dragging ? 'border-blue-400 bg-blue-50' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
              onClick={() => inputRef.current?.click()}
              onDragOver={e => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
            >
              <Upload size={24} className="mx-auto mb-2 text-gray-400" />
              <p className="text-sm text-gray-500">Drag an image here or <span className="text-blue-600 font-medium">browse</span></p>
              <p className="text-xs text-gray-400 mt-1">PNG, JPG, WEBP</p>
            </div>
          )}

          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
          />
        </div>

        <div className="flex justify-end gap-2 px-6 py-4 border-t border-gray-100">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!file || saving}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {saving ? 'Saving…' : 'Save image'}
          </button>
        </div>
      </div>
    </div>
  );
}
