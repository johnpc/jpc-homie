import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const MDOT_BASE_URL = 'https://mdotjboss.state.mi.us/MiDrive/cameras/searchCamera';
const COUNTY = ' Washtenaw County';

// Routes with the leading space as required by MDOT API
const HIGHWAYS = [' I-94', ' M-14', ' US-23'];

// Home coordinates (758 S Maple Rd, Ann Arbor, MI 48103)
const HOME_LAT = 42.273;
const HOME_LON = -83.782;
const DEFAULT_RADIUS_MILES = 7;

interface MDOTRawCamera {
  route: string;
  county: string;
  location: string;
  direction: string;
  image: string;
}

interface ParsedCamera {
  id: number;
  route: string;
  location: string;
  direction: string;
  latitude: number;
  longitude: number;
  imageUrl: string;
  thumbnailUrl: string;
  distanceMiles?: number;
}

// Haversine formula to calculate distance between two points
function getDistanceMiles(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3958.8; // Earth's radius in miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function parseCamera(raw: MDOTRawCamera): ParsedCamera | null {
  // Extract lat, lon, id from county field
  // Format: "Washtenaw County <a href="/MiDrive/map?cameras=true&lat=42.291401&lon=-84.084198&zoom=15&id=2010"target="_blank">Go to</a>"
  const latMatch = raw.county.match(/lat=([0-9.-]+)/);
  const lonMatch = raw.county.match(/lon=([0-9.-]+)/);
  const idMatch = raw.county.match(/id=(\d+)/);

  // Extract image URL from image field
  // Format: "<img ... src="https://micamerasimages.net/thumbs/internet_cam_055.flv.jpg?item=1" ...>"
  const srcMatch = raw.image.match(/src="([^"]+)"/);

  if (!latMatch || !lonMatch || !idMatch || !srcMatch) {
    console.error('Failed to parse camera:', raw);
    return null;
  }

  const thumbnailUrl = srcMatch[1];
  // Convert thumbnail URL to full-size image URL (remove /thumbs/ and ?item=1)
  const imageUrl = thumbnailUrl.replace('/thumbs/', '/').replace(/\?item=\d+/, '');

  return {
    id: parseInt(idMatch[1], 10),
    route: raw.route,
    location: raw.location.trim().replace(/^@\s*/, ''),
    direction: raw.direction,
    latitude: parseFloat(latMatch[1]),
    longitude: parseFloat(lonMatch[1]),
    imageUrl,
    thumbnailUrl,
  };
}

async function fetchCamerasForRoute(route: string): Promise<ParsedCamera[]> {
  const timestamp = Date.now();
  const url = `${MDOT_BASE_URL}?route=${encodeURIComponent(route)}&county=${encodeURIComponent(COUNTY)}&_=${timestamp}`;

  const response = await fetch(url, {
    headers: {
      accept: 'application/json, text/javascript, */*; q=0.01',
      'accept-language': 'en-US,en;q=0.9',
      referer: 'https://mdotjboss.state.mi.us/MiDrive/cameras',
      'user-agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36',
      'x-requested-with': 'XMLHttpRequest',
    },
  });

  if (!response.ok) {
    console.error(`Failed to fetch cameras for ${route}: ${response.status}`);
    return [];
  }

  const data = (await response.json()) as MDOTRawCamera[];
  return data.map(parseCamera).filter((c): c is ParsedCamera => c !== null);
}

function addDistanceAndFilter(cameras: ParsedCamera[], radiusMiles: number): ParsedCamera[] {
  return cameras
    .map((camera) => ({
      ...camera,
      distanceMiles:
        Math.round(getDistanceMiles(HOME_LAT, HOME_LON, camera.latitude, camera.longitude) * 10) /
        10,
    }))
    .filter((camera) => camera.distanceMiles <= radiusMiles)
    .sort((a, b) => (a.distanceMiles ?? 0) - (b.distanceMiles ?? 0));
}

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const routeParam = searchParams.get('route');
    const radiusParam = searchParams.get('radius');
    const radiusMiles = radiusParam ? parseFloat(radiusParam) : DEFAULT_RADIUS_MILES;

    // If a specific route is requested, only fetch that one
    if (routeParam) {
      const normalizedRoute = routeParam.startsWith(' ') ? routeParam : ` ${routeParam}`;
      const validRoutes = HIGHWAYS.map((h) => h.trim().toLowerCase());

      if (!validRoutes.includes(normalizedRoute.trim().toLowerCase())) {
        return NextResponse.json(
          { error: `Invalid route. Valid routes are: ${HIGHWAYS.map((h) => h.trim()).join(', ')}` },
          { status: 400 }
        );
      }

      const cameras = await fetchCamerasForRoute(normalizedRoute);
      const filtered = addDistanceAndFilter(cameras, radiusMiles);
      return NextResponse.json({
        route: normalizedRoute.trim(),
        radiusMiles,
        count: filtered.length,
        cameras: filtered,
      });
    }

    // Fetch all routes in parallel
    const results = await Promise.all(
      HIGHWAYS.map(async (route) => {
        const cameras = await fetchCamerasForRoute(route);
        return {
          route: route.trim(),
          cameras,
        };
      })
    );

    // Combine results and filter by distance
    const allCameras: ParsedCamera[] = [];
    const byRoute: Record<string, ParsedCamera[]> = {};

    for (const result of results) {
      const filtered = addDistanceAndFilter(result.cameras, radiusMiles);
      byRoute[result.route] = filtered;
      allCameras.push(...filtered);
    }

    // Sort all cameras by distance
    allCameras.sort((a, b) => (a.distanceMiles ?? 0) - (b.distanceMiles ?? 0));

    return NextResponse.json({
      radiusMiles,
      totalCount: allCameras.length,
      byRoute: Object.fromEntries(
        Object.entries(byRoute).map(([route, cameras]) => [
          route,
          { count: cameras.length, cameras },
        ])
      ),
      allCameras,
    });
  } catch (error) {
    console.error('Error fetching traffic cameras:', error);
    return NextResponse.json({ error: 'Failed to fetch traffic cameras' }, { status: 500 });
  }
}
