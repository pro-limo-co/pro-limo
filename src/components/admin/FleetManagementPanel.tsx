"use client";

import type { FunctionReturnType } from "convex/server";
import { useMutation, useQuery } from "convex/react";
import { CarFront, CheckCircle2, LogOut, Save, Settings2, UserRound } from "lucide-react";
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
import { authClient } from "@/lib/auth-client";

type DriverProfile = FunctionReturnType<typeof api.fleet.listDrivers>[number];
type VehicleProfile = FunctionReturnType<typeof api.fleet.listVehicles>[number];

type DriverDraft = {
  key: string;
  name: string;
  email: string;
  phone: string;
  active: "true" | "false";
  notes: string;
  sortOrder: string;
};

type VehicleDraft = {
  key: string;
  label: string;
  vehicleType: string;
  capacity: string;
  luggageCapacity: string;
  licensePlate: string;
  active: "true" | "false";
  notes: string;
  sortOrder: string;
};

type DriverDraftAction =
  | { type: keyof DriverDraft; value: string }
  | { type: "sync"; profile: DriverProfile };

type VehicleDraftAction =
  | { type: keyof VehicleDraft; value: string }
  | { type: "sync"; profile: VehicleProfile };

export function FleetManagementPanel() {
  const viewer = useQuery(api.auth.getViewer);
  const drivers = useQuery(api.fleet.listDrivers, viewer?.staff ? {} : "skip");
  const vehicles = useQuery(api.fleet.listVehicles, viewer?.staff ? {} : "skip");
  const ensureDefaults = useMutation(api.fleet.ensureDefaults);
  const session = authClient.useSession();
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  async function handleInstallDefaults() {
    setPending(true);
    setMessage("");
    try {
      const result = await ensureDefaults({});
      const inserted = result.insertedDrivers + result.insertedVehicles;
      setMessage(
        inserted > 0
          ? `Installed ${result.insertedDrivers} driver and ${result.insertedVehicles} vehicle profiles.`
          : "Saved fleet profiles are already installed.",
      );
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not install fleet defaults.");
    } finally {
      setPending(false);
    }
  }

  if (viewer === undefined || session.isPending) {
    return (
      <FleetShell>
        <Card className="mt-8">
          <CardContent className="py-6 text-sm text-muted-foreground">
            Loading fleet settings.
          </CardContent>
        </Card>
      </FleetShell>
    );
  }

  if (!viewer.identity) {
    return (
      <FleetShell>
        <Card className="mt-8 max-w-xl">
          <CardHeader>
            <CardTitle>Staff access required</CardTitle>
            <CardDescription>Sign in before managing saved drivers and vehicles.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild size="lg">
              <Link href="/auth/sign-in?next=/admin/fleet">Sign in</Link>
            </Button>
          </CardContent>
        </Card>
      </FleetShell>
    );
  }

  if (!viewer.staff) {
    return (
      <FleetShell showSignOut>
        <Card className="mt-8 max-w-xl">
          <CardHeader>
            <CardTitle>Fleet is staff-only</CardTitle>
            <CardDescription>Claim staff access from the dispatch queue first.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild size="lg">
              <Link href="/admin/dispatch">Open dispatch</Link>
            </Button>
          </CardContent>
        </Card>
      </FleetShell>
    );
  }

  const canEdit = viewer.staff.role === "admin";
  const savedDriverCount = drivers?.filter((driver) => driver.source === "saved").length ?? 0;
  const savedVehicleCount = vehicles?.filter((vehicle) => vehicle.source === "saved").length ?? 0;

  return (
    <FleetShell showSignOut>
      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <StatCard label="Drivers" value={drivers === undefined ? "Loading" : String(drivers.length)} />
        <StatCard label="Vehicles" value={vehicles === undefined ? "Loading" : String(vehicles.length)} />
        <StatCard label="Access" value={canEdit ? "Admin" : "View only"} />
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-foreground">Operating roster</p>
          <p className="text-sm text-muted-foreground">
            Saved profiles feed dispatch assignment and driver handoff details.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button asChild variant="outline">
            <Link href="/admin/dispatch">Dispatch queue</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/admin/rates">Rates</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/admin/customers">Customers</Link>
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

      <div className="mt-6 grid gap-5 xl:grid-cols-2">
        <FleetColumn
          description={`${savedDriverCount} saved driver profiles`}
          icon={<UserRound className="size-4" aria-hidden />}
          title="Drivers"
        >
          {drivers === undefined ? (
            <LoadingCard label="driver profiles" />
          ) : (
            drivers.map((driver) => (
              <DriverProfileCard key={driver.key} canEdit={canEdit} profile={driver} />
            ))
          )}
        </FleetColumn>

        <FleetColumn
          description={`${savedVehicleCount} saved vehicle profiles`}
          icon={<CarFront className="size-4" aria-hidden />}
          title="Vehicles"
        >
          {vehicles === undefined ? (
            <LoadingCard label="vehicle profiles" />
          ) : (
            vehicles.map((vehicle) => (
              <VehicleProfileCard key={vehicle.key} canEdit={canEdit} profile={vehicle} />
            ))
          )}
        </FleetColumn>
      </div>
    </FleetShell>
  );
}

