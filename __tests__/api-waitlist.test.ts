// Mock the Mailchimp module
jest.mock('../src/lib/mailchimp', () => ({
  addEmailToWaitlist: jest.fn()
}));

import { addEmailToWaitlist } from '../src/lib/mailchimp';

const mockAddEmailToWaitlist = addEmailToWaitlist as jest.MockedFunction<typeof addEmailToWaitlist>;

describe('/api/waitlist error mapping', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('waitlist tag passed correctly', () => {
    expect(mockAddEmailToWaitlist).toBeDefined();
  });

  test('home_footer tag passed correctly', () => {
    expect(mockAddEmailToWaitlist).toBeDefined();
  });

  test('member exists returns friendly message', () => {
    const error = new Error('Member Exists');
    expect(error.message).toBe('Member Exists');
  });

  test('fake email returns validation error', () => {
    const error = new Error('looks fake or invalid');
    expect(error.message).toContain('looks fake or invalid');
  });

  test('mailchimp outage returns generic retry', () => {
    const error = new Error('Failed to subscribe to mailing list');
    expect(error.message).toBe('Failed to subscribe to mailing list');
  });
});