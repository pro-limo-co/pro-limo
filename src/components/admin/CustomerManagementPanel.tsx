"use client";

import type { FunctionReturnType } from "convex/server";
import { useMutation, useQuery } from "convex/react";
import { CheckCircle2, Mail, MapPin, Phone, Save, UsersRound } from "lucide-react";
import Link from "next/link";
import { type ReactNode, useEffect, useReducer, useState } from "react";
import { api } from "@convex/_generated/api";
import { StaffOpsShell, StaffPanelStat } from "@/components/admin/StaffOpsShell";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { authClient } from "@/lib/auth-client";

type CustomerProfile = FunctionReturnType<typeof api.customers.list>[number];

type CustomerDraft = {
  preferredVehicle: string;
  preferredDrivingStyle: string;
  marketingOptIn: "true" | "false";
  notes: string;
};

type CustomerDraftAction =
  | { type: keyof CustomerDraft; value: string }
  | { type: "sync"; profile: CustomerProfile };

const customerDateFormatter = new Intl.DateTimeFormat(undefined, {
  month: "short",
  day: "numeric",
  year: "numeric",
});

export function CustomerManagementPanel() {
  const viewer = useQuery(api.auth.getViewer);
  const customers = useQuery(api.customers.list, viewer?.staff ? { limit: 120 } : "skip");
  const session = authClient.useSession();

  if (viewer === undefined || session.isPending) {
    return (
      <CustomersShell>
        <Card className="mt-8 rounded-[28px] border-black/10 bg-white shadow-none">
          <CardContent className="py-6 text-sm text-black/56">
            Loading customer profiles.
          </CardContent>
        </Card>
      </CustomersShell>
    );
  }

  if (!viewer.identity) {
    return (
      <CustomersShell>
        <Card className="mt-8 max-w-xl rounded-[28px] border-black/10 bg-white shadow-none">
          <CardHeader>
            <CardTitle>Staff access required</CardTitle>
            <CardDescription>Sign in before viewing customer history and preferences.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild size="lg" className="rounded-full bg-[#050505] text-white hover:bg-[#111111]">
              <Link href="/auth/sign-in?next=/admin/customers">Sign in</Link>
            </Button>
          </CardContent>
        </Card>
      </CustomersShell>
    );
  }

  if (!viewer.staff) {
    return (
      <CustomersShell showSignOut>
        <Card className="mt-8 max-w-xl rounded-[28px] border-black/10 bg-white shadow-none">
          <CardHeader>
            <CardTitle>Customers are staff-only</CardTitle>
            <CardDescription>Claim staff access from the dispatch queue first.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild size="lg" className="rounded-full bg-[#050505] text-white hover:bg-[#111111]">
              <Link href="/admin/dispatch">Open dispatch</Link>
            </Button>
          </CardContent>
        </Card>
      </CustomersShell>
    );
  }

  return (
    <CustomersShell showSignOut>
      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <StatCard label="Customers" value={customers === undefined ? "Loading" : String(customers.length)} />
        <StatCard label="Records" value="Live" />
        <StatCard label="Access" value={viewer.staff.role === "viewer" ? "View only" : "Staff"} />
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-black text-black">Customer records</p>
          <p className="text-sm text-black/56">
            New bookings automatically refresh contact history, addresses, preferences, and marketing consent.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button asChild variant="outline" className="rounded-full border-black/10 bg-white text-black hover:bg-[#050505] hover:text-white">
            <Link href="/admin/dispatch">Dispatch queue</Link>
          </Button>
          <Button asChild variant="outline" className="rounded-full border-black/10 bg-white text-black hover:bg-[#050505] hover:text-white">
            <Link href="/admin/fleet">Fleet</Link>
          </Button>
        </div>
      </div>

      <div className="mt-6 grid gap-4">
        {customers === undefined ? (
          <LoadingCard />
        ) : customers.length === 0 ? (
          <EmptyCustomersState />
        ) : (
          customers.map((customer) => (
            <CustomerProfileCard
              key={customer._id}
              canEdit={viewer.staff?.role !== "viewer"}
              profile={customer}
            />
          ))
        )}
      </div>
    </CustomersShell>
  );
}

