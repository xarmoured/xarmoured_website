import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { currentUser, supabase, isDemo, demoChange } from '@/lib/server';
import { can } from '@/lib/modules';
const schema = z.object({
  module: z.enum(['services', 'faqs', 'team', 'navigation']),
  items: z
    .array(
      z.object({ id: z.string().min(1).max(100), updated_at: z.iso.datetime({ offset: true }) })
    )
    .max(1000),
});
export async function POST(req: Request) {
  const user = await currentUser();
  if (!user || req.headers.get('origin') !== new URL(req.url).origin)
    return new Response(null, { status: 403 });
  try {
    const { module, items } = schema.parse(await req.json());
    if (
      !can(user.role, `${module}:update`) ||
      new Set(items.map((r) => r.id)).size !== items.length
    )
      throw new Error('Action not permitted.');
    if (isDemo)
      await demoChange((db) => {
        const rows = items.map((item) => {
          const r = db[module].find((r) => r.id === item.id);
          if (!r || r.updated_at !== item.updated_at)
            throw new Error('Content changed. Refresh before reordering.');
          return r;
        });
        rows.forEach((r, index) => {
          r.data.order = index;
          r.updated_at = new Date().toISOString();
        });
      });
    else {
      const db = await supabase();
      const { error } = await db.rpc('reorder_records', { p_module: module, p_items: items });
      if (error) throw new Error('Unable to save ordering. Refresh and try again.');
    }
    revalidatePath('/', 'layout');
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Unable to reorder.' },
      { status: 400 }
    );
  }
}
