import { Period } from './storage';

export function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function parseDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function daysBetween(d1: Date, d2: Date): number {
  const ms = d2.getTime() - d1.getTime();
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}

export function isBetweenDates(dateStr: string, start: Date, end: Date): boolean {
  const d = parseDate(dateStr);
  const s = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  const e = new Date(end.getFullYear(), end.getMonth(), end.getDate());
  return d >= s && d <= e;
}

export function getAverageCycleLength(periods: Period[]): number {
  if (periods.length < 2) return 28;
  let total = 0;
  let count = 0;
  for (let i = 1; i < periods.length; i++) {
    const prev = parseDate(periods[i - 1].startDate);
    const curr = parseDate(periods[i].startDate);
    total += daysBetween(prev, curr);
    count++;
  }
  return Math.round(total / count);
}

export function getCurrentCycleDay(lastPeriodStart: string): number {
  const today = new Date();
  const start = parseDate(lastPeriodStart);
  return daysBetween(start, today) + 1;
}

export function getCurrentPhase(
  cycleDay: number,
  periodLength: number,
  cycleLength: number
): string {
  if (cycleDay <= periodLength) return 'Period';
  const ovulationDay = cycleLength - 14;
  if (cycleDay >= ovulationDay - 2 && cycleDay <= ovulationDay + 1) return 'Ovulation';
  if (cycleDay > cycleLength - 7) return 'PMS';
  return 'Follicular';
}

export function getNextPeriodDate(lastPeriodStart: string, cycleLength: number): Date {
  const start = parseDate(lastPeriodStart);
  return addDays(start, cycleLength);
}

export function getOvulationDate(lastPeriodStart: string, cycleLength: number): Date {
  const start = parseDate(lastPeriodStart);
  return addDays(start, cycleLength - 14);
}

export function getFertileWindow(
  lastPeriodStart: string,
  cycleLength: number
): { start: Date; end: Date } {
  const ov = getOvulationDate(lastPeriodStart, cycleLength);
  return { start: addDays(ov, -5), end: addDays(ov, 1) };
}

export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

export function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

export type DayType = 'period' | 'predicted' | 'ovulation' | 'fertile' | 'normal';

export function getDayType(
  dateStr: string,
  periods: Period[],
  cycleLength: number,
  periodLength: number
): DayType {
  // Check logged periods
  for (const p of periods) {
    const start = parseDate(p.startDate);
    const end = p.endDate
      ? parseDate(p.endDate)
      : addDays(start, periodLength - 1);
    if (isBetweenDates(dateStr, start, end)) return 'period';
  }

  if (periods.length === 0) return 'normal';

  const lastStart = parseDate(periods[periods.length - 1].startDate);

  // Current cycle ovulation & fertile
  const curOv = addDays(lastStart, cycleLength - 14);
  if (formatDate(parseDate(dateStr)) === formatDate(curOv)) return 'ovulation';
  const curFertileStart = addDays(curOv, -5);
  const curFertileEnd = addDays(curOv, 1);
  if (isBetweenDates(dateStr, curFertileStart, curFertileEnd)) return 'fertile';

  // Project next 3 cycles
  for (let i = 1; i <= 3; i++) {
    const predictedStart = addDays(lastStart, cycleLength * i);
    const predictedEnd = addDays(predictedStart, periodLength - 1);
    if (isBetweenDates(dateStr, predictedStart, predictedEnd)) return 'predicted';

    const ovDate = addDays(predictedStart, -14);
    if (formatDate(parseDate(dateStr)) === formatDate(ovDate)) return 'ovulation';

    const fertileStart = addDays(ovDate, -5);
    const fertileEnd = addDays(ovDate, 1);
    if (isBetweenDates(dateStr, fertileStart, fertileEnd)) return 'fertile';
  }

  return 'normal';
}
