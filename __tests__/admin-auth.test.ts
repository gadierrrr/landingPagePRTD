import { verifyAdminCookie, createAuthCookie } from '../src/lib/admin/auth';

describe('Admin Auth', () => {
  const originalEnv = process.env.ADMIN_TOKEN;
  
  beforeEach(() => {
    process.env.ADMIN_TOKEN = 'test-token-123';
  });
  
  afterEach(() => {
    process.env.ADMIN_TOKEN = originalEnv;
  });

  test('verifyAdminCookie accepts valid token', () => {
    const validCookie = createAuthCookie('test-token-123');
    expect(verifyAdminCookie(validCookie)).toBe(true);
  });

  test('verifyAdminCookie rejects invalid token', () => {
    const invalidCookie = createAuthCookie('wrong-token');
    expect(verifyAdminCookie(invalidCookie)).toBe(false);
  });

  test('verifyAdminCookie rejects empty cookie', () => {
    expect(verifyAdminCookie('')).toBe(false);
  });

  test('verifyAdminCookie rejects malformed cookie', () => {
    expect(verifyAdminCookie('invalid-format')).toBe(false);
    expect(verifyAdminCookie('too:few')).toBe(false);
  });
});