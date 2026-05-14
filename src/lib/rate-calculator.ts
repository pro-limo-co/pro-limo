export type RateProfileForCalculator = {
  key: string;
  name: string;
  vehicleType: string;
  baseFeeCents: number;
  minimumFareCents: number;
  includedMiles: number;
  perMileCents: number;
  perHourCents: number;
  airportFeeCents: number;
  meetAndGreetCents: number;
  extraStopCents: number;
  gratuityPercent: number;
  taxPercent: number;
  peakSurchargePercent: number;
};

export type RateQuoteInputs = {
  distanceMiles: number;
  billableHours: number;
  extraStops: number;
  includeAirportFee: boolean;
  includeMeetAndGreet: boolean;
  includePeakSurcharge: boolean;
};

export type RateQuote = {
  totalCents: number;
  lineItems: Array<{
    label: string;
    amountCents: number;
  }>;
};

const usdFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});

export function calculateRateQuote(
  profile: RateProfileForCalculator,
  inputs: RateQuoteInputs,
): RateQuote {
  const lineItems: RateQuote["lineItems"] = [];
  const baseFareCents = profile.baseFeeCents;
  const chargeableMiles = Math.max(0, inputs.distanceMiles - profile.includedMiles);
  const distanceCents = Math.round(chargeableMiles * profile.perMileCents);
  const hourlyCents = Math.round(inputs.billableHours * profile.perHourCents);
  const airportFeeCents = inputs.includeAirportFee ? profile.airportFeeCents : 0;
  const meetAndGreetCents = inputs.includeMeetAndGreet ? profile.meetAndGreetCents : 0;
  const extraStopCents = Math.round(Math.max(0, inputs.extraStops) * profile.extraStopCents);

  pushLineItem(lineItems, "Base fare", baseFareCents);
  pushLineItem(lineItems, `${formatNumber(chargeableMiles)} billable mi`, distanceCents);
  pushLineItem(lineItems, `${formatNumber(inputs.billableHours)} billable hr`, hourlyCents);
  pushLineItem(lineItems, "Airport fee", airportFeeCents);
  pushLineItem(lineItems, "Meet and greet", meetAndGreetCents);
  pushLineItem(lineItems, "Extra stops", extraStopCents);

  const rawSubtotal = lineItems.reduce((total, item) => total + item.amountCents, 0);
  const minimumAdjustmentCents = Math.max(0, profile.minimumFareCents - rawSubtotal);
  pushLineItem(lineItems, "Minimum fare adjustment", minimumAdjustmentCents);

  const subtotalCents = rawSubtotal + minimumAdjustmentCents;
  const peakCents = inputs.includePeakSurcharge
    ? Math.round(subtotalCents * (profile.peakSurchargePercent / 100))
    : 0;
  pushLineItem(lineItems, "Peak surcharge", peakCents);

  const gratuityBaseCents = subtotalCents + peakCents;
  const gratuityCents = Math.round(gratuityBaseCents * (profile.gratuityPercent / 100));
  pushLineItem(lineItems, "Gratuity", gratuityCents);

  const taxBaseCents = gratuityBaseCents + gratuityCents;
  const taxCents = Math.round(taxBaseCents * (profile.taxPercent / 100));
  pushLineItem(lineItems, "Tax", taxCents);

  return {
    totalCents: taxBaseCents + taxCents,
    lineItems,
  };
}

export function dollarsToCents(value: string) {
  const numeric = Number.parseFloat(value);
  if (!Number.isFinite(numeric)) return 0;
  return Math.max(0, Math.round(numeric * 100));
}

export function centsToDollars(value: number) {
  return (value / 100).toFixed(2);
}

export function formatMoneyFromCents(value: number) {
  return usdFormatter.format(value / 100);
}

function pushLineItem(
  lineItems: RateQuote["lineItems"],
  label: string,
  amountCents: number,
) {
  if (amountCents <= 0) return;
  lineItems.push({ label, amountCents });
}

function formatNumber(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}
