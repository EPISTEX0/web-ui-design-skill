const dayFormat = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' });
const weekdayFormat = new Intl.DateTimeFormat('en-GB', { weekday: 'short' });

export const WEEK_ONE_START = new Date(2026, 9, 19);

export function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

export function formatDay(date: Date): string {
  return dayFormat.format(date);
}

export function formatWeekday(date: Date): string {
  return weekdayFormat.format(date);
}

export function formatWeekRange(start: Date): string {
  return `${formatDay(start)} to ${formatDay(addDays(start, 6))}`;
}

export function shiftHours(start: string, end: string): number {
  const toMinutes = (value: string) => {
    const [hours, minutes] = value.split(':').map(Number);
    return hours * 60 + minutes;
  };
  const startMinutes = toMinutes(start);
  let endMinutes = toMinutes(end);
  if (endMinutes <= startMinutes) endMinutes += 24 * 60;
  return (endMinutes - startMinutes) / 60;
}

export function parseIsoDate(value: string): Date {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function formatDateRange(start: string, end: string): string {
  const from = parseIsoDate(start);
  const to = parseIsoDate(end);
  const withYear = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  if (start === end) return withYear.format(from);
  return `${formatDay(from)} to ${withYear.format(to)}`;
}

export function countDays(start: string, end: string): number {
  return Math.round((parseIsoDate(end).getTime() - parseIsoDate(start).getTime()) / 86_400_000) + 1;
}
