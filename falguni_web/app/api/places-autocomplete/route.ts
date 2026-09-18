import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q');

    if (!q || q.trim().length < 2) {
      return NextResponse.json({ success: true, suggestions: [] });
    }

    const query = q.trim();
    // Use Nominatim search for Indian places
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=in&addressdetails=1&limit=6`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'FalguniSweetsWeb/1.0 (contact@falguni.com)',
        'Accept': 'application/json',
      },
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      return NextResponse.json({ success: true, suggestions: [] });
    }

    const data = await response.json();
    if (!Array.isArray(data)) {
      return NextResponse.json({ success: true, suggestions: [] });
    }

    const suggestions = data.map((item: any) => {
      const addressObj = item.address || {};
      const road = addressObj.road || addressObj.suburb || addressObj.neighbourhood || '';
      const city = addressObj.city || addressObj.town || addressObj.state_district || '';
      const postcode = addressObj.postcode || '';

      return {
        id: String(item.place_id || Math.random()),
        title: item.name || road || item.display_name.split(',')[0],
        fullAddress: item.display_name,
        landmark: [road, city].filter(Boolean).join(', '),
        pincode: postcode,
      };
    });

    return NextResponse.json({ success: true, suggestions });
  } catch (error: any) {
    console.warn('Autocomplete search error:', error);
    return NextResponse.json({ success: true, suggestions: [] });
  }
}
