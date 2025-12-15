"use client";

import { GoogleMap, OverlayView, useJsApiLoader } from "@react-google-maps/api";
import { mapDarkStyle } from "./map-dark-style";

export default function MapMini({ lat, lng, price }: { lat: number; lng: number; price?: number }) {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY!,
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
        disableDefaultUI: true,
        zoomControl: true,
        gestureHandling: "greedy",
      }}
    >
      {price && (
        <OverlayView
          position={{ lat, lng }}
          mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
        >
          <div className="transform -translate-x-1/2 -translate-y-full mb-2">
            <div className="bg-white text-gray-900 px-3 py-1.5 rounded-full font-bold text-sm shadow-lg border-2 border-gray-900 hover:scale-110 transition-transform cursor-pointer">
              RM {price}
            </div>
          </div>
        </OverlayView>
      )}
    </GoogleMap>
  );
}
