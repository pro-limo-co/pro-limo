"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useReducer, useState } from "react";
import { authClient } from "@/lib/auth-client";

type Mode = "sign-in" | "sign-up";

type FormState = {
  name: string;
  email: string;
  password: string;
};

type FormAction =
  | { type: "name"; value: string }
  | { type: "email"; value: string }
  | { type: "password"; value: string };

const initialFormState: FormState = {
  name: "",
  email: "",
  password: "",
};

export function AuthPanel({ next }: { next: string }) {
  const { push, refresh } = useRouter();
  const session = authClient.useSession();
  const [mode, setMode] = useState<Mode>("sign-in");
  const [formState, dispatch] = useReducer(formReducer, initialFormState);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");

    const result =
      mode === "sign-in"
        ? await authClient.signIn.email({
            email: formState.email,
            password: formState.password,
            callbackURL: next,
          })
        : await authClient.signUp.email({
            name: formState.name,
            email: formState.email,
            password: formState.password,
            callbackURL: next,
          });

    setPending(false);
    if (result.error) {
      setError(result.error.message ?? "Authentication failed.");
      return;
    }

    push(next);
    refresh();
  }

  if (session.data?.session) {
    return (
      <div className="surface-raised rounded-2xl p-8">
        <p className="eyebrow">Signed in</p>
        <h1 className="display-md mt-5">Dispatch access</h1>
        <p className="mt-4 text-[0.95rem] leading-[1.7] text-[color:var(--color-bone-dim)]">
          {session.data.user.email}
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-3">
          <Link href={next} className="btn btn-primary">
            Continue
          </Link>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={async () => {
              await authClient.signOut();
              refresh();
            }}
          >
            Sign out
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="surface-raised rounded-2xl p-8">
      <p className="eyebrow">Staff access</p>
      <h1 className="display-md mt-5">Dispatch sign in</h1>

      <div className="mt-8 grid grid-cols-2 gap-1 rounded-xl bg-[color:var(--color-ink)]/50 p-1">
        <button
          type="button"
          onClick={() => setMode("sign-in")}
          className={tabClass(mode === "sign-in")}
        >
          Sign in
        </button>
        <button
          type="button"
          onClick={() => setMode("sign-up")}
          className={tabClass(mode === "sign-up")}
        >
          Create
        </button>
      </div>

      <form onSubmit={onSubmit} className="mt-6 grid gap-4">
        {mode === "sign-up" && (
          <AuthField
            label="Name"
            name="name"
            value={formState.name}
            onChange={(value) => dispatch({ type: "name", value })}
            autoComplete="name"
            required
          />
        )}
        <AuthField
          label="Email"
          name="email"
          type="email"
          value={formState.email}
          onChange={(value) => dispatch({ type: "email", value })}
          autoComplete="email"
          required
        />
        <AuthField
          label="Password"
          name="password"
          type="password"
          value={formState.password}
          onChange={(value) => dispatch({ type: "password", value })}
          autoComplete={mode === "sign-in" ? "current-password" : "new-password"}
          required
        />

        {error && (
          <p className="rounded-lg border border-red-400/40 bg-red-950/20 px-4 py-3 text-[0.86rem] text-red-100">
            {error}
          </p>
        )}

        <button type="submit" disabled={pending} className="btn btn-primary mt-2 disabled:cursor-not-allowed disabled:opacity-60">
          {pending ? "Working" : mode === "sign-in" ? "Sign in" : "Create account"}
        </button>
      </form>
    </div>
  );
}

function AuthField({
  label,
  value,
  onChange,
  type = "text",
  autoComplete,
  name,
  required,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  autoComplete?: string;
  name: string;
  required?: boolean;
}) {
  return (
    <label className="block bg-[color:var(--color-ink-soft)] px-5 py-4">
      <span className="block font-condensed text-[0.68rem] tracking-[0.22em] uppercase text-[color:var(--color-pewter)]">
        {label}
      </span>
      <input
        name={name}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        autoComplete={autoComplete}
        required={required}
        className="field mt-1 text-[0.95rem]"
      />
    </label>
  );
}

function tabClass(active: boolean) {
  return [
    "h-11 rounded-lg font-condensed text-[0.78rem] tracking-[0.16em] uppercase transition-colors",
    active
      ? "bg-[color:var(--color-bone)] text-[color:var(--color-ink)]"
      : "text-[color:var(--color-bone-dim)] hover:text-[color:var(--color-bone)]",
  ].join(" ");
}

function formReducer(state: FormState, action: FormAction): FormState {
  return {
    ...state,
    [action.type]: action.value,
  };
}
