import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Printer, Plus } from 'lucide-react';
import type { Event } from '../../types/event';
import CalendarDay from './CalendarDay';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

interface Props {
  events: Event[];
  onDayClick: (date: string) => void;
  onEventClick: (event: Event) => void;
  onPrint: () => void;
  onMonthChange?: (year: number, month: number) => void;
}

export default function CalendarGrid({ events, onDayClick, onEventClick, onPrint, onMonthChange }: Props) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  const days = useMemo(() => {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const cells: Array<{ date: string; current: boolean }> = [];

    for (let i = firstDay - 1; i >= 0; i--) {
      const d = daysInPrevMonth - i;
      const m = month === 0 ? 12 : month;
      const y = month === 0 ? year - 1 : year;
      cells.push({ date: `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`, current: false });
    }

    for (let d = 1; d <= daysInMonth; d++) {
      cells.push({
        date: `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
        current: true,
      });
    }

    const remaining = 42 - cells.length;
    for (let d = 1; d <= remaining; d++) {
      const m = month === 11 ? 1 : month + 2;
      const y = month === 11 ? year + 1 : year;
      cells.push({ date: `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`, current: false });
    }

    return cells;
  }, [year, month]);

  const eventsByDate = useMemo(() => {
    const map: Record<string, Event[]> = {};
    for (const event of events) {
      if (!map[event.date]) map[event.date] = [];
      map[event.date].push(event);
    }
    return map;
  }, [events]);

  const prev = () => {
    if (month === 0) {
      setMonth(11); setYear(y => { onMonthChange?.(y - 1, 11); return y - 1; });
    } else {
      setMonth(m => { onMonthChange?.(year, m - 1); return m - 1; });
    }
  };

  const next = () => {
    if (month === 11) {
      setMonth(0); setYear(y => { onMonthChange?.(y + 1, 0); return y + 1; });
    } else {
      setMonth(m => { onMonthChange?.(year, m + 1); return m + 1; });
    }
  };

  const isToday = (date: string) => {
    return date === `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <div className="flex items-center gap-4">
          <button onClick={prev} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <ChevronLeft size={18} />
          </button>
          <h2 className="text-xl font-semibold text-gray-800 min-w-44 text-center">
            {MONTHS[month]} {year}
          </h2>
          <button onClick={next} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <ChevronRight size={18} />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => { setYear(today.getFullYear()); setMonth(today.getMonth()); }}
            className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Today
          </button>
          <button
            onClick={onPrint}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Printer size={14} />
            Print
          </button>
          <button
            onClick={() => {
              const isCurrentMonth = year === today.getFullYear() && month === today.getMonth();
              const day = isCurrentMonth ? today.getDate() : 1;
              onDayClick(`${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <Plus size={14} />
            New Event
          </button>
        </div>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 border-b border-gray-100">
        {WEEKDAYS.map(day => (
          <div key={day} className="py-2 text-center text-xs font-medium text-gray-400 uppercase tracking-wide">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7">
        {days.map((cell, i) => (
          <CalendarDay
            key={i}
            date={cell.date}
            events={eventsByDate[cell.date] ?? []}
            isCurrentMonth={cell.current}
            isToday={isToday(cell.date)}
            onDayClick={onDayClick}
            onEventClick={onEventClick}
          />
        ))}
      </div>
    </div>
  );
}
