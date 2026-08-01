import { NextResponse } from 'next/server';
import {
  DISTANCE_TIERS,
  OUTSTATION_TIERS,
  ROAD_DISTANCE_FACTOR,
  HYPERLOCAL_DELIVERY_HOURS,
  STUDIO_FALGUNI_LATLNG,
} from '@/lib/deliveryPricing';

// Public, read-only view of the delivery pricing tiers -- the single
// source of truth both the website's own UI and the mobile app read from,
// so a pricing change here (edit lib/deliveryPricing.ts, redeploy) reaches
// app users instantly instead of waiting on an app store release.
//
// This does NOT change how the actual charge is calculated or enforced --
// /api/cashfree/create-order still recomputes the fee itself server-side
// from the cart and address on every order, independent of anything a
// client sends. This endpoint only feeds the DISPLAY estimate shown to the
// customer before they pay.
export async function GET() {
  return NextResponse.json(
    {
      roadDistanceFactor: ROAD_DISTANCE_FACTOR,
      storeOrigin: STUDIO_FALGUNI_LATLNG,
      distanceTiers: DISTANCE_TIERS,
      outstationTiers: OUTSTATION_TIERS,
      hyperlocalDeliveryHours: HYPERLOCAL_DELIVERY_HOURS,
    },
    {
      headers: {
        // Safe to cache -- this changes only when we deploy a pricing
        // change, and a few minutes of staleness on a display estimate is
        // harmless since the real charge is always server-recalculated.
        'Cache-Control': 'public, max-age=300, stale-while-revalidate=3600',
      },
    }
  );
}
