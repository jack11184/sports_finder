import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  COOKIE_NAME,
  randomCaptchaCode,
  signCaptchaCode,
} from "@/lib/captcha-token";
import { captchaToSvg } from "@/lib/captcha-svg";

export async function GET() {
  const code = randomCaptchaCode(5);
  const token = signCaptchaCode(code);

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 600,
  });

  const svg = captchaToSvg(code);

  return new NextResponse(svg, {
    status: 200,
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "no-store, no-cache, must-revalidate",
    },
  });
}
