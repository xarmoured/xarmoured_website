import { describe, it, expect } from 'vitest';
import { recordSchema, can, leadSchema } from '../src/lib/modules';
import { securityTxt } from '../src/lib/security-txt';
const record = (data: Record<string, unknown>, status = 'published') => ({
  title: 'Reviewed content',
  slug: 'reviewed-content',
  status,
  data,
});
describe('Structured content publication', () => {
  it('does not publish empty services or private cases', () => {
    expect(recordSchema('services').safeParse(record({ summary: 'Ready' })).success).toBe(false);
    expect(
      recordSchema('services').safeParse(
        record({ summary: 'Ready', description: 'Actual testing', testing_areas: 'Authorization' })
      ).success
    ).toBe(true);
    expect(
      recordSchema('case_studies').safeParse(
        record({ visibility: 'private', scope: 'Agreed', business_outcome: 'Verified' })
      ).success
    ).toBe(false);
    expect(
      recordSchema('case_studies').safeParse(
        record({ visibility: 'public', scope: 'Agreed', business_outcome: 'Verified' })
      ).success
    ).toBe(true);
  });
  it('keeps new content under existing editorial role boundaries', () => {
    for (const module of ['resources', 'case_studies', 'industries', 'service_categories']) {
      expect(can('editor', `${module}:update`)).toBe(true);
      expect(can('recruiter', `${module}:update`)).toBe(false);
      expect(can('viewer', `${module}:read`)).toBe(false);
    }
  });
  it('rejects unsafe advisory links, invalid dates and scope enums', () => {
    expect(
      recordSchema('research').safeParse(
        record({ disclosure: 'public', advisory_url: 'javascript:alert(1)' })
      ).success
    ).toBe(false);
    expect(
      recordSchema('resources').safeParse(record({ publication_date: '2026-02-31' })).success
    ).toBe(false);
    expect(
      leadSchema.safeParse({
        name: 'Test Person',
        email: 'a@example.com',
        company: 'Example',
        services: 'Scope',
        target_type: 'Imaginary',
      }).success
    ).toBe(false);
  });
});
describe('security.txt configuration', () => {
  const now = new Date('2026-10-07T00:00:00Z');
  const settings = {
    security_email: 'security@example.com',
    security_canonical: 'https://example.com/.well-known/security.txt',
    security_expires: '2027-01-01',
    security_languages: 'en, hi',
  };
  it('requires real unexpired configuration', () => {
    expect(securityTxt({}, now)).toBeNull();
    expect(securityTxt({ ...settings, security_expires: '2026-01-01' }, now)).toBeNull();
    expect(securityTxt({ ...settings, security_expires: '2030-01-01' }, now)).toBeNull();
    expect(
      securityTxt(
        { ...settings, security_canonical: 'http://example.com/.well-known/security.txt' },
        now
      )
    ).toBeNull();
  });
  it('emits standard fields and gates policy publication', () => {
    const output = securityTxt(
      { ...settings, security_policy: 'https://example.com/security' },
      now
    )!;
    expect(output).toContain('Contact: mailto:security@example.com\n');
    expect(output).toContain('Expires: 2027-01-01T23:59:59.000Z\n');
    expect(output).not.toContain('Policy:');
    expect(
      securityTxt(
        {
          ...settings,
          security_policy: 'https://example.com/security',
          disclosure_policy_enabled: true,
        },
        now
      )
    ).toContain('Policy: https://example.com/security');
  });
});
