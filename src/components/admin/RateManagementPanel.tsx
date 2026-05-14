"use client";

import type { FunctionReturnType } from "convex/server";
import { useMutation, useQuery } from "convex/react";
import { CheckCircle2, Save, Settings2 } from "lucide-react";
import Link from "next/link";
import { type ReactNode, useEffect, useReducer, useState } from "react";
import { api } from "@convex/_generated/api";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { centsToDollars, dollarsToCents, formatMoneyFromCents } from "@/lib/rate-calculator";
import { authClient } from "@/lib/auth-client";

type RateProfile = FunctionReturnType<typeof api.rates.list>[number];

type RateProfileDraft = {
  key: string;
  name: string;
  vehicleType: string;
  active: "true" | "false";
  baseFee: string;
  minimumFare: string;
  includedMiles: string;
  perMile: string;
  perHour: string;
  airportFee: string;
  meetAndGreet: string;
  extraStop: string;
  gratuityPercent: string;
  taxPercent: string;
  peakSurchargePercent: string;
  notes: string;
  sortOrder: string;
};

type DraftAction =
  | { type: keyof RateProfileDraft; value: string }
  | { type: "sync"; profile: RateProfile };

export function RateManagementPanel() {
  const viewer = useQuery(api.auth.getViewer);
  const profiles = useQuery(api.rates.list, viewer?.staff ? {} : "skip");
  const ensureDefaults = useMutation(api.rates.ensureDefaults);
  const session = authClient.useSession();
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  async function handleInstallDefaults() {
    setPending(true);
    setMessage("");
    try {
      const result = await ensureDefaults({});
      setMessage(
        result.inserted > 0
          ? `Installed ${result.inserted} default rate profiles.`
          : "Saved rate profiles are already installed.",
      );
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not install defaults.");
    } finally {
      setPending(false);
    }
  }

  if (viewer === undefined || session.isPending) {
    return (
      <RatesShell>
        <Card className="mt-8">
          <CardContent className="py-6 text-sm text-muted-foreground">
            Loading rate settings.
          </CardContent>
        </Card>
      </RatesShell>
    );
  }

  if (!viewer.identity) {
    return (
      <RatesShell>
        <Card className="mt-8 max-w-xl">
          <CardHeader>
            <CardTitle>Staff access required</CardTitle>
            <CardDescription>Sign in before editing vehicle, hourly, distance, and fee rules.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild size="lg">
              <Link href="/auth/sign-in?next=/admin/rates">Sign in</Link>
            </Button>
          </CardContent>
        </Card>
      </RatesShell>
    );
  }

  if (!viewer.staff) {
    return (
      <RatesShell showSignOut>
        <Card className="mt-8 max-w-xl">
          <CardHeader>
            <CardTitle>Rates are staff-only</CardTitle>
            <CardDescription>Claim staff access from the dispatch queue first.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild size="lg">
              <Link href="/admin/dispatch">Open dispatch</Link>
            </Button>
          </CardContent>
        </Card>
      </RatesShell>
    );
  }

  const canEdit = viewer.staff.role === "admin";
  const savedProfileCount = profiles?.filter((profile) => profile.source === "saved").length ?? 0;

  return (
    <RatesShell showSignOut>
      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <StatCard label="Profiles" value={profiles === undefined ? "Loading" : String(profiles.length)} />
        <StatCard label="Saved" value={String(savedProfileCount)} />
        <StatCard label="Access" value={canEdit ? "Admin" : "View only"} />
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-foreground">Rate card</p>
          <p className="text-sm text-muted-foreground">
            Profiles cover distance, hourly, minimum, airport, meet-and-greet, stop, gratuity, tax, and peak rules.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button asChild variant="outline">
            <Link href="/admin/dispatch">Dispatch queue</Link>
          </Button>
          <Button type="button" disabled={!canEdit || pending} onClick={() => void handleInstallDefaults()}>
            <Settings2 className="size-4" aria-hidden />
            Install defaults
          </Button>
        </div>
      </div>

      {message && (
        <Alert className="mt-4" role="status" aria-live="polite">
          {message}
        </Alert>
      )}

      <div className="mt-6 grid gap-4">
        {profiles === undefined ? (
          <Card>
            <CardContent className="py-6 text-sm text-muted-foreground">
              Loading profiles.
            </CardContent>
          </Card>
        ) : (
          profiles.map((profile) => (
            <RateProfileCard key={profile.key} canEdit={canEdit} profile={profile} />
          ))
        )}
      </div>
    </RatesShell>
  );
}

