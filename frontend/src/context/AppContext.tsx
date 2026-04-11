import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as Storage from '../utils/storage';
import type { Period, DailyLog } from '../utils/storage';
import { formatDate } from '../utils/cycleUtils';

interface AppContextType {
  isLoading: boolean;
  isLocked: boolean;
  pinEnabled: boolean;
  pin: string | null;
  cycleLength: number;
  periodLength: number;
  periods: Period[];
  dailyLogs: Record<string, DailyLog>;
  selectedDate: string;
  unlock: () => void;
  setAndSavePin: (newPin: string) => Promise<void>;
  togglePinEnabled: (enabled: boolean) => Promise<void>;
  removePin: () => Promise<void>;
  updateCycleLength: (length: number) => Promise<void>;
  updatePeriodLength: (length: number) => Promise<void>;
  startPeriod: (date: string) => Promise<void>;
  endPeriod: (date: string) => Promise<void>;
  saveDailyLog: (date: string, log: DailyLog) => Promise<void>;
  setSelectedDate: (date: string) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function useApp(): AppContextType {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be inside AppProvider');
  return ctx;
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [isLocked, setIsLocked] = useState(false);
  const [pinEnabled, setPinEnabled] = useState(false);
  const [pin, setPin] = useState<string | null>(null);
  const [cycleLength, setCycleLength] = useState(28);
  const [periodLength, setPeriodLength] = useState(5);
  const [periods, setPeriods] = useState<Period[]>([]);
  const [dailyLogs, setDailyLogs] = useState<Record<string, DailyLog>>({});
  const [selectedDate, setSelectedDate] = useState(formatDate(new Date()));

  const loadData = useCallback(async () => {
    try {
      const [p, pe, cl, pl, per, dl] = await Promise.all([
        Storage.getPin(),
        Storage.isPinEnabled(),
        Storage.getCycleLength(),
        Storage.getPeriodLength(),
        Storage.getPeriods(),
        Storage.getDailyLogs(),
      ]);
      setPin(p);
      setPinEnabled(pe);
      setCycleLength(cl);
      setPeriodLength(pl);
      setPeriods(per);
      setDailyLogs(dl);
      setIsLocked(pe && !!p);
    } catch (e) {
      console.error('Load error:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const unlock = useCallback(() => setIsLocked(false), []);

  const setAndSavePin = useCallback(async (newPin: string) => {
    await Storage.setPin(newPin);
    await Storage.setPinEnabled(true);
    setPin(newPin);
    setPinEnabled(true);
  }, []);

  const togglePinEnabled = useCallback(async (enabled: boolean) => {
    await Storage.setPinEnabled(enabled);
    setPinEnabled(enabled);
    if (!enabled) setIsLocked(false);
  }, []);

  const removePinFn = useCallback(async () => {
    await Storage.removePin();
    await Storage.setPinEnabled(false);
    setPin(null);
    setPinEnabled(false);
    setIsLocked(false);
  }, []);

  const updateCycleLength = useCallback(async (length: number) => {
    await Storage.setCycleLength(length);
    setCycleLength(length);
  }, []);

  const updatePeriodLength = useCallback(async (length: number) => {
    await Storage.setPeriodLength(length);
    setPeriodLength(length);
  }, []);

  const startPeriod = useCallback(
    async (date: string) => {
      const newPeriods = [...periods, { startDate: date, endDate: null }];
      await Storage.savePeriods(newPeriods);
      setPeriods(newPeriods);
    },
    [periods]
  );

  const endPeriod = useCallback(
    async (date: string) => {
      if (periods.length === 0) return;
      const updated = [...periods];
      const last = updated[updated.length - 1];
      if (!last.endDate) {
        last.endDate = date;
        await Storage.savePeriods(updated);
        setPeriods(updated);
      }
    },
    [periods]
  );

  const saveDailyLogFn = useCallback(
    async (date: string, log: DailyLog) => {
      await Storage.saveDailyLog(date, log);
      setDailyLogs((prev) => ({ ...prev, [date]: log }));
    },
    []
  );

  return (
    <AppContext.Provider
      value={{
        isLoading,
        isLocked,
        pinEnabled,
        pin,
        cycleLength,
        periodLength,
        periods,
        dailyLogs,
        selectedDate,
        unlock,
        setAndSavePin,
        togglePinEnabled,
        removePin: removePinFn,
        updateCycleLength,
        updatePeriodLength,
        startPeriod,
        endPeriod,
        saveDailyLog: saveDailyLogFn,
        setSelectedDate,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}
