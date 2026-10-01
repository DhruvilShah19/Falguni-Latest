// ─────────────────────────────────────────────────────────────────────────────
// Single source of truth for delivery distance/weight/fee logic.
//
// This used to be duplicated across four places: the checkout display
// component, its "recalculate when cart changes" effect, a Zustand store
// selector, and the server-side order-creation route -- with nothing
// enforcing that they agreed. A pricing change updated in 3 of the 4 would
// silently make the displayed price diverge from what actually gets charged
// (this already happened once, with the free-delivery banner). Every
// consumer now imports from here instead of redefining the formula.
//
// This is a plain, framework-agnostic module (no React, no Node-only APIs)
// so it's safe to import from both client components and server API routes.
// ─────────────────────────────────────────────────────────────────────────────

// Falguni Gruh Udhyog store location (Vastrapur, Ahmedabad) -- the fixed
// origin point every delivery distance is measured from.
export const STUDIO_FALGUNI_LATLNG = { lat: 23.0360, lng: 72.5294 };

// 'Gujarat Outstation' is intentionally distinct from 'Nearby' -- they
// used to share the 'Nearby' label even though the >15km Gujarat branch
// has entirely different (weight-based) pricing, which also broke ETA
// displays that matched on the tier string.
export type DeliveryTier = 'Hyperlocal' | 'Nearby' | 'Extended Local' | 'Gujarat Outstation' | 'PAN India';

export interface DeliveryDetails {
  address: string;
  lat: number;
  lng: number;
  distanceKm: number;
  distanceText: string;
  durationText: string;
  durationSeconds: number;
  fee: number;
  tier: DeliveryTier;
}

export interface DeliveryFeeResult {
  tier: DeliveryTier;
  fee: number;
  cartValue: number;
  chargeableWeight: number | null;
  freeWeight: number;
  excessWeight: number;
  ratePerKg: number;
  policyVersion: 2;
}

// Straight-line (Haversine) distance -- not real road distance. Kept as a
// pure primitive; use getRoadDistanceEstimateKm below for tier/fee decisions.
export function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
}

// Straight-line distance systematically understates how far a rider actually
// has to travel, since roads bend around blocks, one-ways, and can't cross
// buildings/rivers directly. The ratio of real road distance to straight-line
// distance is called the "circuity factor" -- studies of dense Indian urban
// road networks put it around 1.25-1.4x. We use a flat 1.3x correction here
// instead of calling a paid routing API (Distance Matrix/Routes API) on
// every address selection, which would add a billed Google API call per
// customer interaction. This is the same trick delivery platforms used
// before/alongside real routing: cheap, no extra API cost, and meaningfully
// closer to the real distance than a raw straight line -- it just can't
// account for a specific river/highway actually blocking the direct path.
// If that ever becomes a real problem (e.g. false Hyperlocal-tier orders
// across the river), the fix is a real routing API call at checkout only,
// not on every keystroke -- not a bigger correction factor.
export const ROAD_DISTANCE_FACTOR = 1.3;

export function getRoadDistanceEstimateKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  return getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) * ROAD_DISTANCE_FACTOR;
}

// Parses a cart item's unit label (e.g. "500gm", "1kg", "2ltr") into kg.
// Defaults to 1kg if unparseable.
export function parseWeightToKg(unitString: string): number {
  if (!unitString) return 1.0;
  const str = unitString.toLowerCase();
  const match = str.match(/([0-9.]+)\s*(kg|gm|g|ltr|ml)/);
  if (match) {
    const value = parseFloat(match[1]);
    const unit = match[2];
    if (unit === 'kg' || unit === 'ltr') return value;
    if (unit === 'gm' || unit === 'g' || unit === 'ml') return value / 1000;
  }
  return 1.0;
}

export interface DistanceTierRule {
  tier: DeliveryTier;
  maxDistanceKm: number;
  fee: number;
  freeAbove: number;
}

// Ordered by ascending maxDistanceKm -- calculateDeliveryFee walks this list
// and returns the first tier whose cutoff the distance falls within. This is
// also the array the /api/delivery-config endpoint serializes directly, so
// the app fetches these exact numbers instead of hardcoding its own copy.
export const DISTANCE_TIERS: DistanceTierRule[] = [
  { tier: 'Hyperlocal', maxDistanceKm: 5, fee: 50, freeAbove: 400 },
  { tier: 'Nearby', maxDistanceKm: 10, fee: 100, freeAbove: 1200 },
  { tier: 'Extended Local', maxDistanceKm: 15, fee: 150, freeAbove: 1800 },
];

export interface OutstationTierRule {
  tier: DeliveryTier;
  feePerKg: number;
  freeAbove: number;
  freeWeightSlabs: { minCartValue: number; weightKg: number }[];
}