function DriverProfileCard({
  canEdit,
  profile,
}: {
  canEdit: boolean;
  profile: DriverProfile;
}) {
  const upsert = useMutation(api.fleet.upsertDriver);
  const [draft, dispatch] = useReducer(driverDraftReducer, profile, createDriverDraft);
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
        driverId: profile.driverId,
        key: draft.key,
        name: draft.name,
        email: emptyToUndefined(draft.email),
        phone: emptyToUndefined(draft.phone),
        active: draft.active === "true",
        notes: emptyToUndefined(draft.notes),
        sortOrder: readNumber(draft.sortOrder),
      });
      setMessage("Driver profile saved.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not save driver profile.");
    } finally {
      setPending(false);
    }
  }

  const disabled = !canEdit || pending;

  return (
    <Card className="shadow-none">
      <CardHeader>
        <ProfileHeader
          active={profile.active}
          detail={profile.email ?? profile.phone ?? "No contact saved"}
          source={profile.source}
          title={profile.name}
        />
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <TextField label="Name" scope={profile.key} value={draft.name} disabled={disabled} onChange={(value) => dispatch({ type: "name", value })} />
          <TextField label="Key" scope={profile.key} value={draft.key} disabled={disabled} onChange={(value) => dispatch({ type: "key", value })} />
          <TextField label="Email" scope={profile.key} value={draft.email} disabled={disabled} type="email" onChange={(value) => dispatch({ type: "email", value })} />
          <TextField label="Phone" scope={profile.key} value={draft.phone} disabled={disabled} type="tel" onChange={(value) => dispatch({ type: "phone", value })} />
          <ActiveSelect scope={profile.key} value={draft.active} disabled={disabled} onChange={(value) => dispatch({ type: "active", value })} />
          <TextField label="Sort" scope={profile.key} value={draft.sortOrder} disabled={disabled} inputMode="decimal" onChange={(value) => dispatch({ type: "sortOrder", value })} />
        </div>
        <NotesField scope={`driver-${profile.key}`} value={draft.notes} disabled={disabled} onChange={(value) => dispatch({ type: "notes", value })} />
        <ProfileSaveBar canEdit={canEdit} disabled={disabled} message={message} onSave={handleSave} />
      </CardContent>
    </Card>
  );
}

