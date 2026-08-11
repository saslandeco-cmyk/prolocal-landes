/**
 * Géocode une adresse via l'API Nominatim d'OpenStreetMap (gratuite, sans clé).
 * Retourne { lat, lng } ou null si introuvable.
 */
export async function geocodeAddress(
  address: string,
  city: string,
  postalCode: string,
  country = "France"
): Promise<{ lat: number; lng: number } | null> {
  try {
    const q = encodeURIComponent(`${address}, ${postalCode} ${city}, ${country}`);
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${q}&format=json&limit=1&countrycodes=fr`,
      { headers: { "Accept-Language": "fr", "User-Agent": "Prolocal-Landes/1.0" } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.length) {
      // Fallback : essayer juste ville + code postal
      const q2 = encodeURIComponent(`${postalCode} ${city}, ${country}`);
      const res2 = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${q2}&format=json&limit=1&countrycodes=fr`,
        { headers: { "Accept-Language": "fr", "User-Agent": "Prolocal-Landes/1.0" } }
      );
      if (!res2.ok) return null;
      const data2 = await res2.json();
      if (!data2.length) return null;
      return { lat: parseFloat(data2[0].lat), lng: parseFloat(data2[0].lon) };
    }
    return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
  } catch {
    return null;
  }
}
