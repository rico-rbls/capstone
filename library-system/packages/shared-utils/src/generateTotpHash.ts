/**
 * Generate a time-based one-time password hash for QR code verification.
 *
 * This produces a simple TOTP-like numeric code based on a secret and the
 * current time window. For production use, consider a full RFC 6238 implementation.
 *
 * @param secret - A shared secret string (e.g. user ID + server secret).
 * @param windowSeconds - Time window in seconds (default: 30).
 * @returns A 6-digit numeric string.
 */
export function generateTotpHash(
  secret: string,
  windowSeconds: number = 30,
): string {
  const epoch = Math.floor(Date.now() / 1000);
  const counter = Math.floor(epoch / windowSeconds);

  // Simple hash: combine secret + counter, produce a deterministic 6-digit code.
  // NOTE: This is a lightweight implementation for demo/capstone purposes.
  // For production, use a proper HMAC-SHA1 TOTP library.
  let hash = 0;
  const input = `${secret}:${counter}`;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32-bit integer
  }

  const code = Math.abs(hash) % 1_000_000;
  return code.toString().padStart(6, "0");
}
