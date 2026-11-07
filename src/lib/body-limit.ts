/**
 * Read a request body with a hard byte limit.
 *
 * The content-length header alone is not a limit: a chunked request has none and the header can
 * be wrong. This counts the bytes actually received and stops reading as soon as the limit is
 * exceeded, so an oversized upload is never fully buffered.
 */
export class BodyTooLargeError extends Error {
  constructor() {
    super('The upload is too large.');
  }
}

export async function readLimitedBody(req: Request, maxBytes: number): Promise<Uint8Array> {
  const declared = Number(req.headers.get('content-length') || 0);
  if (declared > maxBytes) throw new BodyTooLargeError();
  if (!req.body) return new Uint8Array();
  const reader = req.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > maxBytes) {
      await reader.cancel();
      throw new BodyTooLargeError();
    }
    chunks.push(value);
  }
  const out = new Uint8Array(total);
  let offset = 0;
  for (const c of chunks) {
    out.set(c, offset);
    offset += c.byteLength;
  }
  return out;
}

/** Parse multipart or urlencoded form data from a limited body. */
export async function readLimitedForm(req: Request, maxBytes: number): Promise<FormData> {
  const body = await readLimitedBody(req, maxBytes);
  return new Response(body as BodyInit, {
    headers: { 'content-type': req.headers.get('content-type') || '' },
  }).formData();
}
