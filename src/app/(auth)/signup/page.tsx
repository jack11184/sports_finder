"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { AuthPageShell } from "@/components/auth/AuthPageShell";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [captchaAnswer, setCaptchaAnswer] = useState("");
  const [captchaKey, setCaptchaKey] = useState(0);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const refreshCaptcha = () => {
    setCaptchaKey((k) => k + 1);
    setCaptchaAnswer("");
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (!captchaAnswer.trim()) {
      setError("Enter the characters shown in the image.");
      return;
    }

    setLoading(true);

    const verifyRes = await fetch("/api/captcha/verify", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answer: captchaAnswer }),
    });

    if (!verifyRes.ok) {
      const data = (await verifyRes.json().catch(() => ({}))) as {
        error?: string;
      };
      setError(data.error || "Verification failed. Try a new code.");
      setLoading(false);
      refreshCaptcha();
      return;
    }

    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      refreshCaptcha();
      return;
    }

    router.push("/onboarding");
    router.refresh();
  };

  return (
    <AuthPageShell cardTitle="Create your account">
      <form onSubmit={handleSignup} className="space-y-4">
        {error && (
          <div className="rounded-lg bg-red-500/10 p-3 text-sm text-red-500">
            {error}
          </div>
        )}

        <div>
          <label
            htmlFor="email"
            className="mb-2 block text-sm text-text-secondary"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-lg border border-border bg-bg-input px-4 py-3 text-text-primary placeholder-text-muted outline-none transition-colors focus:border-accent"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="mb-2 block text-sm text-text-secondary"
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full rounded-lg border border-border bg-bg-input px-4 py-3 text-text-primary placeholder-text-muted outline-none transition-colors focus:border-accent"
            placeholder="••••••••"
          />
        </div>

        <div>
          <label
            htmlFor="confirmPassword"
            className="mb-2 block text-sm text-text-secondary"
          >
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="w-full rounded-lg border border-border bg-bg-input px-4 py-3 text-text-primary placeholder-text-muted outline-none transition-colors focus:border-accent"
            placeholder="••••••••"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm text-text-secondary">
              Type the characters you see
            </span>
            <button
              type="button"
              onClick={refreshCaptcha}
              className="text-sm text-accent hover:text-accent-hover"
            >
              New code
            </button>
          </div>
          <div className="overflow-hidden rounded-lg border border-border bg-bg-input">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`/api/captcha?k=${captchaKey}`}
              alt="Verification code"
              width={200}
              height={64}
              className="block h-16 w-[200px] max-w-full"
            />
          </div>
          <input
            id="captcha"
            type="text"
            value={captchaAnswer}
            onChange={(e) => setCaptchaAnswer(e.target.value)}
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
            maxLength={12}
            className="w-full rounded-lg border border-border bg-bg-input px-4 py-3 font-mono text-lg tracking-widest text-text-primary placeholder-text-muted outline-none transition-colors focus:border-accent"
            placeholder="Enter code"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-accent py-3 font-semibold text-text-primary transition-opacity hover:opacity-90 hover:bg-accent-hover disabled:opacity-50"
        >
          {loading ? "Creating account..." : "Create Account"}
        </button>
      </form>

      <div className="text-center">
        <p className="text-sm text-text-secondary">
          Already have an account?{" "}
          <Link href="/login" className="text-accent hover:text-accent-hover">
            Sign in
          </Link>
        </p>
      </div>
    </AuthPageShell>
  );
}
