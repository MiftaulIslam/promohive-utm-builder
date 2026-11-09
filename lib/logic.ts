/* Pure logic for the UTM Link Builder: no React, no DOM, so it runs in Node for checks too. */

export type UtmField = 'url' | 'source' | 'medium' | 'campaign' | 'content' | 'term';
export type UtmValues = Record<UtmField, string>;
export const UTM_EMPTY: UtmValues = { url: '', source: '', medium: '', campaign: '', content: '', term: '' };

const UTM_PARAMS = [['utm_source', 'source'], ['utm_medium', 'medium'], ['utm_campaign', 'campaign'], ['utm_content', 'content'], ['utm_term', 'term']] as const;
const UTM_REQUIRED = ['source', 'medium', 'campaign'] as const;

export const UTM_PRESETS = [
  { name: 'Facebook', source: 'facebook', medium: 'paid_social' },
  { name: 'Instagram', source: 'instagram', medium: 'paid_social' },
  { name: 'Google Ads', source: 'google', medium: 'cpc' },
  { name: 'TikTok', source: 'tiktok', medium: 'paid_social' },
  { name: 'Email', source: 'newsletter', medium: 'email' },
  { name: 'WhatsApp', source: 'whatsapp', medium: 'social' },
] as const;

export const HISTORY_KEY = 'ph-utm-history';
export const HISTORY_LIMIT = 10;

export const cleanUtm = (v: string) => v.trim().toLowerCase().replace(/\s+/g, '-');

export interface UtmResult {
  /** The tagged link, or '' when it cannot be built yet. */
  link: string;
  /** What the output says while there is no link. */
  waiting: string;
  urlMsg: string;
  urlInvalid: boolean;
  notes: string[];
}

export function buildUtm(f: UtmValues): UtmResult {
  const raw = f.url.trim();
  const notes: string[] = [];
  let url: URL | null = null;
  let urlMsg = '', urlInvalid = false;
  if (raw) {
    try {
      url = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
      if (!/^https?:$/.test(url.protocol) || !url.hostname.includes('.')) throw new Error();
      if (!/^https?:\/\//i.test(raw)) notes.push('Added https:// to the start of the URL.');
    } catch {
      url = null;
      urlMsg = 'That does not look like a web address yet.';
      urlInvalid = true;
    }
  }
  const missing = UTM_REQUIRED.filter((n) => !f[n].trim());
  UTM_PARAMS.forEach(([, n]) => { const v = f[n]; if (v.trim() !== cleanUtm(v)) notes.push(`${n}: “${v.trim()}” becomes “${cleanUtm(v)}” (lowercase, spaces as hyphens).`); });
  if (url && !missing.length) {
    const u = url;
    const kept = new Set(u.searchParams.keys());
    UTM_PARAMS.forEach(([key, n]) => {
      const v = cleanUtm(f[n]);
      if (!v) return;
      if (kept.delete(key)) notes.push(`Replaced the ${key} that was already on the URL.`);
      u.searchParams.set(key, v);
    });
    if (kept.size) notes.push('Kept the query string that was already on the URL.');
    return { link: u.toString(), waiting: '', urlMsg, urlInvalid, notes };
  }
  const waiting = !raw ? 'Add the destination URL to start.' : !url ? 'Fix the URL to build the link.' : `Still needed: ${missing.map((m) => `utm_${m}`).join(', ')}.`;
  return { link: '', waiting, urlMsg, urlInvalid, notes };
}

/** Splits a link into plain text and utm_ parameters; odd indexes are the parameters. */
export const utmParts = (link: string) => link.split(/(utm_[a-z]+=[^&#]*)/);

/** The host and path for the label's Destination field. */
export function addressOf(raw: string): string {
  const t = raw.trim();
  if (!t) return '';
  try {
    const u = new URL(/^https?:\/\//i.test(t) ? t : `https://${t}`);
    return u.host + u.pathname.replace(/\/$/, '');
  } catch {
    return t;
  }
}

/** A preset's name when source and medium match one, otherwise the cleaned source. Shortened to fit the postmark's arc. */
export function channelOf(v: UtmValues): string {
  const source = cleanUtm(v.source), medium = cleanUtm(v.medium);
  const name = UTM_PRESETS.find((p) => p.source === source && p.medium === medium)?.name ?? source;
  return name.length > 22 ? `${name.slice(0, 21)}…` : name;
}

/** Campaign and route for a saved link's slip. */
export function parseSlip(url: string): { camp: string; route: string } {
  try {
    const u = new URL(url), p = u.searchParams;
    return { camp: p.get('utm_campaign') || u.host, route: [p.get('utm_source'), p.get('utm_medium')].filter(Boolean).join(' / ') };
  } catch {
    return { camp: url, route: '' };
  }
}

/** The label's barcode as one SVG path in a 160 by 56 box. The same link always draws the same bars. */
export function barsPath(link: string): string {
  if (!link) return '';
  let h = 2166136261, x = 0, d = '';
  for (let i = 0; i < link.length; i++) h = Math.imul(h ^ link.charCodeAt(i), 16777619);
  while (x < 156) {
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    const w = 2 + ((h >>> 8) & 3), gap = 2 + ((h >>> 20) & 2);
    d += `M${x} 0h${w}v56h-${w}z`;
    x += w + gap;
  }
  return d;
}
