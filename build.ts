import { useState, useEffect, useCallback } from "react";

const PREMIUM_KEY = "radarvibe_premium_status";
const AD_TRIGGER_KEY = "radarvibe_ad_trigger_count";

export function usePremiumStatus() {
  const [isPremium, setIsPremium] = useState(() => {
    return localStorage.getItem(PREMIUM_KEY) === "true";
  });

  const activate = useCallback((plan: string) => {
    localStorage.setItem(PREMIUM_KEY, "true");
    setIsPremium(true);
  }, []);

  const deactivate = useCallback(() => {
    localStorage.removeItem(PREMIUM_KEY);
    setIsPremium(false);
  }, []);

  return { isPremium, activate, deactivate };
}

export function useAdTrigger() {
  const [count, setCount] = useState(() => {
    return parseInt(localStorage.getItem(AD_TRIGGER_KEY) || "0", 10);
  });

  const trigger = useCallback(() => {
    const newCount = count + 1;
    localStorage.setItem(AD_TRIGGER_KEY, newCount.toString());
    setCount(newCount);
    return newCount;
  }, [count]);

  return { count, trigger };
}

export function useUserLocation() {
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation not supported");
      setLocation({ lat: 48.8566, lng: 2.3522 });
      return;
    }

    const timeout = setTimeout(() => {
      if (!location) {
        setLocation({ lat: 48.8566, lng: 2.3522 });
        setError("Location timeout");
      }
    }, 5000);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        clearTimeout(timeout);
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      () => {
        clearTimeout(timeout);
        setLocation({ lat: 48.8566, lng: 2.3522 });
        setError("Location access denied");
      },
      { enableHighAccuracy: true, timeout: 5000 }
    );

    return () => clearTimeout(timeout);
  }, []);

  return { location, error };
}

export function getDistanceKm(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
