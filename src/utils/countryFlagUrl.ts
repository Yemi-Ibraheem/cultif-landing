/**
 * FlagCDN (https://flagcdn.com) URLs for country flags.
 * Uses ISO 3166-1 alpha-2 country codes; small rectangle sizes for UI.
 */
const FLAG_CDN_BASE = 'https://flagcdn.com';

export type FlagSize = '24x18' | '32x24' | '40x30' | '48x36';

export function getCountryFlagUrl(code: string, size: FlagSize = '32x24'): string {
  const normalized = (code || '').trim().toLowerCase();
  if (!normalized) return '';
  return `${FLAG_CDN_BASE}/${size}/${normalized}.png`;
}
