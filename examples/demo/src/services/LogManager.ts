export type LogLevel = 'D' | 'I' | 'W' | 'E';

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  tag: string;
  message: string;
}

type Listener = (entries: LogEntry[]) => void;

class LogManager {
  private static _instance: LogManager;
  private entries: LogEntry[] = [];
  private listeners: Set<Listener> = new Set();

  static getInstance(): LogManager {
    if (!LogManager._instance) {
      LogManager._instance = new LogManager();
    }
    return LogManager._instance;
  }

  private log(level: LogLevel, tag: string, message: string): void {
    const now = new Date();
    const timestamp = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
    const entry: LogEntry = { timestamp, level, tag, message };
    this.entries = [...this.entries, entry];

    switch (level) {
      case 'W':
        console.warn(`[${tag}] ${message}`);
        break;
      case 'E':
        console.error(`[${tag}] ${message}`);
        break;
      default:
        console.log(`[${level}][${tag}] ${message}`);
    }

    this.notify();
  }

  d(tag: string, message: string): void {
    this.log('D', tag, message);
  }

  i(tag: string, message: string): void {
    this.log('I', tag, message);
  }

  w(tag: string, message: string): void {
    this.log('W', tag, message);
  }

  e(tag: string, message: string): void {
    this.log('E', tag, message);
  }

  clear(): void {
    this.entries = [];
    this.notify();
  }

  getEntries(): LogEntry[] {
    return this.entries;
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    for (const listener of this.listeners) {
      listener(this.entries);
    }
  }
}

export default LogManager;
