import api from './api';

export interface MonthSetting {
  month: string;
  image_path: string;
  updated_at?: string;
}

export const getMonthSettings = async (): Promise<MonthSetting[]> => {
  const { data } = await api.get<MonthSetting[]>('/settings/months');
  return data;
};

export const updateMonthImage = async (month: string, image: File): Promise<MonthSetting> => {
  const form = new FormData();
  console.log({
    month,
    image,
  })
  form.append('image', image);
  const { data } = await api.put<MonthSetting>(`/settings/months/${month}`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};
