import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  COOKIE_NAME,
  captchaCodesMatch,
  verifyCaptchaToken,
} from "@/lib/captcha-token";

export async function POST(request: NextRequest) {
  let body: { answer?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid body" }, { status: 400 });
  }

  const answer = typeof body.answer === "string" ? body.answer : "";
  const cookieStore = await cookies();
  const raw = cookieStore.get(COOKIE_NAME)?.value;
  const expected = verifyCaptchaToken(raw);

  if (!expected || !captchaCodesMatch(expected, answer)) {
    cookieStore.delete(COOKIE_NAME);
    return NextResponse.json(
      { ok: false, error: "Incorrect or expired verification code" },
      { status: 403 }
    );
  }

  cookieStore.delete(COOKIE_NAME);
  return NextResponse.json({ ok: true });
}
