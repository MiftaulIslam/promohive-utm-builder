'use client';

import { useSyncExternalStore } from 'react';
import { HISTORY_KEY, HISTORY_LIMIT } from '@/lib/logic';

export const COPY_FAILED = 'Copy failed, select the text instead';

const EMPTY: readonly string[] = [];

let items = EMPTY;
let loaded = false;
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((listener) => listener());

function read(): readonly string[] {
  try {
    const saved: unknown = JSON.parse(localStorage.getItem(HISTORY_KEY) || 'null');
    const list = Array.isArray(saved) ? saved.filter((u): u is string => typeof u === 'string') : [];
    return list.length ? list : EMPTY;
  } catch {
    return EMPTY;
  }
}

function write(list: readonly string[]) {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(list));
  } catch {
    /* blocked storage skips the write */
  }
}

// Storage is first read here, because React subscribes after mount and never on the server.
function subscribe(listener: () => void) {
  listeners.add(listener);
  if (!loaded) {
    loaded = true;
    items = read();
    if (items !== EMPTY) notify();
  }
  return () => { listeners.delete(listener); };
}

export const useHistory = () => useSyncExternalStore(subscribe, () => items, () => EMPTY);

export function remember(link: string) {
  write([link, ...read().filter((u) => u !== link)].slice(0, HISTORY_LIMIT));
  items = read();
  notify();
}

export function clearHistory() {
  write([]);
  items = read();
  notify();
}
