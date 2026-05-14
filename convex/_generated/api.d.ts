/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as auth from "../auth.js";
import type * as betterAuth_adapter from "../betterAuth/adapter.js";
import type * as betterAuth_auth from "../betterAuth/auth.js";
import type * as bookings from "../bookings.js";
import type * as handoffs from "../handoffs.js";
import type * as http from "../http.js";
import type * as lib_rateLimits from "../lib/rateLimits.js";
import type * as lib_staff from "../lib/staff.js";
import type * as paymentRecords from "../paymentRecords.js";
import type * as payments from "../payments.js";
import type * as rates from "../rates.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  "betterAuth/adapter": typeof betterAuth_adapter;
  "betterAuth/auth": typeof betterAuth_auth;
  bookings: typeof bookings;
  handoffs: typeof handoffs;
  http: typeof http;
  "lib/rateLimits": typeof lib_rateLimits;
  "lib/staff": typeof lib_staff;
  paymentRecords: typeof paymentRecords;
  payments: typeof payments;
  rates: typeof rates;
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
