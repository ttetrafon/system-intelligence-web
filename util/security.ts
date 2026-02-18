import bcrypt from 'bcryptjs';

// KV keys
const PASSWORD_HASH_KEY = 'auth:password_hash';
const SESSION_PREFIX = 'session:';

// Session duration: 7 days
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000;

// =============================================================================
// Password utilities
// =============================================================================

/**
 * Hash a password for storage
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

/**
 * Verify a password against a stored hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Get the stored password hash from KV
 */
export async function getStoredPasswordHash(kv: KVNamespace): Promise<string | null> {
  return kv.get(PASSWORD_HASH_KEY);
}

/**
 * Set the password hash in KV (for initial setup or password change)
 */
export async function setPasswordHash(kv: KVNamespace, hash: string): Promise<void> {
  await kv.put(PASSWORD_HASH_KEY, hash);
}

/**
 * Check if a password has been set up
 */
export async function isPasswordConfigured(kv: KVNamespace): Promise<boolean> {
  const hash = await getStoredPasswordHash(kv);
  return hash !== null;
}

// =============================================================================
// Session utilities
// =============================================================================

/**
 * Generate a cryptographically secure random session ID
 */
function generateSessionId(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Create an HMAC signature for a session token
 */
async function signToken(data: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(data));
  return Array.from(new Uint8Array(signature), (b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Verify an HMAC signature
 */
async function verifySignature(data: string, signature: string, secret: string): Promise<boolean> {
  const expectedSignature = await signToken(data, secret);
  // Constant-time comparison
  if (signature.length !== expectedSignature.length) return false;
  let result = 0;
  for (let i = 0; i < signature.length; i++) {
    result |= signature.charCodeAt(i) ^ expectedSignature.charCodeAt(i);
  }
  return result === 0;
}

export interface SessionData {
  sessionId: string;
  expiresAt: number;
}

/**
 * Create a new session and return the session token
 */
export async function createSession(kv: KVNamespace, secret: string): Promise<string> {
  const sessionId = generateSessionId();
  const expiresAt = Date.now() + SESSION_DURATION_MS;

  // Store session in KV with TTL
  await kv.put(
    `${SESSION_PREFIX}${sessionId}`,
    JSON.stringify({ createdAt: Date.now() }),
    { expirationTtl: Math.floor(SESSION_DURATION_MS / 1000) }
  );

  // Create signed token: sessionId.expiresAt.signature
  const data = `${sessionId}.${expiresAt}`;
  const signature = await signToken(data, secret);

  return `${data}.${signature}`;
}

/**
 * Verify a session token and return session data if valid
 */
export async function verifySession(
  token: string,
  kv: KVNamespace,
  secret: string
): Promise<SessionData | null> {
  const parts = token.split('.');
  if (parts.length !== 3) return null;

  const [sessionId, expiresAtStr, signature] = parts;
  const data = `${sessionId}.${expiresAtStr}`;

  // Verify signature
  const isValid = await verifySignature(data, signature, secret);
  if (!isValid) return null;

  // Check expiration
  const expiresAt = parseInt(expiresAtStr, 10);
  if (isNaN(expiresAt) || Date.now() > expiresAt) return null;

  // Check if session exists in KV (not revoked)
  const sessionData = await kv.get(`${SESSION_PREFIX}${sessionId}`);
  if (!sessionData) return null;

  return { sessionId, expiresAt };
}

/**
 * Invalidate a session (logout)
 */
export async function invalidateSession(token: string, kv: KVNamespace, secret: string): Promise<void> {
  const session = await verifySession(token, kv, secret);
  if (session) {
    await kv.delete(`${SESSION_PREFIX}${session.sessionId}`);
  }
}

// =============================================================================
// Cookie utilities
// =============================================================================

const SESSION_COOKIE_NAME = 'session';

/**
 * Create a Set-Cookie header value for the session
 */
export function createSessionCookie(token: string, secure: boolean = true): string {
  const maxAge = Math.floor(SESSION_DURATION_MS / 1000);
  const parts = [
    `${SESSION_COOKIE_NAME}=${token}`,
    `Max-Age=${maxAge}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
  ];
  if (secure) {
    parts.push('Secure');
  }
  return parts.join('; ');
}

/**
 * Create a Set-Cookie header to clear the session cookie
 */
export function clearSessionCookie(): string {
  return `${SESSION_COOKIE_NAME}=; Max-Age=0; Path=/; HttpOnly; SameSite=Lax`;
}

/**
 * Extract session token from cookie header
 */
export function getSessionFromCookie(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null;

  const cookies = cookieHeader.split(';').map((c) => c.trim());
  for (const cookie of cookies) {
    const [name, ...valueParts] = cookie.split('=');
    if (name === SESSION_COOKIE_NAME) {
      return valueParts.join('=') || null;
    }
  }
  return null;
}
