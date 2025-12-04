"use client";

import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";
import { mapDarkStyle } from "./map-dark-style";

export default function MapMini({ lat, lng }: { lat: number; lng: number }) {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY!, // IMPORTANT
  });

  if (!isLoaded) return <div className="text-gray-400">Loading map...</div>;

  return (
<GoogleMap
  zoom={15}
  center={{ lat, lng }}
  mapContainerStyle={{
    width: "100%",
    height: "220px",
    borderRadius: "16px",
  }}
  options={{
    styles: mapDarkStyle,
    disableDefaultUI: true,          // hilangkan UI default
    zoomControl: true,               // kekalkan zoom buttons
    gestureHandling: "greedy",       // zoom scroll
  }}
>
      <Marker position={{ lat, lng }} />
    </GoogleMap>
  );
}
