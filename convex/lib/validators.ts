import { v } from "convex/values";

export const locationValidator = v.object({
  address: v.optional(v.string()),
  city: v.optional(v.string()),
  state: v.optional(v.string()),
  zip: v.optional(v.string()),
  lat: v.number(),
  lng: v.number(),
  placeId: v.optional(v.string()),
  name: v.optional(v.string()),
});

export type Location = {
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  lat: number;
  lng: number;
  placeId?: string;
  name?: string;
};