function RateProfileCard({
  canEdit,
  profile,
}: {
  canEdit: boolean;
  profile: RateProfile;
}) {
  const upsert = useMutation(api.rates.upsert);
  const [draft, dispatch] = useReducer(draftReducer, profile, createDraft);
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  useEffect(() => {
    dispatch({ type: "sync", profile });
  }, [profile]);

  async function handleSave() {
    setPending(true);
    setMessage("");
    try {
      await upsert({
        profileId: profile.profileId,
        key: draft.key,
        name: draft.name,
        vehicleType: draft.vehicleType,
        active: draft.active === "true",
        baseFeeCents: dollarsToCents(draft.baseFee),
        minimumFareCents: dollarsToCents(draft.minimumFare),
        includedMiles: readNumber(draft.includedMiles),
        perMileCents: dollarsToCents(draft.perMile),
        perHourCents: dollarsToCents(draft.perHour),
        airportFeeCents: dollarsToCents(draft.airportFee),
        meetAndGreetCents: dollarsToCents(draft.meetAndGreet),
        extraStopCents: dollarsToCents(draft.extraStop),
        gratuityPercent: readNumber(draft.gratuityPercent),
        taxPercent: readNumber(draft.taxPercent),
        peakSurchargePercent: readNumber(draft.peakSurchargePercent),
        notes: draft.notes.trim() || undefined,
        sortOrder: readNumber(draft.sortOrder),
      });
      setMessage("Rate profile saved.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not save rate profile.");
    } finally {
      setPending(false);
    }
  }

  const disabled = !canEdit || pending;

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={profile.active ? "default" : "outline"}>
                {profile.active ? "Active" : "Inactive"}
              </Badge>
              <Badge variant="secondary">{profile.source === "saved" ? "Saved" : "Default preview"}</Badge>
            </div>
            <CardTitle className="mt-3">{profile.name}</CardTitle>
            <CardDescription>{profile.vehicleType}</CardDescription>
          </div>
          <div className="rounded-md border bg-muted/30 px-3 py-2 text-sm font-medium text-foreground">
            Min {formatMoneyFromCents(profile.minimumFareCents)}
          </div>
        </div>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid gap-3 md:grid-cols-4">
          <TextField scope={profile.key} label="Name" value={draft.name} disabled={disabled} onChange={(value) => dispatch({ type: "name", value })} />
          <TextField scope={profile.key} label="Vehicle type" value={draft.vehicleType} disabled={disabled} onChange={(value) => dispatch({ type: "vehicleType", value })} />
          <TextField scope={profile.key} label="Key" value={draft.key} disabled={disabled} onChange={(value) => dispatch({ type: "key", value })} />
          <div>
            <Label>Status</Label>
            <Select
              value={draft.active}
              disabled={disabled}
              onValueChange={(value) => dispatch({ type: "active", value })}
            >
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="pld-ui">
                <SelectItem value="true">Active</SelectItem>
                <SelectItem value="false">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-4">
          <TextField scope={profile.key} label="Base fee" value={draft.baseFee} disabled={disabled} inputMode="decimal" onChange={(value) => dispatch({ type: "baseFee", value })} />
          <TextField scope={profile.key} label="Minimum fare" value={draft.minimumFare} disabled={disabled} inputMode="decimal" onChange={(value) => dispatch({ type: "minimumFare", value })} />
          <TextField scope={profile.key} label="Included miles" value={draft.includedMiles} disabled={disabled} inputMode="decimal" onChange={(value) => dispatch({ type: "includedMiles", value })} />
          <TextField scope={profile.key} label="Per mile" value={draft.perMile} disabled={disabled} inputMode="decimal" onChange={(value) => dispatch({ type: "perMile", value })} />
          <TextField scope={profile.key} label="Per hour" value={draft.perHour} disabled={disabled} inputMode="decimal" onChange={(value) => dispatch({ type: "perHour", value })} />
          <TextField scope={profile.key} label="Airport fee" value={draft.airportFee} disabled={disabled} inputMode="decimal" onChange={(value) => dispatch({ type: "airportFee", value })} />
          <TextField scope={profile.key} label="Meet and greet" value={draft.meetAndGreet} disabled={disabled} inputMode="decimal" onChange={(value) => dispatch({ type: "meetAndGreet", value })} />
          <TextField scope={profile.key} label="Extra stop" value={draft.extraStop} disabled={disabled} inputMode="decimal" onChange={(value) => dispatch({ type: "extraStop", value })} />
          <TextField scope={profile.key} label="Gratuity %" value={draft.gratuityPercent} disabled={disabled} inputMode="decimal" onChange={(value) => dispatch({ type: "gratuityPercent", value })} />
          <TextField scope={profile.key} label="Tax %" value={draft.taxPercent} disabled={disabled} inputMode="decimal" onChange={(value) => dispatch({ type: "taxPercent", value })} />
          <TextField scope={profile.key} label="Peak %" value={draft.peakSurchargePercent} disabled={disabled} inputMode="decimal" onChange={(value) => dispatch({ type: "peakSurchargePercent", value })} />
          <TextField scope={profile.key} label="Sort" value={draft.sortOrder} disabled={disabled} inputMode="decimal" onChange={(value) => dispatch({ type: "sortOrder", value })} />
        </div>

        <div>
          <Label htmlFor={`notes-${profile.key}`}>Notes</Label>
          <Textarea
            id={`notes-${profile.key}`}
            value={draft.notes}
            disabled={disabled}
            onChange={(event) => dispatch({ type: "notes", value: event.target.value })}
            className="mt-2"
          />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {message ? (
            <Alert className="sm:max-w-md" role="status" aria-live="polite">
              <span className="inline-flex items-center gap-2">
                <CheckCircle2 className="size-4" aria-hidden />
                {message}
              </span>
            </Alert>
          ) : (
            <p className="text-sm text-muted-foreground">
              {canEdit ? "Save changes before applying this profile in dispatch." : "Only admins can edit rate cards."}
            </p>
          )}
          <Button type="button" disabled={disabled} onClick={() => void handleSave()}>
            <Save className="size-4" aria-hidden />
            Save profile
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function RatesShell({
  children,
  showSignOut = false,
}: {
  children: ReactNode;
  showSignOut?: boolean;
}) {
  return (
    <section className="pld-ui min-h-[100svh] bg-muted/30 text-foreground">
      <div className="mx-auto max-w-[1500px] px-6 pt-28 pb-16 lg:px-10">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-normal text-muted-foreground">
              ProLimo OS
            </p>
            <h1 className="mt-2 text-4xl font-semibold tracking-normal text-foreground">
              Rates
            </h1>
          </div>
          {showSignOut && (
            <Button
              type="button"
              variant="outline"
              className="self-start md:self-auto"
              onClick={async () => {
                await authClient.signOut();
                window.location.href = "/";
              }}
            >
              Sign out
            </Button>
          )}
        </div>
        {children}
      </div>
    </section>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <Card className="shadow-none">
      <CardContent className="p-4">
        <p className="text-xs font-medium uppercase tracking-normal text-muted-foreground">
          {label}
        </p>
        <p className="mt-1 text-lg font-semibold text-foreground">{value}</p>
      </CardContent>
    </Card>
  );
}

function TextField({
  disabled,
  inputMode,
  label,
  onChange,
  scope,
  value,
}: {
  disabled?: boolean;
  inputMode?: "decimal";
  label: string;
  onChange: (value: string) => void;
  scope: string;
  value: string;
}) {
  const id = `rate-${scope}-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        value={value}
        disabled={disabled}
        inputMode={inputMode}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2"
      />
    </div>
  );
}

function createDraft(profile: RateProfile): RateProfileDraft {
  return {
    key: profile.key,
    name: profile.name,
    vehicleType: profile.vehicleType,
    active: profile.active ? "true" : "false",
    baseFee: centsToDollars(profile.baseFeeCents),
    minimumFare: centsToDollars(profile.minimumFareCents),
    includedMiles: String(profile.includedMiles),
    perMile: centsToDollars(profile.perMileCents),
    perHour: centsToDollars(profile.perHourCents),
    airportFee: centsToDollars(profile.airportFeeCents),
    meetAndGreet: centsToDollars(profile.meetAndGreetCents),
    extraStop: centsToDollars(profile.extraStopCents),
    gratuityPercent: String(profile.gratuityPercent),
    taxPercent: String(profile.taxPercent),
    peakSurchargePercent: String(profile.peakSurchargePercent),
    notes: profile.notes ?? "",
    sortOrder: String(profile.sortOrder),
  };
}

function draftReducer(state: RateProfileDraft, action: DraftAction): RateProfileDraft {
  if (action.type === "sync") return createDraft(action.profile);
  return { ...state, [action.type]: action.value };
}

function readNumber(value: string) {
  const numeric = Number.parseFloat(value);
  return Number.isFinite(numeric) ? numeric : 0;
}
