import type { Event } from '@src/types/event';

// Fixed positions for up to 4 bubbles inside the cell
const BUBBLE_POSITIONS = [
  { bottom: '6px', left: '4px' },
  { bottom: '6px', right: '4px' },
  { bottom: '28px', left: '16px' },
  { bottom: '28px', right: '16px' },
];

const BUBBLE_DURATIONS = ['2.2s', '2.8s', '3.1s', '2.5s'];

interface Props {
  date: string;
  events: Event[];
  isCurrentMonth: boolean;
  isToday: boolean;
  hasMonthImage: boolean;
  onDayClick: (date: string) => void;
  onEventClick: (event: Event) => void;
}

export default function CalendarDay({ date, events, isCurrentMonth, isToday, hasMonthImage, onDayClick, onEventClick }: Props) {
  const dayNumber = parseInt(date.split('-')[2], 10);
  const visible = events.slice(0, 4);
  const overflow = events.length - 4;

  const cellBg = hasMonthImage
    ? isCurrentMonth ? 'bg-white/10 hover:bg-white/20' : 'bg-black/10'
    : isCurrentMonth ? 'hover:bg-gray-50' : 'bg-gray-50/50';

  const dayNumStyle = isToday
    ? 'bg-blue-600 text-white'
    : hasMonthImage
      ? isCurrentMonth ? 'text-white' : 'text-white/40'
      : isCurrentMonth ? 'text-gray-700' : 'text-gray-300';

  return (
    <div
      className={`min-h-24 p-1.5 border-b border-r cursor-pointer transition-colors relative ${cellBg} ${hasMonthImage ? 'border-white/10' : 'border-gray-100'}`}
      onClick={() => onDayClick(date)}
    >
      <span className={`text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full transition-colors ${dayNumStyle}`}>
        {dayNumber}
      </span>

      {/* Bubbles */}
      {visible.map((event, i) => {
        const pos = BUBBLE_POSITIONS[i];
        const bgStyle = event.image_path
          ? { backgroundImage: `url(${import.meta.env.VITE_API_URL ?? ''}${event.image_path})`, backgroundSize: 'cover', backgroundPosition: 'center' }
          : { backgroundColor: event.color };

        return (
          <button
            key={event.id}
            title={`${event.title}${!event.all_day && event.start_time ? ` · ${event.start_time}` : ''}`}
            onClick={e => { e.stopPropagation(); onEventClick(event); }}
            className="absolute w-6 h-6 rounded-full border-2 border-white/80 shadow-sm hover:scale-110 transition-transform"
            style={{
              ...pos,
              ...bgStyle,
              animation: `bubble-float ${BUBBLE_DURATIONS[i]} ease-in-out infinite`,
            }}
          />
        );
      })}

      {/* Overflow count bubble */}
      {overflow > 0 && (
        <button
          onClick={e => { e.stopPropagation(); onDayClick(date); }}
          className="absolute w-6 h-6 rounded-full bg-gray-400/80 border-2 border-white/80 shadow-sm text-white flex items-center justify-center hover:scale-110 transition-transform"
          style={{ bottom: '6px', right: '4px', fontSize: '9px', fontWeight: 700 }}
          title={`${overflow} more events`}
        >
          +{overflow}
        </button>
      )}
    </div>
  );
}
