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

// 'Gujarat Outstation' is intentionally distinct from 'Intercity' -- they
// used to share the 'Intercity' label even though the >15km Gujarat branch
// has entirely different (weight-based) pricing, which also broke ETA
// displays that matched on the tier string.
export type DeliveryTier = 'Hyperlocal' | 'Intercity' | 'Interstate' | 'Gujarat Outstation' | 'PAN India';

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
  { tier: 'Intercity', maxDistanceKm: 10, fee: 100, freeAbove: 1200 },
  { tier: 'Interstate', maxDistanceKm: 15, fee: 150, freeAbove: 1800 },
];

export interface OutstationTierRule {
  tier: DeliveryTier;
  feePerKg: number;
  freeAbove: number;
}

// Applies beyond the last DISTANCE_TIERS cutoff -- priced by weight instead
// of a flat fee, split by whether the address text mentions Gujarat.
export const OUTSTATION_TIERS: { gujarat: OutstationTierRule; panIndia: OutstationTierRule } = {
  gujarat: { tier: 'Gujarat Outstation', feePerKg: 40, freeAbove: 2000 },
  panIndia: { tier: 'PAN India', feePerKg: 100, freeAbove: 3500 },
};

// Informational only (shown on the Hyperlocal badge/page) -- not enforced
// anywhere in the fee logic itself.
export const HYPERLOCAL_DELIVERY_HOURS = '11 AM – 8 PM';

// The core tier + fee formula. distanceKm should be Infinity (or anything
// >15) to force the weight-based outstation branch when no lat/lng is
// available -- this is the deliberate "charge more rather than accidentally
// undercharge" fallback used when a delivery location can't be resolved.
export function calculateDeliveryFee(distanceKm: number, address: string, subTotal: number, weightKg: number): DeliveryFeeResult {
  for (const rule of DISTANCE_TIERS) {
    if (distanceKm <= rule.maxDistanceKm) {
      return { tier: rule.tier, fee: subTotal >= rule.freeAbove ? 0 : rule.fee };
    }
  }

  const isGujarat = address.toLowerCase().includes('gujarat');
  const rule = isGujarat ? OUTSTATION_TIERS.gujarat : OUTSTATION_TIERS.panIndia;
  return { tier: rule.tier, fee: subTotal >= rule.freeAbove ? 0 : Math.ceil(weightKg) * rule.feePerKg };
}

// The free-delivery threshold for each tier -- used both by the fee formula
// above (implicitly) and by any "add ₹X more for free delivery" UI, so the
// banner and the actual charge can never drift apart again.
export function getFreeDeliveryThreshold(tier: DeliveryTier): number {
  const distanceRule = DISTANCE_TIERS.find((r) => r.tier === tier);
  if (distanceRule) return distanceRule.freeAbove;
  if (tier === OUTSTATION_TIERS.panIndia.tier) return OUTSTATION_TIERS.panIndia.freeAbove;
  return OUTSTATION_TIERS.gujarat.freeAbove;
}
