"use client";

import {
  ArrowRight,
  LockKeyhole,
  LogOut,
  Mail,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { FormEvent, ReactNode } from "react";
import { useReducer, useState } from "react";
import { staffRouteItems } from "@/components/admin/staffRoutes";
import { useStaffRoutePrefetch } from "@/components/admin/useStaffRoutePrefetch";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

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
  useStaffRoutePrefetch(next);
  const session = authClient.useSession();
  const [formState, dispatch] = useReducer(formReducer, initialFormState);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    setPending(true);

    try {
      const result = await authClient.signIn.email({
        email: formState.email,
        password: formState.password,
        callbackURL: next,
      });

      if (result.error) {
        setError(result.error.message ?? "Sign in failed.");
        return;
      }

      push(next);
      refresh();
    } catch {
      setError("Sign in failed.");
    } finally {
      setPending(false);
    }
  }

  const signedInEmail = session.data?.user.email;
  const requestedRoute = getRequestedStaffRoute(next);
  const requestedLabel = requestedRoute?.label ?? "staff page";

  return (
    <section className="relative isolate min-h-[100svh] overflow-x-clip bg-[#050505] text-white">
      <header className="relative z-10 flex min-h-16 items-center justify-between gap-3 overflow-hidden px-5 sm:min-h-20 sm:px-8 lg:px-12">
        <Link href="/" className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-xl bg-white text-xl font-black text-black">
            PL
          </span>
          <span className="hidden text-sm font-semibold text-white sm:block">
            Professional Limousine Driver
          </span>
        </Link>

        <Button
          asChild
          variant="outline"
          className="hidden rounded-full border-white/15 bg-transparent text-white hover:border-white hover:bg-white hover:text-black sm:inline-flex"
        >
          <Link href="/">Public site</Link>
        </Button>
      </header>

      <div className="relative z-10 grid min-h-[calc(100svh-4rem)] min-w-0 place-items-center px-5 pb-7 pt-4 sm:min-h-[calc(100svh-5rem)] sm:px-8 sm:pb-10 lg:px-12">
        <div className="w-full max-w-[520px]">
          <Badge
            variant="outline"
            className="mb-4 gap-2 rounded-full border-white/10 bg-white/[0.06] px-4 py-2 text-xs uppercase text-white/70"
          >
            <ShieldCheck className="size-4" aria-hidden />
            Staff access
          </Badge>
          <h1 className="text-4xl font-semibold leading-none text-white sm:text-5xl">
            Sign in.
          </h1>
          <p className="mt-3 text-base leading-6 text-white/60">
            Open {requestedLabel} with your staff account.
          </p>

          <Card className="mt-6 w-full min-w-0 overflow-hidden rounded-[28px] border-0 bg-white text-black shadow-[0_24px_80px_rgba(0,0,0,0.42)]">
            {signedInEmail ? (
              <SignedInPanel email={signedInEmail} next={next} nextLabel={requestedLabel} refresh={refresh} />
            ) : (
              <div className="p-5 sm:p-6">
                <div className="mb-5 flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-black/45">Staff login</p>
                    <h2 className="mt-1 text-3xl font-semibold">Use your account</h2>
                  </div>
                  <span className="grid size-12 shrink-0 place-items-center rounded-full bg-[#050505] text-white">
                    <ShieldCheck className="size-5" aria-hidden />
                  </span>
                </div>
                <CardContent className="p-0">
                  <form onSubmit={onSubmit} className="space-y-3">
                    <AuthField
                      icon={Mail}
                      label="Email"
                      name="email"
                      type="email"
                      value={formState.email}
                      onChange={(value) => dispatch({ type: "email", value })}
                      autoComplete="email"
                      placeholder="Email address"
                      required
                    />
                    <AuthField
                      icon={LockKeyhole}
                      label="Password"
                      name="password"
                      type="password"
                      value={formState.password}
                      onChange={(value) => dispatch({ type: "password", value })}
                      autoComplete="current-password"
                      placeholder="Password"
                      required
                    />

                    {error ? <AuthMessage tone="error">{error}</AuthMessage> : null}

                    <Button
                      type="submit"
                      disabled={pending}
                      className="mt-2 min-h-14 w-full rounded-2xl bg-[#050505] text-base font-black text-white hover:bg-[#171717]"
                    >
                      {pending ? "Signing in" : "Sign in"}
                      <ArrowRight className="size-5" aria-hidden />
                    </Button>
                  </form>
                </CardContent>

                <div className="mt-5 rounded-3xl bg-[#f6f6f6] p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-black">Next page</p>
                      <p className="mt-1 text-sm leading-5 text-black/55">{requestedLabel}</p>
                    </div>
                    <ShieldCheck className="size-5 shrink-0 text-black/40" aria-hidden />
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </section>
  );
}

function SignedInPanel({
  email,
  next,
  nextLabel,
  refresh,
}: {
  email: string;
  next: string;
  nextLabel: string;
  refresh: () => void;
}) {
  return (
    <CardContent className="p-5 sm:p-6">
      <div className="rounded-[28px] bg-[#050505] p-5 text-white">
        <p className="text-sm font-semibold text-white/50">Signed in</p>
        <h2 className="mt-2 text-4xl font-semibold">Staff access</h2>
        <p className="mt-3 break-all text-sm text-white/64">{email}</p>
      </div>

      <div className="mt-5 grid gap-3">
        <Button asChild className="min-h-14 rounded-2xl bg-[#050505] text-base font-black text-white hover:bg-[#171717]">
          <Link href={next}>
            Open {nextLabel}
            <ArrowRight className="size-5" aria-hidden />
          </Link>
        </Button>
        <Button
          type="button"
          variant="secondary"
          className="min-h-14 rounded-2xl bg-[#f1f1f1] text-base font-black text-black hover:bg-[#e4e4e4]"
          onClick={async () => {
            await authClient.signOut();
            refresh();
          }}
        >
          <LogOut className="size-5" aria-hidden />
          Sign out
        </Button>
      </div>
    </CardContent>
  );
}

function AuthField({
  icon: Icon,
  label,
  value,
  onChange,
  type = "text",
  autoComplete,
  name,
  placeholder,
  required,
  minLength,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  autoComplete?: string;
  name: string;
  placeholder?: string;
  required?: boolean;
  minLength?: number;
}) {
  return (
    <div className="rounded-3xl bg-[#f3f3f3] p-4 transition focus-within:shadow-sm">
      <Label htmlFor={name} className="mb-2 flex items-center gap-2 text-xs font-black uppercase text-black/42">
        <Icon className="size-4" aria-hidden />
        {label}
      </Label>
      <Input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        autoComplete={autoComplete}
        placeholder={placeholder}
        required={required}
        minLength={minLength}
        className="min-h-9 border-0 bg-transparent p-0 text-lg font-semibold text-black shadow-none outline-none placeholder:text-black/32 focus-visible:ring-0 focus-visible:ring-offset-0"
      />
    </div>
  );
}

function AuthMessage({
  children,
  tone = "info",
}: {
  children: ReactNode;
  tone?: "info" | "error";
}) {
  return (
    <Alert
      className={cn(
        "rounded-2xl border-0 px-4 py-3 text-sm font-semibold leading-5",
        tone === "error" ? "bg-red-50 text-red-700" : "bg-[#f3f3f3] text-black/64",
      )}
      variant={tone === "error" ? "destructive" : "default"}
      role={tone === "error" ? "alert" : "status"}
    >
      {children}
    </Alert>
  );
}

function formReducer(state: FormState, action: FormAction): FormState {
  return {
    ...state,
    [action.type]: action.value,
  };
}

function getRequestedStaffRoute(next: string) {
  return staffRouteItems.find((item) => item.href === next);
}
