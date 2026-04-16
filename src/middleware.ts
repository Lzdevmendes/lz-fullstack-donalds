import { NextRequest, NextResponse } from "next/server";

const SECRET =
  process.env.NEXTAUTH_SECRET ?? "changeme-set-NEXTAUTH_SECRET-in-env";

/** Converts a hex string to Uint8Array */
function hexToBytes(hex: string): Uint8Array {
  const pairs = hex.match(/.{1,2}/g) ?? [];
  return new Uint8Array(pairs.map((b) => parseInt(b, 16)));
}

/** Verifies an HMAC-SHA256 token using the Web Crypto API (Edge Runtime compatible) */
async function verifyToken(token: string): Promise<boolean> {
  try {
    const decoded = atob(token);
    const parts = decoded.split(":");
    if (parts.length < 4) return false;

    const sig = parts.pop()!;
    const payload = parts.join(":");

    const encoder = new TextEncoder();
    const key = await globalThis.crypto.subtle.importKey(
      "raw",
      encoder.encode(SECRET),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"],
    );

    return await globalThis.crypto.subtle.verify(
      "HMAC",
      key,
      hexToBytes(sig),
      encoder.encode(payload),
    );
  } catch {
    return false;
  }
}

/** Returns the slug encoded in the kitchen token, or null if invalid */
async function verifyKitchenToken(
  token: string,
  slug: string,
): Promise<boolean> {
  try {
    const decoded = atob(token);
    const parts = decoded.split(":");
    if (parts.length < 4) return false;

    const tokenSlug = parts[1]; // kitchen:{slug}:{timestamp}:{sig}
    if (tokenSlug !== slug) return false;

    return verifyToken(token);
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // proteção do painel admin
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const session = request.cookies.get("admin_session");
    if (!session?.value || !(await verifyToken(session.value))) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  // proteção da cozinha (slug extraído da URL)
  const kitchenMatch = pathname.match(/^\/([^/]+)\/kitchen/);
  if (kitchenMatch) {
    const slug = kitchenMatch[1];
    const kitchenCookie = request.cookies.get(`kitchen_${slug}`);
    if (
      !kitchenCookie?.value ||
      !(await verifyKitchenToken(kitchenCookie.value, slug))
    ) {
      return NextResponse.redirect(
        new URL(`/${slug}/kitchen/login`, request.url),
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/:slug/kitchen"],
};
