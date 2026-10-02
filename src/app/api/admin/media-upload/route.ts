import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { currentUser, supabase, isDemo } from '@/lib/server';
import { can } from '@/lib/modules';
export async function POST(req: Request) {
  const user = await currentUser();
  if (
    !user ||
    !can(user.role, 'media:update') ||
    req.headers.get('origin') !== new URL(req.url).origin
  )
    return new Response(null, { status: 403 });
  try {
    if (isDemo)
      throw new Error('Connect Supabase Storage to upload real files. Demo records remain local.');
    if (Number(req.headers.get('content-length') || 0) > 11000000)
      throw new Error('Use a file under 10 MB.');
    const fd = await req.formData();
    const file = fd.get('file');
    const bucket = String(fd.get('bucket'));
    if (
      !(file instanceof File) ||
      file.size > 10485760 ||
      !['public-assets', 'private-internal'].includes(bucket)
    )
      throw new Error('Select a supported file under 10 MB.');
    const types: Record<string, string> = {
      'image/png': 'png',
      'image/jpeg': 'jpg',
      'image/webp': 'webp',
      'image/avif': 'avif',
      'application/pdf': 'pdf',
    };
    if (!types[file.type]) throw new Error('Use PNG, JPEG, WebP, AVIF, or PDF.');
    const bytes = new Uint8Array(await file.arrayBuffer());
    const signature = new TextDecoder().decode(bytes.slice(0, 12));
    const valid =
      file.type === 'application/pdf'
        ? signature.startsWith('%PDF-')
        : file.type === 'image/png'
          ? bytes[0] === 137 && bytes[1] === 80 && bytes[2] === 78 && bytes[3] === 71
          : file.type === 'image/jpeg'
            ? bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255
            : file.type === 'image/webp'
              ? signature.startsWith('RIFF') && signature.slice(8) === 'WEBP'
              : signature.slice(4, 8) === 'ftyp';
    if (!valid) throw new Error('File contents do not match the selected type.');
    const db = await supabase();
    const path = `${crypto.randomUUID()}.${types[file.type]}`;
    const { error } = await db.storage.from(bucket).upload(path, bytes, { contentType: file.type });
    if (error) throw new Error('Unable to upload. Check storage setup.');
    const id = crypto.randomUUID();
    const url =
      bucket === 'public-assets' ? db.storage.from(bucket).getPublicUrl(path).data.publicUrl : '';
    const { error: saveError } = await db.rpc('save_record', {
      p_id: id,
      p_module: 'media',
      p_title: file.name,
      p_slug: id,
      p_status: bucket === 'public-assets' ? 'published' : 'private',
      p_data: { bucket, path, url, mime: file.type, size: file.size, alt: '' },
      p_expected_updated_at: null,
    });
    if (saveError) {
      await db.storage.from(bucket).remove([path]);
      throw new Error('Unable to save asset metadata.');
    }
    revalidatePath('/admin/media');
    return NextResponse.json({ ok: true, id, url });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Upload failed.' },
      { status: 400 }
    );
  }
}
