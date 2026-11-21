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

function write(message: string, method: 'log' | 'error'): void {
  console[method](`[OneSignal] ${message}`);
}

/** Log view entries are kept in memory only, so each launch starts empty. */
function addToView(message: string): void {
  entries = [...entries, { id: nextId++, time: formatTime(new Date()), message }].slice(
    -MAX_ENTRIES,
  );
  emit();
}

export const log = {
  info: (message: string) => write(message, 'log'),
  show: (message: string) => {
    write(message, 'log');
    addToView(message);
  },
  error: (message: string) => {
    write(message, 'error');
    addToView(message);
  },
};

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
