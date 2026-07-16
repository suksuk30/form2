import { NextRequest, NextResponse } from 'next/server';
import { getSlugFromHostname } from '@/lib/subdomain';

const IGNORED_PATH_PATTERN = /^\/(?:_next|api|favicon\.ico|robots\.txt|sitemap\.xml)(?:\/|$)/i;
const IGNORED_FILE_EXTENSIONS = /\.(?:css|js|map|png|jpg|jpeg|webp|gif|svg|ico|json|txt|xml|pdf|woff|woff2|ttf|eot|mp3|wav)$/i;

function shouldRewrite(request: NextRequest, slug: string): boolean {
  const pathname = request.nextUrl.pathname;

  if (pathname.startsWith(`/${slug}`)) return false;
  if (IGNORED_PATH_PATTERN.test(pathname)) return false;
  if (IGNORED_FILE_EXTENSIONS.test(pathname)) return false;

  return true;
}

export function middleware(request: NextRequest) {
  const env = process.env.NODE_ENV ?? 'development';
  const slug = getSlugFromHostname(request.nextUrl.hostname, env);
  if (!slug) return NextResponse.next();

  if (!shouldRewrite(request, slug)) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = `/${slug}${url.pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: [
    '/((?!_next/|api/|favicon\.ico$|robots\.txt$|sitemap\.xml$|.*\.(?:css|js|map|png|jpg|jpeg|webp|gif|svg|ico|json|txt|xml|pdf|woff|woff2|ttf|eot|mp3|wav)$).*)',
  ],
};
