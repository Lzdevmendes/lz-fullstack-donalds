import crypto from "crypto";

const SECRET = process.env.NEXTAUTH_SECRET ?? "changeme-set-NEXTAUTH_SECRET-in-env";

const ADMIN_MAX_AGE_MS = 8 * 60 * 60 * 1000;
const KITCHEN_MAX_AGE_MS = 12 * 60 * 60 * 1000;

/** Gera um token HMAC-SHA256 para a sessão admin. */
export function signAdminSession(email: string): string {
  const payload = `admin:${email}:${Date.now()}`;
  const sig = crypto.createHmac("sha256", SECRET).update(payload).digest("hex");
  return Buffer.from(`${payload}:${sig}`).toString("base64");
}

/** Verifica e retorna o email se o token for válido, ou null se inválido. */
export function verifyAdminSession(token: string): string | null {
  try {
    const decoded = Buffer.from(token, "base64").toString("utf-8");
    const parts = decoded.split(":");
    if (parts.length < 4) return null;

    const sig = parts.pop()!;
    const payload = parts.join(":");
    const expected = crypto
      .createHmac("sha256", SECRET)
      .update(payload)
      .digest("hex");

    if (!crypto.timingSafeEqual(Buffer.from(sig, "hex"), Buffer.from(expected, "hex"))) {
      return null;
    }

    const timestamp = Number(parts[2]);
    if (isNaN(timestamp) || Date.now() - timestamp > ADMIN_MAX_AGE_MS) return null;

    return parts[1] ?? null;
  } catch {
    return null;
  }
}

/** Gera um token HMAC para a sessão de cozinha (por slug). */
export function signKitchenSession(slug: string): string {
  const payload = `kitchen:${slug}:${Date.now()}`;
  const sig = crypto.createHmac("sha256", SECRET).update(payload).digest("hex");
  return Buffer.from(`${payload}:${sig}`).toString("base64");
}

/** Verifica o token de cozinha. Retorna o slug se válido, null se inválido. */
export function verifyKitchenSession(token: string): string | null {
  try {
    const decoded = Buffer.from(token, "base64").toString("utf-8");
    const parts = decoded.split(":");
    if (parts.length < 4) return null;

    const sig = parts.pop()!;
    const payload = parts.join(":");
    const expected = crypto
      .createHmac("sha256", SECRET)
      .update(payload)
      .digest("hex");

    if (!crypto.timingSafeEqual(Buffer.from(sig, "hex"), Buffer.from(expected, "hex"))) {
      return null;
    }

    const timestamp = Number(parts[2]);
    if (isNaN(timestamp) || Date.now() - timestamp > KITCHEN_MAX_AGE_MS) return null;

    return parts[1] ?? null;
  } catch {
    return null;
  }
}
