import { describe, it, expect, vi } from 'vitest';
import { apiService } from '../../frontend/src/services/api';

describe('apiService.requestPasswordReset', () => {
  it('calls backend endpoint with email payload', async () => {
    const mockFetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) });
    // @ts-ignore
    global.fetch = mockFetch;

    await apiService.requestPasswordReset('test@example.com');

    expect(mockFetch).toHaveBeenCalled();
    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toContain('/auth/request-password-reset');
    expect(options.method).toBe('POST');
    expect(options.headers['Content-Type']).toBe('application/json');
    expect(options.body).toBe(JSON.stringify({ email: 'test@example.com' }));
  });
});
