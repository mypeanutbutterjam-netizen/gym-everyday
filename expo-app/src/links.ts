/** Official Pages origin. Hash routes and privacy.html stay inside the WebView. */
export const SITE_URL = 'https://mypeanutbutterjam-netizen.github.io/gym-everyday/';
export const PRIVACY_URL = 'https://mypeanutbutterjam-netizen.github.io/gym-everyday/privacy.html';

const SITE_ORIGIN = 'https://mypeanutbutterjam-netizen.github.io';
const SITE_PREFIX = '/gym-everyday';

export function isOwnSiteUrl(url: string): boolean {
  try {
    const u = new URL(url);
    if (u.origin !== SITE_ORIGIN) return false;
    return u.pathname === SITE_PREFIX || u.pathname.startsWith(`${SITE_PREFIX}/`);
  } catch {
    return false;
  }
}

export function isExternalHttp(url: string): boolean {
  if (!/^https?:/i.test(url)) return false;
  return !isOwnSiteUrl(url);
}
