import { createHmac, randomInt, timingSafeEqual } from "crypto";

const COOKIE_NAME = "sf_captcha";
const CHARSET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const TTL_MS = 10 * 60 * 1000;

export { COOKIE_NAME };

function getSecret(): string {
  const s =
    process.env.CAPTCHA_SECRET?.trim() ||
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (s) return s;
  if (process.env.NODE_ENV !== "production") {
    return "dev-only-captcha-secret-not-for-production";
  }
  throw new Error(
    "Set CAPTCHA_SECRET (or rely on SUPABASE_SERVICE_ROLE_KEY) for captcha signing."
  );
}

export function randomCaptchaCode(length = 5): string {
  let out = "";
  for (let i = 0; i < length; i++) {
    out += CHARSET[randomInt(CHARSET.length)];
  }
  return out;
}

export function signCaptchaCode(code: string): string {
  const payload = {
    c: code,
    e: Date.now() + TTL_MS,
  };
  const data = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = createHmac("sha256", getSecret())
    .update(data)
    .digest("base64url");
  return `${data}.${sig}`;
}

/** Returns expected code if token valid and not expired, else null */
export function verifyCaptchaToken(token: string | undefined): string | null {
  if (!token || !token.includes(".")) return null;
  const lastDot = token.lastIndexOf(".");
  const data = token.slice(0, lastDot);
  const sig = token.slice(lastDot + 1);
  const expectedSig = createHmac("sha256", getSecret())
    .update(data)
    .digest("base64url");
  const a = Buffer.from(sig, "utf8");
  const b = Buffer.from(expectedSig, "utf8");
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const payload = JSON.parse(
      Buffer.from(data, "base64url").toString("utf8")
    ) as { c: string; e: number };
    if (typeof payload.c !== "string" || typeof payload.e !== "number")
      return null;
    if (Date.now() > payload.e) return null;
    return payload.c;
  } catch {
    return null;
  }
}

export function captchaCodesMatch(expected: string, answer: string): boolean {
  return expected.toUpperCase() === answer.trim().toUpperCase();
}
