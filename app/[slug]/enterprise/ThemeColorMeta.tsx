'use client';

import { useEffect, useId } from 'react';
import { isThemeColorDark } from './lib/theme-colors';

type Props = {
  color: string;
};

type ThemeEntry = {
  id: string;
  color: string;
};

const themeStack: ThemeEntry[] = [];

function ensureMeta(name: string): HTMLMetaElement {
  let meta = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute('name', name);
    document.head.appendChild(meta);
  }
  return meta;
}

function applyThemeColor(color: string) {
  const html = document.documentElement;
  const body = document.body;

  ensureMeta('theme-color').setAttribute('content', color);
  ensureMeta('apple-mobile-web-app-status-bar-style').setAttribute(
    'content',
    isThemeColorDark(color) ? 'black-translucent' : 'default'
  );

  html.classList.add('enterprise-shell');
  html.style.setProperty('background-color', color, 'important');
  body.style.setProperty('background-color', color, 'important');
  html.style.setProperty('--enterprise-theme-color', color);
}

function restoreFallbackTheme() {
  const html = document.documentElement;
  const body = document.body;

  html.classList.remove('enterprise-shell');
  html.style.removeProperty('background-color');
  body.style.removeProperty('background-color');
  html.style.removeProperty('--enterprise-theme-color');
}

function syncThemeFromStack() {
  const top = themeStack[themeStack.length - 1];
  if (top) applyThemeColor(top.color);
  else restoreFallbackTheme();
}

/** Imperatif — set warna sebelum React paint (transisi EV2). */
export function applyEnterpriseThemeColor(color: string) {
  if (themeStack.length === 0) {
    applyThemeColor(color);
    return;
  }
  themeStack[themeStack.length - 1].color = color;
  syncThemeFromStack();
}

/** Sinkronkan theme-color browser & area notch — stack agar nested form tidak flash warna salah. */
export function ThemeColorMeta({ color }: Props) {
  const id = useId();

  useEffect(() => {
    const existing = themeStack.findIndex((entry) => entry.id === id);
    if (existing >= 0) themeStack[existing].color = color;
    else themeStack.push({ id, color });

    syncThemeFromStack();

    return () => {
      const index = themeStack.findIndex((entry) => entry.id === id);
      if (index >= 0) themeStack.splice(index, 1);
      syncThemeFromStack();
    };
  }, [color, id]);

  return null;
}
