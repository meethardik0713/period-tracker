import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  PIN: '@luna_pin',
  PIN_ENABLED: '@luna_pin_enabled',
  CYCLE_LENGTH: '@luna_cycle_length',
  PERIOD_LENGTH: '@luna_period_length',
  PERIODS: '@luna_periods',
  DAILY_LOGS: '@luna_daily_logs',
};

export interface Period {
  startDate: string;
  endDate: string | null;
}

export interface DailyLog {
  moods: string[];
  symptoms: string[];
  notes: string;
}

export async function getPin(): Promise<string | null> {
  return AsyncStorage.getItem(KEYS.PIN);
}

export async function setPin(pin: string): Promise<void> {
  await AsyncStorage.setItem(KEYS.PIN, pin);
}

export async function removePin(): Promise<void> {
  await AsyncStorage.removeItem(KEYS.PIN);
}

export async function isPinEnabled(): Promise<boolean> {
  const val = await AsyncStorage.getItem(KEYS.PIN_ENABLED);
  return val === 'true';
}

export async function setPinEnabled(enabled: boolean): Promise<void> {
  await AsyncStorage.setItem(KEYS.PIN_ENABLED, enabled ? 'true' : 'false');
}

export async function getCycleLength(): Promise<number> {
  const val = await AsyncStorage.getItem(KEYS.CYCLE_LENGTH);
  return val ? parseInt(val, 10) : 28;
}

export async function setCycleLength(length: number): Promise<void> {
  await AsyncStorage.setItem(KEYS.CYCLE_LENGTH, length.toString());
}

export async function getPeriodLength(): Promise<number> {
  const val = await AsyncStorage.getItem(KEYS.PERIOD_LENGTH);
  return val ? parseInt(val, 10) : 5;
}

export async function setPeriodLength(length: number): Promise<void> {
  await AsyncStorage.setItem(KEYS.PERIOD_LENGTH, length.toString());
}

export async function getPeriods(): Promise<Period[]> {
  const val = await AsyncStorage.getItem(KEYS.PERIODS);
  return val ? JSON.parse(val) : [];
}

export async function savePeriods(periods: Period[]): Promise<void> {
  await AsyncStorage.setItem(KEYS.PERIODS, JSON.stringify(periods));
}

export async function getDailyLogs(): Promise<Record<string, DailyLog>> {
  const val = await AsyncStorage.getItem(KEYS.DAILY_LOGS);
  return val ? JSON.parse(val) : {};
}

export async function saveDailyLog(date: string, log: DailyLog): Promise<void> {
  const logs = await getDailyLogs();
  logs[date] = log;
  await AsyncStorage.setItem(KEYS.DAILY_LOGS, JSON.stringify(logs));
}
