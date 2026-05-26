/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as actions_notifications from "../actions/notifications.js";
import type * as actions_routes from "../actions/routes.js";
import type * as actions_twilio from "../actions/twilio.js";
import type * as auth from "../auth.js";
import type * as betterAuth_adapter from "../betterAuth/adapter.js";
import type * as betterAuth_auth from "../betterAuth/auth.js";
import type * as bookings from "../bookings.js";
import type * as crons from "../crons.js";
import type * as customers from "../customers.js";
import type * as fleet from "../fleet.js";
import type * as handoffs from "../handoffs.js";
import type * as http from "../http.js";
import type * as lib_audit from "../lib/audit.js";
import type * as lib_rateLimits from "../lib/rateLimits.js";
import type * as lib_staff from "../lib/staff.js";
import type * as lib_statusMachine from "../lib/statusMachine.js";
import type * as lib_validators from "../lib/validators.js";
import type * as notifications from "../notifications.js";
import type * as paymentRecords from "../paymentRecords.js";
import type * as payments from "../payments.js";
import type * as rates from "../rates.js";
import type * as tripShares from "../tripShares.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  "actions/notifications": typeof actions_notifications;
  "actions/routes": typeof actions_routes;
  "actions/twilio": typeof actions_twilio;
  auth: typeof auth;
  "betterAuth/adapter": typeof betterAuth_adapter;
  "betterAuth/auth": typeof betterAuth_auth;
  bookings: typeof bookings;
  crons: typeof crons;
  customers: typeof customers;
  fleet: typeof fleet;
  handoffs: typeof handoffs;
  http: typeof http;
  "lib/audit": typeof lib_audit;
  "lib/rateLimits": typeof lib_rateLimits;
  "lib/staff": typeof lib_staff;
  "lib/statusMachine": typeof lib_statusMachine;
  "lib/validators": typeof lib_validators;
  notifications: typeof notifications;
  paymentRecords: typeof paymentRecords;
  payments: typeof payments;
  rates: typeof rates;
  tripShares: typeof tripShares;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {
  betterAuth: import("@convex-dev/better-auth/_generated/component.js").ComponentApi<"betterAuth">;
  rateLimiter: import("@convex-dev/rate-limiter/_generated/component.js").ComponentApi<"rateLimiter">;
};