function VehicleProfileCard({
  canEdit,
  profile,
}: {
  canEdit: boolean;
  profile: VehicleProfile;
}) {
  const upsert = useMutation(api.fleet.upsertVehicle);
  const [draft, dispatch] = useReducer(vehicleDraftReducer, profile, createVehicleDraft);
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
        vehicleId: profile.vehicleId,
        key: draft.key,
        label: draft.label,
        vehicleType: draft.vehicleType,
        capacity: readNumber(draft.capacity),
        luggageCapacity: draft.luggageCapacity,
        licensePlate: emptyToUndefined(draft.licensePlate),
        active: draft.active === "true",
        notes: emptyToUndefined(draft.notes),
        sortOrder: readNumber(draft.sortOrder),
      });
      setMessage("Vehicle profile saved.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not save vehicle profile.");
    } finally {
      setPending(false);
    }
  }

  const disabled = !canEdit || pending;

  return (
    <Card className="shadow-none">
      <CardHeader>
        <ProfileHeader
          active={profile.active}
          detail={`${profile.vehicleType} / ${profile.capacity} seats / ${profile.luggageCapacity}`}
          source={profile.source}
          title={profile.label}
        />
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <TextField label="Label" scope={profile.key} value={draft.label} disabled={disabled} onChange={(value) => dispatch({ type: "label", value })} />
          <TextField label="Vehicle type" scope={profile.key} value={draft.vehicleType} disabled={disabled} onChange={(value) => dispatch({ type: "vehicleType", value })} />
          <TextField label="Key" scope={profile.key} value={draft.key} disabled={disabled} onChange={(value) => dispatch({ type: "key", value })} />
          <TextField label="Seats" scope={profile.key} value={draft.capacity} disabled={disabled} inputMode="decimal" onChange={(value) => dispatch({ type: "capacity", value })} />
          <TextField label="Luggage" scope={profile.key} value={draft.luggageCapacity} disabled={disabled} onChange={(value) => dispatch({ type: "luggageCapacity", value })} />
          <TextField label="Plate" scope={profile.key} value={draft.licensePlate} disabled={disabled} onChange={(value) => dispatch({ type: "licensePlate", value })} />
          <ActiveSelect scope={profile.key} value={draft.active} disabled={disabled} onChange={(value) => dispatch({ type: "active", value })} />
          <TextField label="Sort" scope={profile.key} value={draft.sortOrder} disabled={disabled} inputMode="decimal" onChange={(value) => dispatch({ type: "sortOrder", value })} />
        </div>
        <NotesField scope={`vehicle-${profile.key}`} value={draft.notes} disabled={disabled} onChange={(value) => dispatch({ type: "notes", value })} />
        <ProfileSaveBar canEdit={canEdit} disabled={disabled} message={message} onSave={handleSave} />
      </CardContent>
    </Card>
  );
}

function FleetShell({
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
              Fleet
            </h1>
          </div>
          {showSignOut && (
            <div className="flex flex-col gap-2 sm:flex-row md:self-auto">
              <Button asChild variant="outline" className="self-start sm:self-auto">
                <Link href="/admin/dispatch">Dispatch</Link>
              </Button>
              <Button asChild variant="outline" className="self-start sm:self-auto">
                <Link href="/admin/rates">Rates</Link>
              </Button>
              <Button asChild variant="outline" className="self-start sm:self-auto">
                <Link href="/admin/customers">Customers</Link>
              </Button>
              <Button
                type="button"
                variant="outline"
                className="self-start sm:self-auto"
                onClick={async () => {
                  await authClient.signOut();
                  window.location.href = "/";
                }}
              >
                <LogOut className="size-4" aria-hidden />
                Sign out
              </Button>
            </div>
          )}
        </div>
        {children}
      </div>
    </section>
  );
}

