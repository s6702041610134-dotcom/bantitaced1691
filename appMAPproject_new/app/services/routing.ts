export type Coordinate = { latitude: number; longitude: number };

export type RouteResult = {
  coordinates: Coordinate[];
  distanceKm: number | null; // null if routing failed (honest fallback)
  isSuccess: boolean;
};

// Calculate straight-line distance (Haversine formula) in km
export function calculateStraightLineDistance(coords: Coordinate[]): number {
  if (coords.length < 2) return 0;
  let total = 0;
  for (let i = 0; i < coords.length - 1; i++) {
    const lat1 = coords[i].latitude;
    const lon1 = coords[i].longitude;
    const lat2 = coords[i + 1].latitude;
    const lon2 = coords[i + 1].longitude;

    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    total += R * c;
  }
  return total;
}

// Fetch real road navigation route from OSRM with AbortController to prevent race conditions
export async function fetchOSRMRoute(
  coords: Coordinate[],
  signal?: AbortSignal
): Promise<RouteResult> {
  if (coords.length < 2) {
    return {
      coordinates: coords,
      distanceKm: 0,
      isSuccess: true,
    };
  }

  try {
    const coordsString = coords
      .map((c) => `${c.longitude},${c.latitude}`)
      .join(';');

    const response = await fetch(
      `https://router.project-osrm.org/route/v1/driving/${coordsString}?overview=full&geometries=geojson`,
      { signal }
    );

    if (!response.ok) {
      throw new Error(`OSRM API returned status ${response.status}`);
    }

    const data = await response.json();

    if (data.routes && data.routes.length > 0) {
      const route = data.routes[0];
      const decodedCoords: Coordinate[] = route.geometry.coordinates.map(
        ([lon, lat]: [number, number]) => ({
          latitude: lat,
          longitude: lon,
        })
      );
      return {
        coordinates: decodedCoords,
        distanceKm: route.distance / 1000, // meters -> km
        isSuccess: true,
      };
    }
  } catch (error: any) {
    if (error.name === 'AbortError') {
      // Request was cancelled due to user updating route fast
      throw error;
    }
    console.log('OSRM routing fetch error:', error);
  }

  // Honest fallback: Use straight-line distance if OSRM failed
  const straightDistance = calculateStraightLineDistance(coords);
  return {
    coordinates: coords,
    distanceKm: straightDistance > 0 ? straightDistance : null,
    isSuccess: false,
  };
}
