import { safeUrl } from './modules';
export function findRedirect(path: string, rows: { data: Record<string, any> }[]) {
  const r = rows.find((r) => r.data.from === path);
  if (!r || !safeUrl(r.data.to) || r.data.to === path) return null;
  return { to: r.data.to, code: r.data.code === '302' ? 302 : 301 } as const;
}
