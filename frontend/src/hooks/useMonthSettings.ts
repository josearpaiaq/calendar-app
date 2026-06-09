import { useState, useEffect } from 'react';
import { getMonthSettings, updateMonthImage } from '../api/settings';
import type { MonthSetting } from '../api/settings';

export function useMonthSettings() {
  const [settings, setSettings] = useState<MonthSetting[]>([]);

  useEffect(() => {
    getMonthSettings()
      .then(setSettings)
      .catch(() => {});
  }, []);

  const updateImage = async (month: string, image: File) => {
    const updated = await updateMonthImage(month, image);
    setSettings(prev => prev.map(s => (s.month === month ? updated : s)));
    return updated;
  };

  const getByMonth = (month: string): MonthSetting | undefined =>
    settings.find(s => s.month === month);

  return { settings, updateImage, getByMonth };
}
