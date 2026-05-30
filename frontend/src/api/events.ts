import axios from 'axios';
import type { Event, CreateEventPayload } from '../types/event';

const BASE = `${import.meta.env.VITE_API_URL ?? ''}/api`;

export const fetchEvents = async (month?: string): Promise<Event[]> => {
  const params = month ? { month } : {};
  const { data } = await axios.get<Event[]>(`${BASE}/events`, { params });
  return data;
};

export const fetchEvent = async (id: string): Promise<Event> => {
  const { data } = await axios.get<Event>(`${BASE}/events/${id}`);
  return data;
};

export const createEvent = async (payload: CreateEventPayload): Promise<Event> => {
  const form = new FormData();
  form.append('title', payload.title);
  if (payload.description) form.append('description', payload.description);
  form.append('date', payload.date);
  if (payload.start_time) form.append('start_time', payload.start_time);
  if (payload.end_time) form.append('end_time', payload.end_time);
  form.append('color', payload.color || '#3B82F6');
  form.append('all_day', String(payload.all_day ?? true));
  if (payload.image) form.append('image', payload.image);

  const { data } = await axios.post<Event>(`${BASE}/events`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};

export const updateEvent = async (id: string, payload: Partial<CreateEventPayload>): Promise<Event> => {
  const form = new FormData();
  if (payload.title) form.append('title', payload.title);
  if (payload.description !== undefined) form.append('description', payload.description);
  if (payload.date) form.append('date', payload.date);
  if (payload.start_time !== undefined) form.append('start_time', payload.start_time || '');
  if (payload.end_time !== undefined) form.append('end_time', payload.end_time || '');
  if (payload.color) form.append('color', payload.color);
  if (payload.all_day !== undefined) form.append('all_day', String(payload.all_day));
  if (payload.image) form.append('image', payload.image);

  const { data } = await axios.put<Event>(`${BASE}/events/${id}`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};

export const deleteEvent = async (id: string): Promise<void> => {
  await axios.delete(`${BASE}/events/${id}`);
};
