import { NextResponse, type NextRequest } from "next/server";

import { clientIpFrom, inspectRequest, type AttackSnapshot } from "@/lib/shield";

export const config = {
  // Everything except Next's own static output and the alert endpoint itself.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/security).*)"],
};

const securityHeaders: [string, string][] = [
  ["X-Content-Type-Options", "nosniff"],
  ["X-Frame-Options", "DENY"],
  ["Referrer-Policy", "strict-origin-when-cross-origin"],
  ["X-DNS-Prefetch-Control", "off"],
  ["Permissions-Policy", "camera=(), microphone=(), geolocation=(), interest-cohort=()"],
];

function withSecurityHeaders(response: NextResponse) {
  for (const [name, value] of securityHeaders) response.headers.set(name, value);
  return response;
}

// Middleware runs on the edge runtime, where nodemailer cannot be loaded, so the alert is handed
// to a Node route. Deliberately not awaited: an inbox problem must never slow down a response.
function dispatchAlert(request: NextRequest, attack: AttackSnapshot) {
  const secret = process.env.SECURITY_ALERT_SECRET;
  if (!secret) return;

  void fetch(new URL("/api/security/alert", request.nextUrl.origin), {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-shield-key": secret },
    body: JSON.stringify({ attack, host: request.nextUrl.host }),
  }).catch(() => {
    // An unreachable alert endpoint must not surface to the visitor being blocked.
  });
}

export function proxy(request: NextRequest) {
  const ip = clientIpFrom(request.headers);
  const verdict = inspectRequest(ip, request.nextUrl.pathname, request.headers.get("user-agent") ?? "");

  if (process.env.SHIELD_DEBUG === "true") {
    console.log(`[shield] ip=${ip} blocked=${verdict.blocked} attack=${Boolean(verdict.attack)}`);
  }

  if (verdict.attack) dispatchAlert(request, verdict.attack);

  if (verdict.blocked) {
    const response = NextResponse.json(
      { message: "Too many requests from this connection. Please slow down and try again shortly." },
      { status: 429 },
    );
    response.headers.set("Retry-After", String(verdict.retryAfterSeconds));
    return withSecurityHeaders(response);
  }

  return withSecurityHeaders(NextResponse.next());
}
