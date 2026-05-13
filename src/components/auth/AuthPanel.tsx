"use client";

import { ArrowRight, LogOut } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useReducer, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";

type FormState = {
  email: string;
  password: string;
};

type FormAction =
  | { type: "email"; value: string }
  | { type: "password"; value: string };

const initialFormState: FormState = {
  email: "",
  password: "",
};

export function AuthPanel({ next }: { next: string }) {
  const { push, refresh } = useRouter();
  const session = authClient.useSession();
  const [formState, dispatch] = useReducer(formReducer, initialFormState);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");

    const result = await authClient.signIn.email({
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
      <Card>
        <CardHeader>
          <CardDescription>Signed in</CardDescription>
          <CardTitle>Dispatch access</CardTitle>
          <CardDescription>{session.data.user.email}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 sm:flex-row">
          <Button asChild>
            <Link href={next}>
              Continue
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={async () => {
              await authClient.signOut();
              refresh();
            }}
          >
            <LogOut className="size-4" aria-hidden />
            Sign out
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardDescription>Staff access</CardDescription>
        <CardTitle>Dispatch sign in</CardTitle>
        <CardDescription>Use the staff account to view bookings and send driver links.</CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={onSubmit} className="grid gap-4">
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
            autoComplete="current-password"
            required
          />

          {error && (
            <p className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
              {error}
            </p>
          )}

          <Button type="submit" disabled={pending} className="mt-2 w-full">
            {pending ? "Signing in" : "Sign in"}
            <ArrowRight className="size-4" aria-hidden />
          </Button>
        </form>
      </CardContent>
    </Card>
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
    <div className="grid gap-2">
      <Label htmlFor={name}>{label}</Label>
      <Input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        autoComplete={autoComplete}
        required={required}
      />
    </div>
  );
}

function formReducer(state: FormState, action: FormAction): FormState {
  return {
    ...state,
    [action.type]: action.value,
  };
}
