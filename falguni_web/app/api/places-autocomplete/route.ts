import { NextRequest, NextResponse } from 'next/server';

// Server-side key (not exposed to the browser). Falls back to the public key
// which is already enabled for Places API in Google Cloud Console.
const API_KEY = process.env.GOOGLE_MAPS_GEOCODING_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

// Falguni store — Vastrapur, Ahmedabad. Biases autocomplete results so nearby
// localities rank first, while still returning PAN-India results.
const AHMEDABAD_LAT = '23.0360';
const AHMEDABAD_LNG = '72.5294';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q');
    const sessionToken = searchParams.get('session') || '';

    if (!q || q.trim().length < 2) {
      return NextResponse.json({ success: true, suggestions: [] });
    }

    if (!API_KEY) {
      console.warn('places-autocomplete: no API key configured');
      return NextResponse.json({ success: true, suggestions: [] });
    }

    const response = await fetch(
      `https://places.googleapis.com/v1/places:autocomplete`,
      { 
        method: 'POST',
        signal: AbortSignal.timeout(8000), 
        cache: 'no-store',
        headers: { 
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': API_KEY,
          'Referer': 'https://www.falgunigruhudhyog.in/' 
        },
        body: JSON.stringify({
          input: q.trim(),
          includedRegionCodes: ['in'],
          locationBias: {
            circle: {
              center: { latitude: parseFloat(AHMEDABAD_LAT), longitude: parseFloat(AHMEDABAD_LNG) },
              radius: 50000.0
            }
          },
          ...(sessionToken ? { sessionToken } : {})
        })
      }
    );

    if (!response.ok) {
      console.warn('places-autocomplete: upstream HTTP', response.status);
      return NextResponse.json({ success: true, suggestions: [] });
    }

    const data = await response.json();
    if (!Array.isArray(data.suggestions)) {
      return NextResponse.json({ success: true, suggestions: [] });
    }

    const suggestions = data.suggestions.map((s: any) => {
      const p = s.placePrediction;
      return {
        id: p.placeId,
        title: p.structuredFormat?.mainText?.text || p.text?.text?.split(',')[0],
        subtitle: p.structuredFormat?.secondaryText?.text || '',
        fullAddress: p.text?.text,
        placeId: p.placeId,
      };
    });

    return NextResponse.json({ success: true, suggestions });
  } catch (error: any) {
    console.warn('places-autocomplete error:', error?.message);
    return NextResponse.json({ success: true, suggestions: [] });
  }
}
