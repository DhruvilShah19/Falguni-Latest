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

    const params = new URLSearchParams({
      input: q.trim(),
      key: API_KEY,
      components: 'country:in',
      location: `${AHMEDABAD_LAT},${AHMEDABAD_LNG}`,
      radius: '50000',
      language: 'en',
      ...(sessionToken ? { sessiontoken: sessionToken } : {}),
    });

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/autocomplete/json?${params}`,
      { 
        signal: AbortSignal.timeout(8000), 
        cache: 'no-store',
        headers: { 'Referer': 'https://www.falgunigruhudhyog.in/' }
      }
    );

    if (!response.ok) {
      console.warn('places-autocomplete: upstream HTTP', response.status);
      return NextResponse.json({ success: true, suggestions: [] });
    }

    const data = await response.json();
    if (data.status !== 'OK' || !Array.isArray(data.predictions)) {
      // ZERO_RESULTS is not an error — it just means nothing matched.
      if (data.status !== 'ZERO_RESULTS') {
        console.warn('places-autocomplete: status', data.status, data.error_message);
      }
      return NextResponse.json({ success: true, suggestions: [] });
    }

    const suggestions = data.predictions.map((p: any) => ({
      id: p.place_id,
      title: p.structured_formatting?.main_text || p.description.split(',')[0],
      subtitle: p.structured_formatting?.secondary_text || '',
      fullAddress: p.description,
      placeId: p.place_id,
    }));

    return NextResponse.json({ success: true, suggestions });
  } catch (error: any) {
    console.warn('places-autocomplete error:', error?.message);
    return NextResponse.json({ success: true, suggestions: [] });
  }
}
