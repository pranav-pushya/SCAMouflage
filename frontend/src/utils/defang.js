/**
 * Defang URLs, hostnames, and domains for safe display.
 * Links and domains are ALWAYS rendered as plain non-clickable text.
 */
export function defang(text) {
  if (!text || typeof text !== 'string') return '';
  return text
    .replace(/https:\/\//gi, 'hxxps://')
    .replace(/http:\/\//gi, 'hxxp://')
    .replace(/\./g, '[.]');
}

export function defangDomain(domain) {
  if (!domain || typeof domain !== 'string') return '';
  // Avoid double bracket if already defanged
  return domain.replace(/\[\.\]/g, '.').replace(/\./g, '[.]');
}
