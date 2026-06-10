import { useState } from 'react';
import CalendarGrid from '@components/Calendar/CalendarGrid';
import EventModal from '@components/EventModal/EventModal';
import MonthPrintView from '@components/PrintView/MonthPrintView';
import { useEvents } from '@hooks/useEvents';
import { useMonthSettings } from '@hooks/useMonthSettings';
import type { Event } from '@src/types/event';

export default function App() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [modalDate, setModalDate] = useState<string | null>(null);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [showPrint, setShowPrint] = useState(false);

  const monthStr = `${year}-${String(month + 1).padStart(2, '0')}`;
  const { events, loading, error, addEvent, editEvent, removeEvent } = useEvents(monthStr);
  const { settings, updateImage } = useMonthSettings();

  // Keep year/month in sync when CalendarGrid navigates
  // CalendarGrid manages its own internal navigation state; we mirror it for PrintView
  // by passing onMonthChange callback
  const handleMonthChange = (y: number, m: number) => {
    setYear(y);
    setMonth(m);
  };

  const handleDayClick = (date: string) => {
    setEditingEvent(null);
    setModalDate(date);
  };

  const handleEventClick = (event: Event) => {
    setEditingEvent(event);
    setModalDate(null);
  };

  const handleSave = async (payload: Parameters<typeof addEvent>[0]) => {
    if (editingEvent) {
      await editEvent(editingEvent.id, payload);
    } else {
      await addEvent(payload);
    }
  };

  const handleDelete = async () => {
    if (editingEvent) await removeEvent(editingEvent.id);
  };

  const showModal = modalDate !== null || editingEvent !== null;

  return (
    <>
      {error && (
        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error} — make sure the backend is running.
        </div>
      )}
      {loading && (
        <div className="mb-4 px-4 py-2 bg-blue-50 border border-blue-100 rounded-lg text-sm text-blue-600">
          Loading events...
        </div>
      )}

      <CalendarGrid
        events={events}
        monthSettings={settings}
        onDayClick={handleDayClick}
        onEventClick={handleEventClick}
        onPrint={() => setShowPrint(true)}
        onMonthChange={handleMonthChange}
        onUpdateMonthImage={updateImage}
      />

      {showModal && (
        <EventModal
          date={modalDate ?? undefined}
          event={editingEvent ?? undefined}
          onClose={() => { setModalDate(null); setEditingEvent(null); }}
          onSave={handleSave}
          onDelete={editingEvent ? handleDelete : undefined}
        />
      )}

      {showPrint && (
        <MonthPrintView
          year={year}
          month={month}
          events={events}
          onClose={() => setShowPrint(false)}
        />
      )}
    </>
  );
}
