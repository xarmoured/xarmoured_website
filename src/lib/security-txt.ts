import { z } from 'zod';
export function securityTxt(settings: Record<string, unknown>, now = new Date()) {
  const email = z.email().safeParse(settings.security_email);
  const expires =
    typeof settings.security_expires === 'string'
      ? new Date(`${settings.security_expires}T23:59:59Z`)
      : new Date(NaN);
  const canonical =
    typeof settings.security_canonical === 'string' ? settings.security_canonical : '';
  const httpsUrl = (s: string) => {
    try {
      const u = new URL(s);
      return u.protocol === 'https:' && !u.username && !u.password && !/[\r\n\s]/.test(s);
    } catch {
      return false;
    }
  };
  if (
    !email.success ||
    !httpsUrl(canonical) ||
    !canonical.endsWith('/.well-known/security.txt') ||
    !Number.isFinite(expires.getTime()) ||
    expires <= now ||
    expires.getTime() - now.getTime() > 366 * 86400000
  )
    return null;
  const lines = [
    `Contact: mailto:${email.data}`,
    `Expires: ${expires.toISOString()}`,
    `Canonical: ${canonical}`,
  ];
  const languages = String(settings.security_languages || 'en');
  if (
    /^[a-zA-Z]{2,8}(?:-[a-zA-Z0-9]{1,8})*(?:\s*,\s*[a-zA-Z]{2,8}(?:-[a-zA-Z0-9]{1,8})*)*$/.test(
      languages
    )
  )
    lines.push(`Preferred-Languages: ${languages}`);
  if (
    settings.disclosure_policy_enabled &&
    typeof settings.security_policy === 'string' &&
    httpsUrl(settings.security_policy)
  )
    lines.push(`Policy: ${settings.security_policy}`);
  return lines.join('\n') + '\n';
}
