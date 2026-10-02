import { describe, it, expect } from 'vitest';
import {
  can,
  safeUrl,
  recordSchema,
  leadSchema,
  applicationSchema,
  slugify,
} from '../src/lib/modules';
describe('Centralized authorization', () => {
  it('prevents recruiter access to sales and content mutations', () => {
    expect(can('recruiter', 'leads:update')).toBe(false);
    expect(can('recruiter', 'research:publish')).toBe(false);
    expect(can('recruiter', 'jobs:publish')).toBe(true);
  });
  it('keeps viewers read-only and owner controls exclusive', () => {
    expect(can('viewer', 'settings:read')).toBe(false);
    expect(can('viewer', 'leads:read')).toBe(false);
    expect(can('viewer', 'applications:read')).toBe(false);
    expect(can('viewer', 'dashboard:read')).toBe(true);
    expect(can('viewer', 'settings:update')).toBe(false);
    expect(can('admin', 'accounts:update')).toBe(false);
    expect(can('owner', 'accounts:update')).toBe(true);
  });
});
describe('Publication and validation', () => {
  it('rejects non-public research publication', () => {
    for (const disclosure of ['private', 'coordinating', 'embargoed'])
      expect(
        recordSchema('research').safeParse({
          title: 'Research',
          slug: 'research',
          status: 'published',
          data: { disclosure },
        }).success
      ).toBe(false);
    expect(
      recordSchema('research').safeParse({
        title: 'Research',
        slug: 'research',
        status: 'published',
        data: { disclosure: 'public' },
      }).success
    ).toBe(true);
  });
  it('blocks script and protocol-relative URLs', () => {
    for (const url of [
      'javascript:alert(1)',
      '//evil.example',
      '/\\evil.example',
      'data:text/html,test',
    ])
      expect(safeUrl(url)).toBe(false);
    expect(safeUrl('/services/api')).toBe(true);
    expect(safeUrl('https://cal.com/xarmoured')).toBe(true);
  });
  it('requires legitimate contact details and candidate introduction', () => {
    expect(
      leadSchema.safeParse({ name: 'A', email: 'bad', company: 'Company', services: 'API' }).success
    ).toBe(false);
    expect(
      applicationSchema.safeParse({
        name: 'Test Person',
        email: 'test@example.com',
        job_id: 'job',
        introduction: 'short',
      }).success
    ).toBe(false);
  });
  it('creates clean slugs and rejects invalid job states', () => {
    expect(slugify('API / Security & Research')).toBe('api-security-research');
    expect(
      recordSchema('jobs').safeParse({
        title: 'Researcher',
        slug: 'researcher',
        status: 'published',
        data: {},
      }).success
    ).toBe(false);
  });
});