function CustomerProfileCard({
  canEdit,
  profile,
}: {
  canEdit: boolean;
  profile: CustomerProfile;
}) {
  const updatePreferences = useMutation(api.customers.updatePreferences);
  const [draft, dispatch] = useReducer(customerDraftReducer, profile, createCustomerDraft);
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  useEffect(() => {
    dispatch({ type: "sync", profile });
  }, [profile]);

  async function handleSave() {
    setPending(true);
    setMessage("");
    try {
      await updatePreferences({
        customerId: profile._id,
        preferredVehicle: emptyToUndefined(draft.preferredVehicle),
        preferredDrivingStyle: emptyToUndefined(draft.preferredDrivingStyle),
        marketingOptIn: draft.marketingOptIn === "true",
        notes: emptyToUndefined(draft.notes),
      });
      setMessage("Customer profile saved.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not save customer profile.");
    } finally {
      setPending(false);
    }
  }

  const disabled = !canEdit || pending;

  return (
    <Card className="rounded-[28px] border-black/10 bg-white shadow-none">
      <CardHeader>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge>{profile.bookingCount} {profile.bookingCount === 1 ? "booking" : "bookings"}</Badge>
              <Badge variant={profile.marketingOptIn ? "secondary" : "outline"}>
                {profile.marketingOptIn ? "Marketing on" : "Marketing off"}
              </Badge>
            </div>
            <CardTitle className="mt-3 text-2xl">{profile.name}</CardTitle>
            <CardDescription className="mt-2 flex flex-wrap gap-x-4 gap-y-2">
              <ContactLine icon={<Mail className="size-4" aria-hidden />} label={profile.email} />
              <ContactLine icon={<Phone className="size-4" aria-hidden />} label={profile.phone} />
            </CardDescription>
          </div>
          <div className="rounded-2xl border border-black/10 bg-[#f3f3f3] px-3 py-2 text-sm font-medium text-black/56">
            Last booking {customerDateFormatter.format(profile.lastBookingAt)}
          </div>
        </div>
      </CardHeader>
      <CardContent className="grid gap-5 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div className="grid content-start gap-3">
          <AddressList title="Pickup memory" values={profile.pickupLocations} />
          <AddressList title="Drop-off memory" values={profile.dropoffLocations} />
        </div>
        <div className="grid content-start gap-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <TextField
              disabled={disabled}
              label="Preferred vehicle"
              scope={profile._id}
              value={draft.preferredVehicle}
              onChange={(value) => dispatch({ type: "preferredVehicle", value })}
            />
            <TextField
              disabled={disabled}
              label="Driving style"
              scope={profile._id}
              value={draft.preferredDrivingStyle}
              onChange={(value) => dispatch({ type: "preferredDrivingStyle", value })}
            />
            <div>
              <Label htmlFor={`marketing-${profile._id}`}>Monthly reminders</Label>
              <Select
                value={draft.marketingOptIn}
                disabled={disabled}
                onValueChange={(value) => dispatch({ type: "marketingOptIn", value })}
              >
                <SelectTrigger id={`marketing-${profile._id}`} className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="pld-ui">
                  <SelectItem value="true">Enabled</SelectItem>
                  <SelectItem value="false">Disabled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label htmlFor={`customer-notes-${profile._id}`}>Staff notes</Label>
            <Textarea
              id={`customer-notes-${profile._id}`}
              value={draft.notes}
              disabled={disabled}
              onChange={(event) => dispatch({ type: "notes", value: event.target.value })}
              className="mt-2 min-h-24"
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
                {canEdit ? "Keep notes short and operator-useful." : "Viewers cannot edit customer profiles."}
              </p>
            )}
            <Button
              type="button"
              className="rounded-full bg-[#050505] text-white hover:bg-[#111111]"
              disabled={disabled}
              onClick={() => void handleSave()}
            >
              <Save className="size-4" aria-hidden />
              Save profile
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function CustomersShell({
  children,
  showSignOut = false,
}: {
  children: ReactNode;
  showSignOut?: boolean;
}) {
  return (
    <StaffOpsShell
      current="customers"
      description="Review customer history, saved addresses, preferences, notes, and marketing consent."
      eyebrow="Customer records"
      showSignOut={showSignOut}
      title="Customers"
    >
      {children}
    </StaffOpsShell>
  );
}

function AddressList({ title, values }: { title: string; values: string[] }) {
  return (
    <div className="rounded-2xl border border-black/10 bg-[#f3f3f3] p-3">
      <div className="flex items-center gap-2 text-xs font-black uppercase text-black/42">
        <MapPin className="size-3.5" aria-hidden />
        {title}
      </div>
      <div className="mt-3 grid gap-2">
        {values.length === 0 ? (
          <p className="text-sm text-black/56">No addresses saved yet.</p>
        ) : (
          values.map((value) => (
            <p key={value} className="break-words rounded-2xl bg-white px-2.5 py-2 text-sm text-black [overflow-wrap:anywhere]">
              {value}
            </p>
          ))
        )}
      </div>
    </div>
  );
}

function ContactLine({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <span className="inline-flex min-w-0 items-center gap-2 break-words [overflow-wrap:anywhere]">
      {icon}
      {label}
    </span>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return <StaffPanelStat label={label} value={value} />;
}

function LoadingCard() {
  return (
    <Card className="rounded-[28px] border-black/10 bg-white shadow-none">
      <CardContent className="py-6 text-sm text-black/56">
        Loading customers.
      </CardContent>
    </Card>
  );
}

function EmptyCustomersState() {
  return (
    <Card className="rounded-[28px] border-black/10 bg-white shadow-none">
      <CardHeader>
        <div className="flex items-center gap-2">
          <UsersRound className="size-5" aria-hidden />
          <CardTitle>No customer profiles yet</CardTitle>
        </div>
        <CardDescription>
          The next real booking will create the first customer profile automatically.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button asChild className="rounded-full bg-[#050505] text-white hover:bg-[#111111]">
          <Link href="/#book">Open booking form</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

function TextField({
  disabled,
  label,
  onChange,
  scope,
  value,
}: {
  disabled?: boolean;
  label: string;
  onChange: (value: string) => void;
  scope: string;
  value: string;
}) {
  const id = `customer-${scope}-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2"
      />
    </div>
  );
}

function createCustomerDraft(profile: CustomerProfile): CustomerDraft {
  return {
    preferredVehicle: profile.preferredVehicle ?? "",
    preferredDrivingStyle: profile.preferredDrivingStyle ?? "",
    marketingOptIn: profile.marketingOptIn ? "true" : "false",
    notes: profile.notes ?? "",
  };
}

function customerDraftReducer(state: CustomerDraft, action: CustomerDraftAction): CustomerDraft {
  if (action.type === "sync") return createCustomerDraft(action.profile);
  return { ...state, [action.type]: action.value };
}

function emptyToUndefined(value: string) {
  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
}
