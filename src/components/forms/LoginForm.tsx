"use client";

import { useActionState } from "react";
import Link from "next/link";
import { login } from "@/app/login/actions";

export function LoginForm() {
  const [state, formAction, pending] = useActionState(login, undefined);

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
          autoComplete="current-password"
          className="rounded-md border border-[var(--gridline)] bg-transparent px-3 py-2"
        />
      </div>
      {state?.error && <p className="text-sm text-[var(--status-critical)]">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-[var(--foreground)] text-[var(--background)] px-4 py-2 font-medium disabled:opacity-50"
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>
      <p className="text-sm text-[var(--ink-secondary)]">
        No account?{" "}
        <Link href="/signup" className="underline">
          Sign up
        </Link>
      </p>
    </form>
  );
}
