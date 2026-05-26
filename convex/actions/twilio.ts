"use node";

import { v } from "convex/values";
import { internalAction } from "../_generated/server";

const TWILIO_API_BASE = "https://api.twilio.com/2010-04-01";

export class TwilioConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TwilioConfigError";
  }
}

export class TwilioSendError extends Error {
  constructor(
    message: string,
    readonly status?: number,
    readonly code?: string,
  ) {
    super(message);
    this.name = "TwilioSendError";
  }
}

type TwilioConfig = {
  accountSid: string;
  /** Basic-auth username for the API call. Account SID in classic mode, API Key SID in API-Key mode. */
  authUser: string;
  /** Basic-auth password. Auth Token in classic mode, API Key Secret in API-Key mode. */
  authPass: string;
  fromNumber: string;
  authMode: "account" | "apiKey";
};

/**
 * Detects which Twilio auth style is configured and returns the
 * appropriate credentials. Two supported modes:
 *
 * 1. **API Key** (preferred for scoped, rotatable creds):
 *    - TWILIO_ACCOUNT_SID    (AC… — still needed for the URL path)
 *    - TWILIO_API_KEY_SID    (SK…)
 *    - TWILIO_API_KEY_SECRET (the key's secret)
 *    - TWILIO_FROM_NUMBER
 *
 * 2. **Account auth** (classic, uses the master Auth Token):
 *    - TWILIO_ACCOUNT_SID    (AC…)
 *    - TWILIO_AUTH_TOKEN
 *    - TWILIO_FROM_NUMBER
 *
 * If API Key vars are present, they win. Returns null when neither
 * triplet is complete so the caller (cron) can skip without burning
 * retries.
 */
function readTwilioConfig(): TwilioConfig | null {
  const accountSid = process.env.TWILIO_ACCOUNT_SID?.trim();
  const fromNumber = process.env.TWILIO_FROM_NUMBER?.trim();
  if (!accountSid || !fromNumber) return null;

  const apiKeySid = process.env.TWILIO_API_KEY_SID?.trim();
  const apiKeySecret = process.env.TWILIO_API_KEY_SECRET?.trim();
  if (apiKeySid && apiKeySecret) {
    return {
      accountSid,
      authUser: apiKeySid,
      authPass: apiKeySecret,
      fromNumber,
      authMode: "apiKey",
    };
  }

  const authToken = process.env.TWILIO_AUTH_TOKEN?.trim();
  if (authToken) {
    return {
      accountSid,
      authUser: accountSid,
      authPass: authToken,
      fromNumber,
      authMode: "account",
    };
  }

  return null;
}

/**
 * Lightweight Twilio Messages API client. No SDK — Convex Node
 * actions have `fetch` and the API is a single POST with form-encoded
 * body + basic auth.
 *
 * Returns the Twilio message SID on success. Throws TwilioConfigError
 * when env is missing (caller decides whether to silently skip or
 * surface) and TwilioSendError for Twilio-reported failures.
 */
export const sendSms = internalAction({
  args: {
    to: v.string(),
    body: v.string(),
  },
  handler: async (_ctx, args) => {
    const config = readTwilioConfig();
    if (!config) {
      throw new TwilioConfigError(
        "Twilio is not configured. Set TWILIO_ACCOUNT_SID + TWILIO_FROM_NUMBER plus either (TWILIO_AUTH_TOKEN) or (TWILIO_API_KEY_SID + TWILIO_API_KEY_SECRET).",
      );
    }

    const url = `${TWILIO_API_BASE}/Accounts/${encodeURIComponent(config.accountSid)}/Messages.json`;
    const body = new URLSearchParams({
      To: args.to,
      From: config.fromNumber,
      Body: args.body,
    });
    const auth = Buffer.from(`${config.authUser}:${config.authPass}`).toString("base64");

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: body.toString(),
    });

    if (!response.ok) {
      let code: string | undefined;
      let message = `Twilio request failed (${response.status})`;
      try {
        const errorBody = (await response.json()) as { code?: number; message?: string };
        if (errorBody.code !== undefined) code = String(errorBody.code);
        if (errorBody.message) message = errorBody.message;
      } catch {
        // body wasn't json
      }
      throw new TwilioSendError(message, response.status, code);
    }

    const payload = (await response.json()) as { sid?: string };
    return { messageSid: payload.sid ?? null };
  },
});
