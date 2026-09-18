import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = searchParams.get('lat');
    const lon = searchParams.get('lon') || searchParams.get('lng');

    if (!lat || !lon) {
      return NextResponse.json(
        { success: false, error: 'Latitude and longitude parameters are required.' },
        { status: 400 }
      );
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lon);

    if (isNaN(latitude) || isNaN(longitude)) {
      return NextResponse.json(
        { success: false, error: 'Invalid latitude or longitude format.' },
        { status: 400 }
      );
    }

    // Call OpenStreetMap Nominatim reverse geocode (Free, no billing, no ProjectDeniedMapError)
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'FalguniSweetsWeb/1.0 (contact@falguni.com)',
        'Accept': 'application/json',
      },
      next: { revalidate: 3600 }, // cache for 1 hr
    });

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: `Reverse geocoding upstream error: ${response.status}` },
        { status: 502 }
      );
    }

    const data = await response.json();
    const addressObj = data.address || {};

    // Extract address components
    const road = addressObj.road || addressObj.pedestrian || addressObj.street || '';
    const neighbourhood = addressObj.neighbourhood || addressObj.suburb || addressObj.residential || '';
    const city = addressObj.city || addressObj.town || addressObj.village || addressObj.county || '';
    const state = addressObj.state || '';
    const postcode = addressObj.postcode || '';

    // Build clean readable Indian address string
    const parts = [
      road,
      neighbourhood,
      city,
      state,
      postcode ? `${postcode}, India` : 'India',
    ].filter(Boolean);

    const formattedAddress = parts.length > 0 ? parts.join(', ') : (data.display_name || 'Current GPS Location');
    const landmark = [neighbourhood, city].filter(Boolean).join(', ') || road || '';

    return NextResponse.json({
      success: true,
      address: formattedAddress,
      landmark,
      city,
      state,
      pincode: postcode,
      raw: data,
    });
  } catch (error: any) {
    console.error('Error in /api/reverse-geocode:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to reverse geocode location.' },
      { status: 500 }
    );
  }
}
