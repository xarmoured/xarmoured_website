import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { currentUser, getRecord, supabase, isDemo, demoChange } from '@/lib/server';
import { can } from '@/lib/modules';
export async function POST(req: Request) {
  const user = await currentUser();
  if (!user || req.headers.get('origin') !== new URL(req.url).origin)
    return new Response(null, { status: 403 });
  try {
    const { module, id, action } = await req.json();
    if (
      !['duplicate', 'read', 'delete_asset'].includes(action) ||
      !can(user.role, `${module}:update`)
    )
      throw new Error('Action not permitted.');
    const r = await getRecord(module, id);
    if (!r) throw new Error('Record not found.');
    let resultId = id;
    if (action === 'duplicate') {
      if (!['jobs', 'research', 'services'].includes(module))
        throw new Error('This record cannot be duplicated.');
      resultId = crypto.randomUUID();
      const title = r.title.slice(0, 165) + ' (copy)';
      const slug = r.slug.slice(0, 150) + '-copy-' + resultId.slice(0, 6);
      if (isDemo)
        await demoChange((db) => {
          db[module].unshift({
            ...r,
            id: resultId,
            title,
            slug,
            status: 'draft',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
        });
      else {
        const db = await supabase();
        const { error } = await db.rpc('save_record', {
          p_id: resultId,
          p_module: module,
          p_title: title,
          p_slug: slug,
          p_status: 'draft',
          p_data: r.data,
          p_expected_updated_at: null,
        });
        if (error) throw new Error('Unable to duplicate.');
      }
    } else if (action === 'read') {
      const data = { ...r.data, unread: false };
      const status = module === 'notifications' ? 'read' : r.status;
      if (isDemo)
        await demoChange((db) => {
          const v = db[module].find((x) => x.id === id)!;
          v.status = status;
          v.data = data;
        });
      else {
        const db = await supabase();
        const { error } = await db.rpc('save_record', {
          p_id: id,
          p_module: module,
          p_title: r.title,
          p_slug: r.slug,
          p_status: status,
          p_data: data,
          p_expected_updated_at: r.updated_at,
        });
        if (error) throw new Error('Unable to mark read.');
      }
    } else {
      if (module !== 'media') throw new Error('Only media can be deleted here.');
      if (isDemo)
        await demoChange((db) => {
          const v = db.media.find((x) => x.id === id)!;
          v.status = 'archived';
          v.deleted_at = new Date().toISOString();
        });
      else {
        const db = await supabase();
        const { error } = await db.storage.from(r.data.bucket).remove([r.data.path]);
        if (error) throw new Error('Unable to delete asset from storage.');
        const { error: archive } = await db.rpc('archive_media', { p_id: id });
        if (archive) throw new Error('File deleted. Metadata cleanup failed; retry archive.');
      }
    }
    revalidatePath('/', 'layout');
    return NextResponse.json({ ok: true, id: resultId });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Unable to complete action.' },
      { status: 400 }
    );
  }
}
