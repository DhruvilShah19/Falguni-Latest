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

// The core tier + fee formula. distanceKm should be Infinity (or anything
// >15) to force the weight-based outstation branch when no lat/lng is
// available -- this is the deliberate "charge more rather than accidentally
// undercharge" fallback used when a delivery location can't be resolved.
export function calculateDeliveryFee(distanceKm: number, address: string, subTotal: number, weightKg: number): DeliveryFeeResult {
  if (distanceKm <= 5) {
    return { tier: 'Hyperlocal', fee: subTotal >= 400 ? 0 : 50 };
  }
  if (distanceKm <= 10) {
    return { tier: 'Intercity', fee: subTotal >= 1200 ? 0 : 100 };
  }
  if (distanceKm <= 15) {
    return { tier: 'Interstate', fee: subTotal >= 1800 ? 0 : 150 };
  }

  const isGujarat = address.toLowerCase().includes('gujarat');
  if (isGujarat) {
    return { tier: 'Gujarat Outstation', fee: subTotal >= 2000 ? 0 : Math.ceil(weightKg) * 40 };
  }
  return { tier: 'PAN India', fee: subTotal >= 3500 ? 0 : Math.ceil(weightKg) * 100 };
}

// The free-delivery threshold for each tier -- used both by the fee formula
// above (implicitly) and by any "add ₹X more for free delivery" UI, so the
// banner and the actual charge can never drift apart again.
export function getFreeDeliveryThreshold(tier: DeliveryTier): number {
  switch (tier) {
    case 'Hyperlocal': return 400;
    case 'Intercity': return 1200;
    case 'Interstate': return 1800;
    case 'Gujarat Outstation': return 2000;
    case 'PAN India': return 3500;
  }
}
