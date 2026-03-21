import type { NextRequest } from 'next/server';

function stripTrailingSlash(url: string) {
  return url.replace(/\/+$/, '');
}

function normalizeBaseUrl(url: string) {
  const trimmed = stripTrailingSlash(url.trim());
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  return `https://${trimmed}`;
}

export function getAppBaseUrl(request: NextRequest) {
  const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (configuredSiteUrl) {
    return normalizeBaseUrl(configuredSiteUrl);
  }

  const vercelUrl = process.env.NEXT_PUBLIC_VERCEL_URL;
  if (vercelUrl) {
    return normalizeBaseUrl(vercelUrl);
  }

  return stripTrailingSlash(new URL(request.url).origin);
}

export function toAppUrl(path: string, request: NextRequest) {
  return new URL(path, `${getAppBaseUrl(request)}/`);
}