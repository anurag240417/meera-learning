// In development the local API (npm run api) is the default.
// A production build only submits when VITE_API_BASE_URL is set at build time:
// a static deployment cannot reach a visitor's localhost.
const configuredBase = import.meta.env.VITE_API_BASE_URL;
const API_BASE = (configuredBase || (import.meta.env.DEV ? 'http://localhost:8787' : '')).replace(/\/+$/, '');

const TIMEOUT_MS = 10000;

export const isRegistrationApiConfigured = Boolean(API_BASE);

export class RegistrationNetworkError extends Error {
  constructor(message) {
    super(message);
    this.name = 'RegistrationNetworkError';
  }
}

/**
 * POST a validated registration.
 * Resolves to { ok, status, message, reference } for any HTTP response;
 * rejects with RegistrationNetworkError when the service cannot be reached.
 */
export async function submitRegistration(payload) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  let response;
  try {
    response = await fetch(`${API_BASE}/api/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
  } catch {
    throw new RegistrationNetworkError('Registration service unreachable.');
  } finally {
    clearTimeout(timer);
  }

  let data = {};
  try {
    data = await response.json();
  } catch {
    // Non-JSON body: fall back to the generic messages below.
  }

  return {
    ok: response.ok && data.ok === true,
    status: response.status,
    message: typeof data.message === 'string' ? data.message : '',
    reference: typeof data.reference === 'string' ? data.reference : '',
  };
}
