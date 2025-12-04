import { LANDMARKS } from "./landmarks";

export async function getDistances(lat: number, lng: number) {
  const origins = `${lat},${lng}`;
  const destinations = Object.values(LANDMARKS)
    .map((l) => `${l.lat},${l.lng}`)
    .join("|");

  const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origins}&destinations=${destinations}&key=${process.env.GOOGLE_MAPS_KEY}`;

  const res = await fetch(url);
  const data = await res.json();

  // If API failed or rows missing
  if (!data.rows || !data.rows[0] || !data.rows[0].elements) {
    console.error("Google API response error:", data);
    return [];
  }

  const elements = data.rows[0].elements;

  return (Object.keys(LANDMARKS) as Array<keyof typeof LANDMARKS>).map((key, i) => {
    const element = elements[i];

    // If destination not found or invalid
    if (!element || element.status !== "OK") {
      return {
        name: LANDMARKS[key].name,
        distance: "N/A",
        duration: "N/A",
      };
    }

    return {
      name: LANDMARKS[key].name,
      distance: element.distance.text,
      duration: element.duration.text,
    };
  });
}
