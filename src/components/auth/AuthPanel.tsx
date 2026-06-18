"use client";

import { useMutation } from "convex/react";
import {
  ArrowRight,
  ChevronDown,
  Clock3,
  LockKeyhole,
  LogOut,
  Mail,
  MapPin,
  RadioTower,
  Route,
  ShieldCheck,
  User,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { FormEvent, ReactNode } from "react";
import { useReducer, useState } from "react";
import { api } from "@convex/_generated/api";
import { staffRouteItems } from "@/components/admin/staffRoutes";
import { useStaffRoutePrefetch } from "@/components/admin/useStaffRoutePrefetch";
import { StaffRouteMap } from "@/components/auth/StaffRouteMap";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

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

const dispatchRows = [
  { icon: MapPin, label: "Pickup queue", value: "Portland airport, downtown, private homes" },
  { icon: Route, label: "Dropoff desk", value: "Quotes, handoffs, payments, route notes" },
  { icon: Clock3, label: "Shift window", value: "Tonight 6:00 PM - close" },
];

const tripStats = [
  { label: "Open requests", value: "12" },
  { label: "Quoted", value: "07" },
  { label: "Drivers active", value: "04" },
];

export function AuthPanel({ next }: { next: string }) {
  const { push, refresh } = useRouter();
  useStaffRoutePrefetch(next);
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

      try {
        await claimStaffAccess({});
      } catch {
        setPending(false);
        setNotice(
          "Account created. This email still needs staff approval before dispatch access opens.",
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

  const isSignup = mode === "signup";
  const signedInEmail = session.data?.user.email;

  return (
    <section className="relative isolate min-h-[100svh] overflow-x-clip bg-[#050505]">
      <div className="absolute inset-x-0 top-0 h-[34rem] bg-[radial-gradient(circle_at_15%_5%,rgba(255,255,255,0.18),transparent_30%),radial-gradient(circle_at_72%_0%,rgba(200,169,106,0.16),transparent_28%)]" />
      <div className="absolute inset-y-0 right-0 hidden w-[42%] bg-white/[0.03] lg:block" />

      <header className="relative z-10 flex min-h-20 items-center justify-between gap-3 overflow-hidden px-5 sm:px-8 lg:px-12">
        <Link href="/" className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-xl bg-white text-xl font-black text-black">
            PL
          </span>
          <span className="hidden text-sm font-semibold text-white sm:block">
            Professional Limousine Driver
          </span>
        </Link>

        <nav className="hidden items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] p-1 text-sm text-white/70 md:flex">
          {staffRouteItems.map((item) => (
            <Link
              key={item.href}
              href={`/auth/sign-in?next=${encodeURIComponent(item.href)}`}
              className="rounded-full px-4 py-2 transition hover:bg-white hover:text-black"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <Button
          asChild
          variant="outline"
          className="hidden rounded-full border-white/15 bg-transparent text-white hover:border-white hover:bg-white hover:text-black sm:inline-flex"
        >
          <Link href="/">Public site</Link>
        </Button>
      </header>

      <div className="relative z-10 grid min-h-[calc(100svh-5rem)] min-w-0 overflow-x-clip px-5 pb-8 pt-4 sm:px-8 lg:grid-cols-[minmax(0,1fr)_minmax(420px,520px)] lg:gap-10 lg:px-12 lg:pb-12">
        <div className="flex min-w-0 max-w-full flex-col justify-between gap-8">
          <div className="max-w-full pt-8 lg:max-w-5xl lg:pt-16">
            <Badge
              variant="outline"
              className="mb-5 gap-2 rounded-full border-white/10 bg-white/[0.06] px-4 py-2 text-xs uppercase text-white/70"
            >
              <RadioTower className="size-4" aria-hidden />
              Staff operations
            </Badge>
            <h1 className="max-w-[calc(100vw-2.5rem)] text-5xl font-semibold leading-[0.94] text-white sm:max-w-4xl sm:text-7xl sm:leading-[0.88] lg:text-8xl">
              Run the ride desk.
            </h1>
            <p className="mt-6 max-w-[calc(100vw-2.5rem)] text-lg leading-8 text-white/64 sm:max-w-2xl">
              Sign in to quote trips, assign chauffeurs, update payment links, and keep the evening board moving.
            </p>
          </div>

          <div className="grid min-w-0 max-w-full gap-4 overflow-x-clip xl:grid-cols-[minmax(320px,0.72fr)_minmax(420px,1fr)]">
            <DispatchCommandPanel />
            <DispatchMapPanel />
          </div>
        </div>

        <aside className="flex min-w-0 items-center lg:justify-end">
          <Card className="w-full min-w-0 max-w-[calc(100vw-2.5rem)] overflow-hidden rounded-[32px] border-0 bg-white text-black shadow-[0_28px_120px_rgba(0,0,0,0.48)] sm:max-w-full">
            {signedInEmail ? (
              <SignedInPanel email={signedInEmail} next={next} refresh={refresh} />
            ) : (
              <div className="p-5 sm:p-6">
                <CardHeader className="mb-6 flex-row items-center justify-between space-y-0 p-0">
                  <div className="space-y-1">
                    <CardDescription className="font-semibold text-black/45">Staff access</CardDescription>
                    <CardTitle className="text-4xl font-black">
                      {isSignup ? "Create account" : "Sign in"}
                    </CardTitle>
                  </div>
                  <div className="grid size-12 place-items-center rounded-full bg-[#050505] text-white">
                    <ShieldCheck className="size-5" aria-hidden />
                  </div>
                </CardHeader>

                <div className="mb-5 grid grid-cols-2 rounded-full bg-[#f1f1f1] p-1">
                  <ModeButton active={!isSignup} onClick={() => switchMode("signin")}>
                    Sign in
                  </ModeButton>
                  <ModeButton active={isSignup} onClick={() => switchMode("signup")}>
                    New staff
                  </ModeButton>
                </div>

                <CardContent className="p-0">
                  <form onSubmit={onSubmit} className="space-y-3">
                    {isSignup ? (
                      <AuthField
                        icon={User}
                        label="Name"
                        name="name"
                        type="text"
                        value={formState.name}
                        onChange={(value) => dispatch({ type: "name", value })}
                        autoComplete="name"
                        placeholder="Dispatcher name"
                        required
                      />
                    ) : null}
                    <AuthField
                      icon={Mail}
                      label="Email"
                      name="email"
                      type="email"
                      value={formState.email}
                      onChange={(value) => dispatch({ type: "email", value })}
                      autoComplete="email"
                      placeholder="staff@prolimodriver.com"
                      required
                    />
                    <AuthField
                      icon={LockKeyhole}
                      label="Password"
                      name="password"
                      type="password"
                      value={formState.password}
                      onChange={(value) => dispatch({ type: "password", value })}
                      autoComplete={isSignup ? "new-password" : "current-password"}
                      minLength={isSignup ? MIN_PASSWORD_LENGTH : undefined}
                      placeholder={isSignup ? "At least 8 characters" : "Enter password"}
                      required
                    />

                    {error ? <AuthMessage tone="error">{error}</AuthMessage> : null}
                    {notice ? <AuthMessage>{notice}</AuthMessage> : null}

                    <Button
                      type="submit"
                      disabled={pending}
                      className="mt-2 min-h-14 w-full rounded-2xl bg-[#050505] text-base font-black text-white hover:bg-[#171717]"
                    >
                      {pending
                        ? isSignup
                          ? "Creating account"
                          : "Signing in"
                        : isSignup
                          ? "Create staff account"
                          : "Open dispatch"}
                      <ArrowRight className="size-5" aria-hidden />
                    </Button>
                  </form>
                </CardContent>

                <Card className="mt-5 rounded-3xl border-0 bg-[#f6f6f6] p-4 shadow-none">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-black">Approved staff only</p>
                      <p className="mt-1 text-sm leading-5 text-black/55">
                        New accounts open after the email is listed for dispatch access.
                      </p>
                    </div>
                    <ChevronDown className="size-5 shrink-0 text-black/40" aria-hidden />
                  </div>
                </Card>
              </div>
            )}
          </Card>
        </aside>
      </div>
    </section>
  );

  function switchMode(nextMode: Mode) {
    setMode(nextMode);
    setError("");
    setNotice("");
  }
}

function DispatchCommandPanel() {
  return (
    <Card className="w-full min-w-0 max-w-[calc(100vw-2.5rem)] rounded-[30px] border-white/10 bg-white text-black shadow-[0_18px_60px_rgba(0,0,0,0.3)] sm:max-w-full">
      <CardHeader className="border-b border-black/10 p-5">
        <CardDescription className="font-semibold text-black/45">Get the desk ready</CardDescription>
        <CardTitle className="text-3xl font-black">Dispatch queue</CardTitle>
      </CardHeader>

      <CardContent className="p-5">
        <div className="relative grid gap-3">
          <span className="absolute left-[21px] top-12 h-20 w-px bg-[#050505]/18" aria-hidden />
          {dispatchRows.map((row) => (
            <div key={row.label} className="grid min-w-0 grid-cols-[44px_minmax(0,1fr)] items-center gap-3 rounded-2xl bg-[#f3f3f3] p-4">
              <span className="relative z-10 grid size-11 place-items-center rounded-full bg-white text-black">
                <row.icon className="size-5" aria-hidden />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-black">{row.label}</span>
                <span className="mt-1 block text-sm leading-5 text-black/55">{row.value}</span>
              </span>
            </div>
          ))}
        </div>

        <div className="mt-5 grid gap-2 sm:grid-cols-3">
          {tripStats.map((stat) => (
            <div key={stat.label} className="min-w-0 rounded-2xl bg-[#050505] p-4 text-white">
              <p className="text-3xl font-black">{stat.value}</p>
              <p className="mt-1 text-xs font-semibold leading-4 text-white/52">{stat.label}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function DispatchMapPanel() {
  return <StaffRouteMap />;
}

function SignedInPanel({
  email,
  next,
  refresh,
}: {
  email: string;
  next: string;
  refresh: () => void;
}) {
  return (
    <CardContent className="p-5 sm:p-6">
      <div className="rounded-[28px] bg-[#050505] p-5 text-white">
        <p className="text-sm font-semibold text-white/50">Signed in</p>
        <h2 className="mt-2 text-4xl font-semibold">Dispatch access</h2>
        <p className="mt-3 break-all text-sm text-white/64">{email}</p>
      </div>

      <div className="mt-5 grid gap-3">
        <Button asChild className="min-h-14 rounded-2xl bg-[#050505] text-base font-black text-white hover:bg-[#171717]">
          <Link href={next}>
            Continue
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

function ModeButton({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      onClick={onClick}
      className={cn(
        "min-h-11 rounded-full text-sm font-black hover:bg-transparent",
        active ? "bg-[#050505] text-white shadow-sm hover:bg-[#050505] hover:text-white" : "text-black/48 hover:text-black",
      )}
    >
      {children}
    </Button>
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
