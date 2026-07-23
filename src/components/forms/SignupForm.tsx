"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signup } from "@/app/signup/actions";

export function SignupForm() {
  const [state, formAction, pending] = useActionState(signup, undefined);

  if (state?.checkEmail) {
    return (
      <p className="max-w-sm text-sm text-[var(--ink-secondary)]">
        Check your email to confirm your account, then sign in.
      </p>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-4 w-full max-w-sm">
      <div className="flex flex-col gap-1">
        <label htmlFor="email" className="text-sm text-[var(--ink-secondary)]">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="rounded-md border border-[var(--gridline)] bg-transparent px-3 py-2"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="password" className="text-sm text-[var(--ink-secondary)]">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={6}
          autoComplete="new-password"
          className="rounded-md border border-[var(--gridline)] bg-transparent px-3 py-2"
        />
      </div>
      {state?.error && <p className="text-sm text-[var(--status-critical)]">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-[var(--foreground)] text-[var(--background)] px-4 py-2 font-medium disabled:opacity-50"
      >
        {pending ? "Signing up…" : "Sign up"}
      </button>
      <p className="text-sm text-[var(--ink-secondary)]">
        Already have an account?{" "}
        <Link href="/login" className="underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
