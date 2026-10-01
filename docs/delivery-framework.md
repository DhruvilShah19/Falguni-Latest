# Delivery framework v2

Implemented in Flutter user checkout, web checkout, the payment backend, and admin-web Delivery Fee settings. Admin-web is deployed. The storefront release is staged pending working server geocoding; see the release status in this chat. No production order migration has been performed.

## Pricing

- Hyperlocal: distance ≤5 km, ₹50, free at ₹400 or above.
- Nearby: >5–10 km, ₹100, free at ₹1,200 or above.
- Extended Local: >10–15 km, ₹150, free at ₹1,800 or above.
- Gujarat outstation: >15 km, ₹40 per excess kg. Free weight at ₹2,000/₹3,000/₹4,000/₹5,000 is 5/7.5/10/15 kg.
- PAN India: >15 km outside Gujarat, ₹100 per excess kg. Free weight at ₹3,500/₹5,000/₹7,000/₹10,000 is 5/7.5/10/15 kg.
- Eligibility uses merchandise value after applicable discounts, before delivery. There is no kg ceiling/round-up; only the final monetary amount is rounded to paise.
- Pickup is free. Local delivery does not require shipping weights.

## Temporary packing allowance (requested by owner)

Until a courier and parcel measurements are known, outstation quotes default to:

`estimatedPackedWeight = productWeightKg × 1.25 + 0.25 kg per order`

The free-weight slab is subtracted from this estimated weight. This is an adjustable commercial allowance, **not** a measured volumetric weight or a guarantee of covering every courier invoice. Example: 4 kg → 5.25 kg; a Gujarat cart of ₹2,500 gets 5 kg free and pays ₹10 for 0.25 kg excess.

Checkout discloses that a temporary packaging allowance is included. Admin-web Store Settings → Delivery & Shipping → Delivery Framework can change the multiplier and per-order packaging weight, disable the buffer, set dispatch coordinates, or enable measured volumetric pricing. Measured volumetric mode replaces the temporary buffer.

## Configuration and rollout

1. Configure server environment variable `GOOGLE_MAPS_GEOCODING_KEY` with a server-compatible key permitted to use Google's Geocoding API. Browser-restricted keys may not work server-side. Address geocoding must return a state and a non-partial result. No live geocoding/payment calls were used in tests. [Google request documentation](https://developers.google.com/maps/documentation/geocoding/guides-v3/requests-geocoding).
2. Configure Firestore `Delivery Settings/Framework` through admin-web. If absent, Vastrapur origin `(23.0360, 72.5294)`, the 25% + 250 g buffer, and volumetric disabled are the defaults. Authorize only admins to write this document; the server reads it with Admin SDK. Review deployed Firestore rules before enabling settings in production.
3. Audit variants with labels other than `kg`, `gm`, or `g`. Add authoritative per-unit `actualWeightKg` to `Products/{documentId}.shippingVariants[exact selected label]`. Unknown weights, including pieces/boxes/litres without supplied shipping weights, stop outstation checkout rather than assume 1 kg. Product lookup supports document IDs and the `productID` field.
4. Web checkout uses `/api/v2/cashfree/create-order` and `/api/delivery-quote`, requiring a Firebase bearer ID token and the reviewed `expectedTotal`. The original `/api/cashfree/create-order` endpoint retains legacy billing behavior for published mobile apps. This release targets web storefront and admin website only. Flutter source is updated for a future mobile release, but no mobile binary has been published. Retire the legacy endpoint after a coordinated mobile rollout; until then mobile and web pricing differ.
5. Verify real local, Gujarat, other-state, pickup, coupon, address-change, missing-weight, and changed-total journeys against a staging Firebase/Cashfree environment. Automated checks cover pricing and mocked quote flows, not live payment settlement.

Distance is currently Haversine distance × 1.3, an estimate, not a routed road distance. The configured dispatch store is used; automatic multi-store dispatch selection is not implemented.

### Firestore settings example

