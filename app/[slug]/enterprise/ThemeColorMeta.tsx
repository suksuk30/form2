'use client';

import { useId, useLayoutEffect } from 'react';
import {
  ENTERPRISE_HOME_THEME,
  ENTERPRISE_TOKPED_THEME,
  ENTERPRISE_OVO_THEME,
} from './lib/theme-bootstrap';
import { isThemeColorDark } from './lib/theme-colors';

type Props = {
  color: string;
};

type ThemeEntry = {
  id: string;
  color: string;
};

const themeStack: ThemeEntry[] = [];
const SAFE_TOP_ID = 'enterprise-safe-top';
const SAFE_BOTTOM_ID = 'enterprise-safe-bottom';

function ensureMeta(name: string): HTMLMetaElement {
  let meta = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute('name', name);
    document.head.appendChild(meta);
  }
  return meta;
}

function ensureSafeAreaBar(id: string, placement: 'top' | 'bottom'): HTMLDivElement {
  let bar = document.getElementById(id) as HTMLDivElement | null;
  if (!bar) {
    bar = document.createElement('div');
    bar.id = id;
    bar.setAttribute('aria-hidden', 'true');
    bar.style.cssText = [
      'position:fixed',
      'left:0',
      'right:0',
      'z-index:2147483646',
      'pointer-events:none',
      placement === 'top' ? 'top:0' : 'bottom:0',
      placement === 'top'
        ? 'height:env(safe-area-inset-top,0px)'
        : 'height:env(safe-area-inset-bottom,0px)',
    ].join(';');
    document.body.appendChild(bar);
  }
  return bar;
}

function resolveEnterpriseHomeColor(): string {
  return (
    document.documentElement.dataset.enterpriseHomeColor ??
    document.documentElement.dataset.enterpriseTheme ??
    ENTERPRISE_HOME_THEME
  );
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
  html.dataset.enterpriseActive = '1';
  html.dataset.enterpriseTheme = color;
  html.style.setProperty('background-color', color, 'important');
  body.style.setProperty('background-color', color, 'important');
  html.style.setProperty('--enterprise-theme-color', color);
  html.style.setProperty('--landingpage-top-color', color);
  html.style.setProperty('--grab-safe-top', 'env(safe-area-inset-top, 0px)');
  html.style.setProperty('--grab-safe-bottom', 'env(safe-area-inset-bottom, 0px)');
  html.style.minHeight = '100%';
  body.style.minHeight = '100%';

  const topBar = ensureSafeAreaBar(SAFE_TOP_ID, 'top');
  const bottomBar = ensureSafeAreaBar(SAFE_BOTTOM_ID, 'bottom');
  topBar.style.backgroundColor = color;
  bottomBar.style.backgroundColor = color;
}

function restoreFallbackTheme() {
  const html = document.documentElement;

  if (html.dataset.enterpriseActive === '1') {
    applyThemeColor(resolveEnterpriseHomeColor());
    return;
  }

  html.classList.remove('enterprise-shell');
  html.style.removeProperty('background-color');
  document.body.style.removeProperty('background-color');
  html.style.removeProperty('--enterprise-theme-color');
  html.style.removeProperty('--landingpage-top-color');
  html.style.removeProperty('--grab-safe-top');
  html.style.removeProperty('--grab-safe-bottom');
  html.style.removeProperty('minHeight');
  document.body.style.removeProperty('minHeight');
  delete html.dataset.enterpriseActive;
  delete html.dataset.enterpriseTheme;
  delete html.dataset.enterpriseHomeColor;
  document.getElementById(SAFE_TOP_ID)?.remove();
  document.getElementById(SAFE_BOTTOM_ID)?.remove();
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

/** Set tema home enterprise (hijau) — dipakai saat kembali dari form OVO. */
export function applyEnterpriseHomeTheme() {
  applyEnterpriseThemeColor(resolveEnterpriseHomeColor());
}

/** Set tema route OVO (ungu splash). */
export function applyEnterpriseOvoTheme() {
  applyEnterpriseThemeColor(ENTERPRISE_OVO_THEME);
}

/** Set tema route Tokped (hijau Tokopedia). */
export function applyEnterpriseTokpedTheme() {
  applyEnterpriseThemeColor(ENTERPRISE_TOKPED_THEME);
}

/** Sinkronkan theme-color browser & area notch — stack agar nested form tidak flash warna salah. */
export function ThemeColorMeta({ color }: Props) {
  const id = useId();

  useLayoutEffect(() => {
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
