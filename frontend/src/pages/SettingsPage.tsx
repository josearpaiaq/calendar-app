import { useState } from 'react';
import { ImageIcon, Pencil } from 'lucide-react';
import { useMonthSettings } from '@hooks/useMonthSettings';
import MonthImageModal from '@components/MonthImageModal/MonthImageModal';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export default function SettingsPage() {
  const { updateImage, getByMonth } = useMonthSettings();
  const [editing, setEditing] = useState<string | null>(null);

  const months = ['01','02','03','04','05','06','07','08','09','10','11','12'];

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">Settings</h2>
        <p className="text-sm text-gray-500 mt-1">Set a background image for each month of the calendar.</p>
      </div>

      <div className="grid grid-cols-3 gap-4 sm:grid-cols-4">
        {months.map((m, i) => {
          const setting = getByMonth(m);
          const imageUrl = setting?.image_path
            ? `${import.meta.env.VITE_API_URL ?? ''}${setting.image_path}`
            : null;

          return (
            <div
              key={m}
              className="relative rounded-xl overflow-hidden border border-gray-200 aspect-video bg-gray-100 cursor-pointer group"
              onClick={() => setEditing(m)}
            >
              {imageUrl ? (
                <img src={imageUrl} alt={MONTH_NAMES[i]} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ImageIcon size={20} className="text-gray-300" />
                </div>
              )}

              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Pencil size={18} className="text-white" />
              </div>

              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent px-2 py-1.5">
                <span className="text-white text-xs font-medium">{MONTH_NAMES[i]}</span>
              </div>
            </div>
          );
        })}
      </div>

      {editing && (
        <MonthImageModal
          month={editing}
          currentImagePath={getByMonth(editing)?.image_path ?? ''}
          onSave={file => updateImage(editing, file)}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}
