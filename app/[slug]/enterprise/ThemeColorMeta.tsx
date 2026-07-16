'use client';

import { useEffect } from 'react';
import { isThemeColorDark } from './lib/theme-colors';

type Props = {
  color: string;
};

function applyShellBackground(html: HTMLElement, body: HTMLElement, color: string) {
  html.classList.add('enterprise-shell');
  html.style.setProperty('background-color', color, 'important');
  body.style.setProperty('background-color', color, 'important');
  html.style.setProperty('--enterprise-theme-color', color);
}

function clearShellBackground(html: HTMLElement, body: HTMLElement) {
  html.style.removeProperty('background-color');
  body.style.removeProperty('background-color');
}

/** Sinkronkan theme-color browser & area notch atas/bawah dengan background form aktif. */
export function ThemeColorMeta({ color }: Props) {
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;

    const themeMeta = document.querySelector('meta[name="theme-color"]');
    const previousTheme = themeMeta?.getAttribute('content') ?? '';
    const previousHtmlBg = html.style.getPropertyValue('background-color');
    const previousBodyBg = body.style.getPropertyValue('background-color');
    const previousCssVar = html.style.getPropertyValue('--enterprise-theme-color');
    const hadShellClass = html.classList.contains('enterprise-shell');

    const appleMeta = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]');
    const previousAppleStyle = appleMeta?.getAttribute('content') ?? '';

    let meta = themeMeta;
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'theme-color');
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', color);

    let apple = appleMeta;
    if (!apple) {
      apple = document.createElement('meta');
      apple.setAttribute('name', 'apple-mobile-web-app-status-bar-style');
      document.head.appendChild(apple);
    }
    apple.setAttribute('content', isThemeColorDark(color) ? 'black-translucent' : 'default');

    applyShellBackground(html, body, color);

    return () => {
      if (previousTheme) meta?.setAttribute('content', previousTheme);
      else meta?.remove();

      if (previousHtmlBg) html.style.setProperty('background-color', previousHtmlBg, 'important');
      else clearShellBackground(html, body);

      if (previousBodyBg) body.style.setProperty('background-color', previousBodyBg, 'important');

      if (previousCssVar) html.style.setProperty('--enterprise-theme-color', previousCssVar);
      else html.style.removeProperty('--enterprise-theme-color');

      if (!hadShellClass) html.classList.remove('enterprise-shell');

      if (previousAppleStyle) apple?.setAttribute('content', previousAppleStyle);
      else apple?.remove();
    };
  }, [color]);

  return null;
}