function FleetColumn({
  children,
  description,
  icon,
  title,
}: {
  children: ReactNode;
  description: string;
  icon: ReactNode;
  title: string;
}) {
  return (
    <section className="grid content-start gap-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            {icon}
            <h2 className="text-lg font-semibold text-foreground">{title}</h2>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

function ProfileHeader({
  active,
  detail,
  source,
  title,
}: {
  active: boolean;
  detail: string;
  source: "default" | "saved";
  title: string;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={active ? "default" : "outline"}>{active ? "Active" : "Inactive"}</Badge>
          <Badge variant="secondary">{source === "saved" ? "Saved" : "Default preview"}</Badge>
        </div>
        <CardTitle className="mt-3 text-xl">{title}</CardTitle>
        <CardDescription>{detail}</CardDescription>
      </div>
    </div>
  );
}

function ActiveSelect({
  disabled,
  onChange,
  scope,
  value,
}: {
  disabled?: boolean;
  onChange: (value: "true" | "false") => void;
  scope: string;
  value: "true" | "false";
}) {
  return (
    <div>
      <Label htmlFor={`active-${scope}`}>Status</Label>
      <Select value={value} disabled={disabled} onValueChange={(nextValue) => onChange(nextValue as "true" | "false")}>
        <SelectTrigger id={`active-${scope}`} className="mt-2">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="pld-ui">
          <SelectItem value="true">Active</SelectItem>
          <SelectItem value="false">Inactive</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

function ProfileSaveBar({
  canEdit,
  disabled,
  message,
  onSave,
}: {
  canEdit: boolean;
  disabled: boolean;
  message: string;
  onSave: () => Promise<void>;
}) {
  return (
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
          {canEdit ? "Save changes before assigning this profile in dispatch." : "Only admins can edit fleet profiles."}
        </p>
      )}
      <Button type="button" disabled={disabled} onClick={() => void onSave()}>
        <Save className="size-4" aria-hidden />
        Save profile
      </Button>
    </div>
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

function LoadingCard({ label }: { label: string }) {
  return (
    <Card className="shadow-none">
      <CardContent className="py-6 text-sm text-muted-foreground">
        Loading {label}.
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
  type = "text",
  value,
}: {
  disabled?: boolean;
  inputMode?: "decimal";
  label: string;
  onChange: (value: string) => void;
  scope: string;
  type?: string;
  value: string;
}) {
  const id = `fleet-${scope}-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        value={value}
        disabled={disabled}
        inputMode={inputMode}
        type={type}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2"
      />
    </div>
  );
}

function NotesField({
  disabled,
  onChange,
  scope,
  value,
}: {
  disabled?: boolean;
  onChange: (value: string) => void;
  scope: string;
  value: string;
}) {
  return (
    <div>
      <Label htmlFor={`notes-${scope}`}>Notes</Label>
      <Textarea
        id={`notes-${scope}`}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 min-h-20"
      />
    </div>
  );
}

function createDriverDraft(profile: DriverProfile): DriverDraft {
  return {
    key: profile.key,
    name: profile.name,
    email: profile.email ?? "",
    phone: profile.phone ?? "",
    active: profile.active ? "true" : "false",
    notes: profile.notes ?? "",
    sortOrder: String(profile.sortOrder),
  };
}

function driverDraftReducer(state: DriverDraft, action: DriverDraftAction): DriverDraft {
  if (action.type === "sync") return createDriverDraft(action.profile);
  return { ...state, [action.type]: action.value };
}

function createVehicleDraft(profile: VehicleProfile): VehicleDraft {
  return {
    key: profile.key,
    label: profile.label,
    vehicleType: profile.vehicleType,
    capacity: String(profile.capacity),
    luggageCapacity: profile.luggageCapacity,
    licensePlate: profile.licensePlate ?? "",
    active: profile.active ? "true" : "false",
    notes: profile.notes ?? "",
    sortOrder: String(profile.sortOrder),
  };
}

function vehicleDraftReducer(state: VehicleDraft, action: VehicleDraftAction): VehicleDraft {
  if (action.type === "sync") return createVehicleDraft(action.profile);
  return { ...state, [action.type]: action.value };
}

function emptyToUndefined(value: string) {
  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
}

function readNumber(value: string) {
  const numeric = Number.parseFloat(value);
  return Number.isFinite(numeric) ? numeric : 0;
}
