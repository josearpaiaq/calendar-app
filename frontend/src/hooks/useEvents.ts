import { useState, useEffect, useCallback } from 'react';
import { fetchEvents, createEvent, updateEvent, deleteEvent } from '../api/events';
import type { Event, CreateEventPayload } from '../types/event';

export function useEvents(month: string) {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchEvents(month);
      setEvents(data);
    } catch {
      setError('Failed to load events');
    } finally {
      setLoading(false);
    }
  }, [month]);

  useEffect(() => {
    load();
  }, [load]);

  const addEvent = async (payload: CreateEventPayload) => {
    const event = await createEvent(payload);
    setEvents(prev => [...prev, event]);
    return event;
  };

  const editEvent = async (id: string, payload: Partial<CreateEventPayload>) => {
    const event = await updateEvent(id, payload);
    setEvents(prev => prev.map(e => (e.id === id ? event : e)));
    return event;
  };

  const removeEvent = async (id: string) => {
    await deleteEvent(id);
    setEvents(prev => prev.filter(e => e.id !== id));
  };

  return { events, loading, error, addEvent, editEvent, removeEvent, reload: load };
}
