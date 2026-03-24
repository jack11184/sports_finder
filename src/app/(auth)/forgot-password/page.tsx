"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { AuthPageShell } from "@/components/auth/AuthPageShell";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setSent(true);
    setLoading(false);
  };

  if (sent) {
    return (
      <AuthPageShell cardTitle="Check your email">
        <p className="text-center text-text-secondary">
          We sent a password reset link to <strong className="text-text-primary">{email}</strong>
        </p>
        <div className="text-center">
          <Link
            href="/login"
            className="text-sm text-accent hover:text-accent-hover"
          >
            Back to login
          </Link>
        </div>
      </AuthPageShell>
    );
  }

  return (
    <AuthPageShell cardTitle="Reset your password">
      <p className="text-center text-sm text-text-secondary">
        Enter your email and we&apos;ll send you a reset link
      </p>

      <form onSubmit={handleReset} className="space-y-4">
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

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-accent py-3 font-semibold text-text-primary transition-opacity hover:opacity-90 hover:bg-accent-hover disabled:opacity-50"
        >
          {loading ? "Sending..." : "Send Reset Link"}
        </button>
      </form>

      <div className="text-center">
        <Link href="/login" className="text-sm text-accent hover:text-accent-hover">
          Back to login
        </Link>
      </div>
    </AuthPageShell>
  );
}
