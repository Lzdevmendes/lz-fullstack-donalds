import crypto from "crypto";

const SECRET = process.env.NEXTAUTH_SECRET ?? "changeme-set-NEXTAUTH_SECRET-in-env";

const ADMIN_MAX_AGE_MS = 8 * 60 * 60 * 1000;
const KITCHEN_MAX_AGE_MS = 12 * 60 * 60 * 1000;

function createSignature(payload: string): string {
  return crypto.createHmac("sha256", SECRET).update(payload).digest("hex");
}

function encodeToken(payload: string, sig: string): string {
  return Buffer.from(`${payload}:${sig}`).toString("base64");
}

function verifySignature(payload: string, sig: string): boolean {
  const expected = createSignature(payload);
  return crypto.timingSafeEqual(Buffer.from(sig, "hex"), Buffer.from(expected, "hex"));
}

function decodeAndValidateToken(token: string, maxAgeMs: number): string[] | null {
  try {
    const decoded = Buffer.from(token, "base64").toString("utf-8");
    const parts = decoded.split(":");
    if (parts.length < 4) return null;

    const sig = parts.pop()!;
    const payload = parts.join(":");

    if (!verifySignature(payload, sig)) return null;

    const timestamp = Number(parts[2]);
    if (isNaN(timestamp) || Date.now() - timestamp > maxAgeMs) return null;

    return parts;
  } catch {
    return null;
  }
}

/** Gera um token HMAC-SHA256 para a sessão admin. */
export function signAdminSession(email: string): string {
  const payload = `admin:${email}:${Date.now()}`;
  const sig = createSignature(payload);
  return encodeToken(payload, sig);
}

/** Verifica e retorna o email se o token for válido, ou null se inválido. */
export function verifyAdminSession(token: string): string | null {
  const parts = decodeAndValidateToken(token, ADMIN_MAX_AGE_MS);
  return parts ? (parts[1] ?? null) : null;
}

/** Gera um token HMAC para a sessão de cozinha (por slug). */
export function signKitchenSession(slug: string): string {
  const payload = `kitchen:${slug}:${Date.now()}`;
  const sig = createSignature(payload);
  return encodeToken(payload, sig);
}

/** Verifica o token de cozinha. Retorna o slug se válido, null se inválido. */
export function verifyKitchenSession(token: string): string | null {
  const parts = decodeAndValidateToken(token, KITCHEN_MAX_AGE_MS);
  return parts ? (parts[1] ?? null) : null;
}
