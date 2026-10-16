import { useSyncExternalStore } from 'react';

export type LogEntry = { id: number; time: string; message: string };

const MAX_ENTRIES = 100;

let entries: LogEntry[] = [];
let nextId = 0;
const listeners = new Set<() => void>();

function emit(): void {
  for (const listener of listeners) listener();
}

function formatTime(date: Date): string {
  return [date.getHours(), date.getMinutes(), date.getSeconds()]
    .map((part) => String(part).padStart(2, '0'))
    .join(':');
}

/** Write to the on-screen log view and the console. Kept in memory only, so each launch starts empty. */
export function log(message: string): void {
  console.log(`[OneSignal] ${message}`);
  entries = [...entries, { id: nextId++, time: formatTime(new Date()), message }].slice(
    -MAX_ENTRIES,
  );
  emit();
}

export function clearLogs(): void {
  entries = [];
  emit();
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot(): LogEntry[] {
  return entries;
}

export function useLogs(): LogEntry[] {
  return useSyncExternalStore(subscribe, getSnapshot);
}
