export interface Event {
  id: string;
  title: string;
  description: string;
  date: string; // YYYY-MM-DD
  start_time: string; // HH:MM or empty
  end_time: string; // HH:MM or empty
  color: string;
  image_path: string;
  all_day: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateEventPayload {
  title: string;
  description?: string;
  date: string;
  start_time?: string;
  end_time?: string;
  color?: string;
  all_day?: boolean;
  image?: File;
}