// Applies beyond the last DISTANCE_TIERS cutoff -- priced by weight instead
// of a flat fee, split by whether the address text mentions Gujarat.
export const OUTSTATION_TIERS: { gujarat: OutstationTierRule; panIndia: OutstationTierRule } = {
  gujarat: { tier: 'Gujarat Outstation', feePerKg: 40, freeAbove: 2000, freeWeightSlabs: [{ minCartValue: 2000, weightKg: 5 }, { minCartValue: 3000, weightKg: 7.5 }, { minCartValue: 4000, weightKg: 10 }, { minCartValue: 5000, weightKg: 15 }] },
  panIndia: { tier: 'PAN India', feePerKg: 100, freeAbove: 3500, freeWeightSlabs: [{ minCartValue: 3500, weightKg: 5 }, { minCartValue: 5000, weightKg: 7.5 }, { minCartValue: 7000, weightKg: 10 }, { minCartValue: 10000, weightKg: 15 }] },
};

// Informational only (shown on the Hyperlocal badge/page) -- not enforced
// anywhere in the fee logic itself.
export const HYPERLOCAL_DELIVERY_HOURS = '11 AM – 8 PM';

// Local orders never require weight. State should be structured whenever available;
// the whole-word fallback supports legacy saved addresses during migration.
export function calculateDeliveryFee(distanceKm: number, state: string, cartValue: number, actualWeight: number, volumetricWeight = 0): DeliveryFeeResult {
  if (!Number.isFinite(distanceKm) || distanceKm < 0 || !Number.isFinite(cartValue) || cartValue < 0) {
    throw new Error('A valid distance and merchandise value are required.');
  }
  const base = { cartValue, chargeableWeight: null, freeWeight: 0, excessWeight: 0, ratePerKg: 0, policyVersion: 2 as const };
  for (const rule of DISTANCE_TIERS) {
    if (distanceKm <= rule.maxDistanceKm) {
      return { ...base, tier: rule.tier, fee: cartValue >= rule.freeAbove ? 0 : rule.fee };
    }
  }
  if (!state.trim() || !Number.isFinite(actualWeight) || actualWeight <= 0 || !Number.isFinite(volumetricWeight) || volumetricWeight < 0) {
    throw new Error('Outstation delivery requires a destination state and valid shipping weights.');
  }
  const isGujarat = /\bgujarat\b/i.test(state) || ['gj', 'in-gj'].includes(state.trim().toLowerCase());
  const rule = isGujarat ? OUTSTATION_TIERS.gujarat : OUTSTATION_TIERS.panIndia;
  const chargeableWeight = Math.max(actualWeight, volumetricWeight);
  const freeWeight = rule.freeWeightSlabs.reduce((allowance, slab) => cartValue >= slab.minCartValue ? slab.weightKg : allowance, 0);
  const excessWeight = Math.max(0, chargeableWeight - freeWeight);
  return { ...base, tier: rule.tier, chargeableWeight, freeWeight, excessWeight, ratePerKg: rule.feePerKg, fee: Math.round((excessWeight * rule.feePerKg + Number.EPSILON) * 100) / 100 };
}

// The threshold depends on weight. Infinity means no slab covers this parcel.
export function getFreeDeliveryThreshold(tier: DeliveryTier, chargeableWeight = 0): number {
  const local = DISTANCE_TIERS.find(r => r.tier === tier);
  if (local) return local.freeAbove;
  const rule = tier === 'PAN India' ? OUTSTATION_TIERS.panIndia : OUTSTATION_TIERS.gujarat;
  return rule.freeWeightSlabs.find(s => s.weightKg >= chargeableWeight)?.minCartValue ?? Infinity;
}

export function volumetricWeightKg(lengthCm: number, widthCm: number, heightCm: number, divisor: number): number {
  if (![lengthCm, widthCm, heightCm, divisor].every(n => Number.isFinite(n) && n > 0)) {
    throw new Error('Positive parcel dimensions and courier divisor are required.');
  }
  return lengthCm * widthCm * heightCm / divisor;
}

// Temporary packing allowance, not a courier volumetric measurement.
export const DEFAULT_PACKING_BUFFER = { enabled: true, multiplier: 1.25, tareKg: 0.25 };
export function estimatePackedWeight(productWeightKg: number, multiplier = 1.25, tareKg = 0.25): number {
  if (!Number.isFinite(productWeightKg) || productWeightKg <= 0 || !Number.isFinite(multiplier) || multiplier < 1 || !Number.isFinite(tareKg) || tareKg < 0) {
    throw new Error('Invalid temporary packing allowance.');
  }
  return Math.round((productWeightKg * multiplier + tareKg) * 1000000) / 1000000;
}