```json
{
  "storeOrigin": {"lat": 23.0360, "lng": 72.5294},
  "packingBuffer": {"enabled": true, "multiplier": 1.25, "tareKg": 0.25},
  "volumetricEnabled": false,
  "volumetricDivisor": null
}
```

When enabling measured volumetric mode, enter the actual courier divisor. Do not infer one from this document. Each variant needs `actualWeightKg`, `lengthCm`, `widthCm`, `heightCm` for its packed unit. The server sums unit weight/volume × quantity, then uses `max(total actual kg, total volumetric kg)`. This assumes separately measured unit packaging; consolidated parcel packing needs a shipment-level packing model before enabling it for those shipments.

```json
{
  "shippingVariants": {
    "500gm": {
      "actualWeightKg": 0.55,
      "lengthCm": 20,
      "widthCm": 15,
      "heightCm": 5
    }
  }
}
```

The numbers above demonstrate the schema; they are not measurements to copy into real products.

## Flow and audit trail

`POST /api/delivery-quote` authenticates the user, reads their cart/coupon and delivery settings, resolves the address server-side, and returns the pricing breakdown. Both checkouts show this quote. Payment recomputes using the same service; a changed total returns HTTP 409 before a payment request is made. Quote errors block payment. Outdated asynchronous address responses are ignored by checkout.

The draft order stores `deliveryCalculation` and `deliveryPolicyVersion`, including origin, destination state, estimated distance, eligible cart value, weights, packing allowance, free allowance and fee. Existing paid orders are not recalculated.

The existing cart merchandise-price model is retained (`Cart.price` is the line total). Catalog price authorization and payment verification/idempotency are separate existing concerns, not replaced by this delivery framework. Only app/admin-web were updated; the separate `admin_app` project was not changed.

## Checks

From `falguni_web`: `node --test tests/*.test.cjs` and `npx tsc --noEmit --incremental false`.

From `user_app`: `dart analyze lib/Pages/checkout.dart lib/Pages/checkout_step2_payment.dart lib/Providers/delivery_config.dart`.

The installed Flutter analyzer wrapper fails because its analysis-server snapshot is missing; direct `dart analyze` works. Run full device and staging checkout tests after fixing that SDK installation.

Production catalog audit: 297 products; 267 weighted variants and 30 piece-count variants requiring shipping weight metadata. The Google Maps key available locally returns REQUEST_DENIED (API project disabled); GOOGLE_MAPS_GEOCODING_KEY must be configured and verified before storefront promotion.

## Release status — 2026-09-30

- Admin production: https://admin-falgunigruhudhyog.web.app — deployed; HTTP 200 and deployed JavaScript hash matches the local release build. Framework controls are under Store Settings → Delivery & Shipping.
- Storefront staged deployment: https://falguni-latest-8x8qfonai-falguni-gruh-udhyog.vercel.app (`dpl_B6biK7k4GFpzavdQKtFghtcUh4LZ`). Vercel production build succeeded; deployed using `--prod --skip-domain`. Config endpoint returns policyVersion 2 and the packing buffer. Main storefront https://falguni-latest.vercel.app still serves legacy config, verified after staging.
- Google address lookup remains blocked: no server geocoding key configured; the existing public key returns project-disabled REQUEST_DENIED. User has been asked to restore service or add `GOOGLE_MAPS_GEOCODING_KEY` in Vercel. Do not promote until address quotes are verified. Environment changes require a fresh deployment before promotion.
- Deployment source copy: `/tmp/falguni-delivery-release/falguni_web`; source excludes local credentials and build caches. Vercel project root is `falguni_web`, so deploy its parent staging directory. Project ID: `prj_6SZLLuJGHKIKfVQ6XuTsc69lQb5p`; scope: `falguni-gruh-udhyog`.
- Published mobile clients continue using the original payment endpoint. No mobile release was requested for production.
- Twelve automated pricing/quote tests passed, local and Vercel production builds passed, and direct Dart analysis passed for checkout. Admin analysis has style-only brace suggestions.
