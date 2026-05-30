import type { Event } from '../../types/event';

const GENERIC_IMAGE = 'data:image/svg+xml,' + encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none">
  <rect width="48" height="48" rx="6" fill="#EFF6FF"/>
  <path d="M16 20h16M16 24h10M16 28h8" stroke="#93C5FD" stroke-width="2" stroke-linecap="round"/>
  <circle cx="34" cy="16" r="6" fill="#3B82F6"/>
  <path d="M31 16l2 2 4-4" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`);

interface Props {
  date: string;
  events: Event[];
  isCurrentMonth: boolean;
  isToday: boolean;
  onDayClick: (date: string) => void;
  onEventClick: (event: Event) => void;
}

export default function CalendarDay({ date, events, isCurrentMonth, isToday, onDayClick, onEventClick }: Props) {
  const dayNumber = parseInt(date.split('-')[2], 10);

  return (
    <div
      className={`
        min-h-24 p-1.5 border-b border-r border-gray-100 cursor-pointer
        transition-colors hover:bg-gray-50 group
        ${!isCurrentMonth ? 'bg-gray-50/50' : ''}
      `}
      onClick={() => onDayClick(date)}
    >
      <div className="flex items-center justify-between mb-1">
        <span className={`
          text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full transition-colors
          ${isToday ? 'bg-blue-600 text-white' : isCurrentMonth ? 'text-gray-700' : 'text-gray-300'}
        `}>
          {dayNumber}
        </span>
      </div>

      <div className="space-y-0.5 overflow-hidden">
        {events.slice(0, 3).map(event => (
          <button
            key={event.id}
            onClick={e => { e.stopPropagation(); onEventClick(event); }}
            className="w-full text-left flex items-center gap-1 rounded-md px-1 py-0.5 hover:brightness-95 transition-all"
            style={{ backgroundColor: event.color + '22' }}
          >
            <img
              src={event.image_path || GENERIC_IMAGE}
              alt=""
              className="w-4 h-4 rounded object-cover flex-shrink-0"
            />
            <span
              className="text-xs truncate font-medium"
              style={{ color: event.color }}
            >
              {!event.all_day && event.start_time && (
                <span className="mr-1 opacity-70">{event.start_time}</span>
              )}
              {event.title}
            </span>
          </button>
        ))}
        {events.length > 3 && (
          <span className="text-xs text-gray-400 pl-1">+{events.length - 3} more</span>
        )}
      </div>
    </div>
  );
}
