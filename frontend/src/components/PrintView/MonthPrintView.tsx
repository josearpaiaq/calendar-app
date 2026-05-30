import { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { X, Download } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import type { Event } from '../../types/event';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const GENERIC_IMAGE = 'data:image/svg+xml,' + encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none">
  <rect width="48" height="48" rx="6" fill="#EFF6FF"/>
  <circle cx="34" cy="16" r="6" fill="#3B82F6"/>
  <path d="M31 16l2 2 4-4" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`);

interface Props {
  year: number;
  month: number;
  events: Event[];
  onClose: () => void;
}

export default function MonthPrintView({ year, month, events, onClose }: Props) {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({ contentRef: printRef });

  const handleExportPDF = async () => {
    if (!printRef.current) return;
    const canvas = await html2canvas(printRef.current, { scale: 2, useCORS: true });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    const w = pdf.internal.pageSize.getWidth();
    const h = (canvas.height / canvas.width) * w;
    pdf.addImage(imgData, 'PNG', 0, 0, w, h);
    pdf.save(`calendar-${year}-${String(month + 1).padStart(2, '0')}.pdf`);
  };

  const getDaysInMonth = () => {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells: Array<{ day: number | null; date: string }> = [];

    for (let i = 0; i < firstDay; i++) cells.push({ day: null, date: '' });
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push({
        day: d,
        date: `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
      });
    }
    while (cells.length % 7 !== 0) cells.push({ day: null, date: '' });
    return cells;
  };

  const eventsByDate = events.reduce<Record<string, Event[]>>((acc, e) => {
    if (!acc[e.date]) acc[e.date] = [];
    acc[e.date].push(e);
    return acc;
  }, {});

  const cells = getDaysInMonth();

  return (
    <div className="fixed inset-0 bg-black/60 flex flex-col items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 no-print">
          <h2 className="text-lg font-semibold text-gray-800">
            Print preview — {MONTHS[month]} {year}
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportPDF}
              className="flex items-center gap-1.5 px-4 py-2 text-sm bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors"
            >
              <Download size={14} />
              Export PDF
            </button>
            <button
              onClick={() => handlePrint()}
              className="flex items-center gap-1.5 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Print
            </button>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="overflow-auto flex-1 p-6">
          <div ref={printRef} className="bg-white p-6 min-w-[800px]">
            <h1 className="text-3xl font-bold text-gray-800 text-center mb-6">
              {MONTHS[month]} {year}
            </h1>

            <div className="grid grid-cols-7 border-t border-l border-gray-200">
              {WEEKDAYS.map(d => (
                <div key={d} className="py-2 text-center text-xs font-semibold text-gray-500 uppercase border-b border-r border-gray-200 bg-gray-50">
                  {d}
                </div>
              ))}

              {cells.map((cell, i) => (
                <div
                  key={i}
                  className="min-h-28 p-2 border-b border-r border-gray-200 align-top"
                >
                  {cell.day && (
                    <>
                      <span className="text-sm font-semibold text-gray-700 block mb-1">{cell.day}</span>
                      <div className="space-y-1">
                        {(eventsByDate[cell.date] ?? []).map(event => (
                          <div
                            key={event.id}
                            className="flex items-start gap-1 rounded p-1"
                            style={{ backgroundColor: event.color + '15' }}
                          >
                            <img
                              src={event.image_path || GENERIC_IMAGE}
                              alt=""
                              className="w-8 h-8 rounded object-cover flex-shrink-0"
                              crossOrigin="anonymous"
                            />
                            <div className="min-w-0">
                              <p className="text-xs font-semibold truncate" style={{ color: event.color }}>
                                {event.title}
                              </p>
                              {!event.all_day && event.start_time && (
                                <p className="text-xs text-gray-400">{event.start_time}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
