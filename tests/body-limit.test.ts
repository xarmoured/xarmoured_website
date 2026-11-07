import { describe, expect, it } from 'vitest';
import { BodyTooLargeError, readLimitedBody, readLimitedForm } from '../src/lib/body-limit';

const post = (body: BodyInit, headers: Record<string, string> = {}) =>
  new Request('http://localhost/api/submit', {
    method: 'POST',
    body,
    headers,
    duplex: 'half',
  } as RequestInit);
const stream = (chunks: Uint8Array[]) =>
  new ReadableStream<Uint8Array>({
    start(c) {
      chunks.forEach((x) => c.enqueue(x));
      c.close();
    },
  });

describe('readLimitedBody', () => {
  it('reads a body within the limit', async () => {
    const out = await readLimitedBody(post('hello'), 10);
    expect(new TextDecoder().decode(out)).toBe('hello');
  });
  it('rejects a body whose declared length exceeds the limit', async () => {
    await expect(
      readLimitedBody(post('x', { 'content-length': '999' }), 10)
    ).rejects.toBeInstanceOf(BodyTooLargeError);
  });
  it('rejects a chunked body with no content-length that exceeds the limit', async () => {
    const big = new Uint8Array(4).fill(1);
    const req = post(stream([big, big, big]));
    expect(req.headers.get('content-length')).toBeNull();
    await expect(readLimitedBody(req, 10)).rejects.toBeInstanceOf(BodyTooLargeError);
  });
  it('parses form data from a limited body', async () => {
    const fd = new FormData();
    fd.set('type', 'assessment');
    fd.set('name', 'Test');
    const form = await readLimitedForm(
      new Request('http://localhost/', { method: 'POST', body: fd }),
      100000
    );
    expect(form.get('type')).toBe('assessment');
    expect(form.get('name')).toBe('Test');
  });
});
