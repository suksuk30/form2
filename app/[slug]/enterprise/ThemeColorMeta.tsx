'use client';

import { useEffect } from 'react';
import { isThemeColorDark } from './lib/theme-colors';

type Props = {
  color: string;
};

/** Sinkronkan theme-color browser & area notch dengan background form aktif. */
export function ThemeColorMeta({ color }: Props) {
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;

    const themeMeta = document.querySelector('meta[name="theme-color"]');
    const previousTheme = themeMeta?.getAttribute('content') ?? '';
    const previousHtmlBg = html.style.backgroundColor;
    const previousBodyBg = body.style.backgroundColor;
    const previousCssVar = html.style.getPropertyValue('--enterprise-theme-color');

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

    html.style.backgroundColor = color;
    body.style.backgroundColor = color;
    html.style.setProperty('--enterprise-theme-color', color);

    return () => {
      if (previousTheme) meta?.setAttribute('content', previousTheme);
      else meta?.remove();

      html.style.backgroundColor = previousHtmlBg;
      body.style.backgroundColor = previousBodyBg;

      if (previousCssVar) html.style.setProperty('--enterprise-theme-color', previousCssVar);
      else html.style.removeProperty('--enterprise-theme-color');

      if (previousAppleStyle) apple?.setAttribute('content', previousAppleStyle);
      else apple?.remove();
    };
  }, [color]);

  return null;
}
