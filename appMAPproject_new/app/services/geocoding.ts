export type SearchResult = {
  place_id: string;
  display_name: string;
  lat: number;
  lon: number;
};

// Clean Search API combining Nominatim + Photon with true coordinate deduplication
export async function searchPlaces(
  query: string,
  signal?: AbortSignal
): Promise<SearchResult[]> {
  if (!query.trim() || query.length < 2) return [];

  const encoded = encodeURIComponent(query.trim());

  const nomPromise = fetch(
    `https://nominatim.openstreetmap.org/search?format=json&q=${encoded}&limit=5&accept-language=th,en&countrycodes=th`,
    { signal }
  )
    .then((r) => r.json())
    .then((data) => {
      if (!Array.isArray(data)) return [];
      return data.map((item: any, idx: number) => ({
        place_id: `nom-${item.place_id || idx}`,
        display_name: item.display_name || '',
        lat: parseFloat(item.lat),
        lon: parseFloat(item.lon),
      }));
    })
    .catch(() => []);

  const photonPromise = fetch(
    `https://photon.komoot.io/api/?q=${encoded}&limit=5&lat=13.7563&lon=100.5018`,
    { signal }
  )
    .then((r) => r.json())
    .then((data) => {
      if (!data || !data.features) return [];
      return data.features.map((f: any, idx: number) => {
        const nameParts = [
          f.properties.name,
          f.properties.street,
          f.properties.district,
          f.properties.city,
          f.properties.country,
        ].filter(Boolean);
        return {
          place_id: `photon-${idx}-${Date.now()}`,
          display_name: nameParts.join(', '),
          lat: f.geometry.coordinates[1],
          lon: f.geometry.coordinates[0],
        };
      });
    })
    .catch(() => []);

  const [nomResults, photonResults] = await Promise.all([nomPromise, photonPromise]);

  // Combine and deduplicate by coordinate grid key (to 4 decimal places ~ 11m)
  const combined = [...nomResults, ...photonResults];
  const uniqueResults: SearchResult[] = [];
  const seenKeys = new Set<string>();

  for (const item of combined) {
    if (!item.display_name || isNaN(item.lat) || isNaN(item.lon)) continue;
    const key = `${item.lat.toFixed(4)},${item.lon.toFixed(4)}`;
    if (!seenKeys.has(key)) {
      seenKeys.add(key);
      uniqueResults.push(item);
    }
  }

  return uniqueResults.slice(0, 7);
}

// Reverse Geocoding for map touches
export async function reverseGeocode(
  lat: number,
  lon: number,
  signal?: AbortSignal
): Promise<string> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&accept-language=th,en`,
      { signal }
    );
    const data = await response.json();

    let realName = '';
    if (data && data.address) {
      realName =
        data.address.amenity ||
        data.address.building ||
        data.address.shop ||
        data.address.tourism ||
        data.address.leisure ||
        data.address.office ||
        data.address.road ||
        data.address.suburb ||
        data.address.quarter ||
        (data.display_name ? data.display_name.split(',')[0] : '');
    } else if (data && data.display_name) {
      realName = data.display_name.split(',')[0];
    }

    if (realName && realName.trim().length > 0) {
      return realName.trim();
    }
  } catch (error: any) {
    if (error.name !== 'AbortError') {
      console.log('Reverse geocoding error:', error);
    }
  }

  return `พิกัด (${lat.toFixed(4)}, ${lon.toFixed(4)})`;
}
