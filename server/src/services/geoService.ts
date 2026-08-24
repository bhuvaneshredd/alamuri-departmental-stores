import prisma from '../config/prisma';

export interface GeoLocation {
  latitude: number;
  longitude: number;
}

export interface DeliveryValidationResult {
  isDeliverable: boolean;
  distanceKm: number;
  maxRadiusKm: number;
  estimatedMinutes: number;
  storeLocation: GeoLocation;
  message: string;
}

/**
 * Calculates the great-circle distance between two coordinates in kilometers
 * using the Haversine formula.
 */
export const calculateHaversineDistance = (
  coord1: GeoLocation,
  coord2: GeoLocation
): number => {
  const R = 6371; // Earth's radius in km
  const dLat = ((coord2.latitude - coord1.latitude) * Math.PI) / 180;
  const dLon = ((coord2.longitude - coord1.longitude) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((coord1.latitude * Math.PI) / 180) *
      Math.cos((coord2.latitude * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return Math.round(distance * 100) / 100; // Round to 2 decimal places
};

/**
 * Validates whether a customer coordinate is within the store's delivery radius
 */
export const validateDeliveryLocation = async (
  customerLocation: GeoLocation
): Promise<DeliveryValidationResult> => {
  let settings = await prisma.storeSetting.findFirst();
  
  if (!settings) {
    settings = await prisma.storeSetting.create({
      data: {
        id: 'default-store-setting',
        storeName: 'QuickStore',
        storeLatitude: 12.9716,
        storeLongitude: 77.5946,
        maxDeliveryRadiusKm: 7.5,
        estimatedDeliveryMinutes: 15,
      },
    });
  }

  const storeLocation: GeoLocation = {
    latitude: settings.storeLatitude,
    longitude: settings.storeLongitude,
  };

  const distanceKm = calculateHaversineDistance(storeLocation, customerLocation);
  const isDeliverable = distanceKm <= settings.maxDeliveryRadiusKm;

  // Estimate delivery time: base 10 mins + 2 mins per km
  const estimatedMinutes = Math.min(
    Math.max(10, Math.round(10 + distanceKm * 2)),
    45
  );

  return {
    isDeliverable,
    distanceKm,
    maxRadiusKm: settings.maxDeliveryRadiusKm,
    estimatedMinutes,
    storeLocation,
    message: isDeliverable
      ? `Delivering to your location in ~${estimatedMinutes} mins (${distanceKm} km away)`
      : `Sorry, your location is ${distanceKm} km away, which exceeds our maximum delivery radius of ${settings.maxDeliveryRadiusKm} km.`,
  };
};
