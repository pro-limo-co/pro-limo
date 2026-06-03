"use client";

import { useMutation } from "convex/react";
import { ArrowRight, LogOut } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useReducer, useState } from "react";
import { api } from "@convex/_generated/api";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";

const MIN_PASSWORD_LENGTH = 8;

type Mode = "signin" | "signup";

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
  const claimStaffAccess = useMutation(api.auth.claimStaffAccess);
  const [mode, setMode] = useState<Mode>("signin");
  const [formState, dispatch] = useReducer(formReducer, initialFormState);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setNotice("");

    if (mode === "signup" && formState.password.length < MIN_PASSWORD_LENGTH) {
      setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
      return;
    }

    setPending(true);

    if (mode === "signup") {
      const result = await authClient.signUp.email({
        name: formState.name,
        email: formState.email,
        password: formState.password,
        callbackURL: next,
      });

      if (result.error) {
        setPending(false);
        setError(result.error.message ?? "Could not create the account.");
        return;
      }

      // Account created + signed in. Try to bootstrap staff access — this only
      // succeeds when the email is in DISPATCH_ADMIN_EMAILS on the deployment.
      try {
        await claimStaffAccess({});
      } catch {
        setPending(false);
        setNotice(
          "Account created, but this email is not yet authorized for staff access. Ask an administrator to grant access, then sign in.",
        );
        return;
      }

      setPending(false);
      push(next);
      refresh();
      return;
    }

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

  const isSignup = mode === "signup";

  return (
    <Card>
      <CardHeader>
        <CardDescription>Staff access</CardDescription>
        <CardTitle>{isSignup ? "Create a staff account" : "Dispatch sign in"}</CardTitle>
        <CardDescription>
          {isSignup
            ? "Register with your work email. Access is granted to approved staff addresses."
            : "Use the staff account to view bookings and send driver links."}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={onSubmit} className="grid gap-4">
          {isSignup && (
            <AuthField
              label="Name"
              name="name"
              type="text"
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
            autoComplete={isSignup ? "new-password" : "current-password"}
            minLength={isSignup ? MIN_PASSWORD_LENGTH : undefined}
            required
          />

          {error && (
            <Alert variant="destructive" role="alert">
              {error}
            </Alert>
          )}
          {notice && <Alert role="status">{notice}</Alert>}

          <Button type="submit" disabled={pending} className="press-tap mt-2 w-full">
            {pending
              ? isSignup
                ? "Creating account"
                : "Signing in"
              : isSignup
                ? "Create account"
                : "Sign in"}
            <ArrowRight className="size-4" aria-hidden />
          </Button>
        </form>

        <div className="mt-4 text-center text-sm text-muted-foreground">
          {isSignup ? "Already have an account?" : "Need a staff account?"}{" "}
          <button
            type="button"
            className="font-medium text-foreground underline underline-offset-4"
            onClick={() => {
              setMode(isSignup ? "signin" : "signup");
              setError("");
              setNotice("");
            }}
          >
            {isSignup ? "Sign in" : "Create one"}
          </button>
        </div>
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
  minLength,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  autoComplete?: string;
  name: string;
  required?: boolean;
  minLength?: number;
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
        minLength={minLength}
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
