import React, { createContext, useContext, useState, useEffect } from 'react';
import { Address } from '../types';
import { addressService } from '../services';
import { useAuth } from './AuthContext';

interface LocationContextType {
  selectedAddress: Address | null;
  setSelectedAddress: (addr: Address | null) => void;
  isDeliverable: boolean;
  deliveryDistance: number;
  estimatedMinutes: number;
  deliveryMessage: string;
  isLocationModalOpen: boolean;
  setIsLocationModalOpen: (open: boolean) => void;
  checkDeliveryLocation: (lat?: number, lng?: number, addressId?: string) => Promise<boolean>;
  userAddresses: Address[];
  loadUserAddresses: () => Promise<void>;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [userAddresses, setUserAddresses] = useState<Address[]>([]);
  const [isDeliverable, setIsDeliverable] = useState<boolean>(true);
  const [deliveryDistance, setDeliveryDistance] = useState<number>(2.5);
  const [estimatedMinutes, setEstimatedMinutes] = useState<number>(15);
  const [deliveryMessage, setDeliveryMessage] = useState<string>('Delivering in ~15 mins');
  const [isLocationModalOpen, setIsLocationModalOpen] = useState<boolean>(false);

  const loadUserAddresses = async () => {
    if (!isAuthenticated) return;
    try {
      const res = await addressService.getAddresses();
      if (res.data.success && res.data.data) {
        setUserAddresses(res.data.data);
        const defaultAddr = res.data.data.find((a) => a.isDefault) || res.data.data[0];
        if (defaultAddr && !selectedAddress) {
          setSelectedAddress(defaultAddr);
          checkDeliveryLocation(defaultAddr.latitude || undefined, defaultAddr.longitude || undefined, defaultAddr.id);
        }
      }
    } catch (e) {
      console.error('Failed to load user addresses:', e);
    }
  };

  useEffect(() => {
    loadUserAddresses();
  }, [isAuthenticated]);

  const checkDeliveryLocation = async (
    lat?: number,
    lng?: number,
    addressId?: string
  ): Promise<boolean> => {
    try {
      const res = await addressService.validateDelivery({ latitude: lat, longitude: lng, addressId });
      if (res.data.success && res.data.data) {
        setIsDeliverable(res.data.data.isDeliverable);
        setDeliveryDistance(res.data.data.distanceKm);
        setEstimatedMinutes(res.data.data.estimatedMinutes);
        setDeliveryMessage(res.data.data.message);
        return res.data.data.isDeliverable;
      }
    } catch (e) {
      console.error('Delivery check error:', e);
    }
    return true;
  };

  return (
    <LocationContext.Provider
      value={{
        selectedAddress,
        setSelectedAddress,
        isDeliverable,
        deliveryDistance,
        estimatedMinutes,
        deliveryMessage,
        isLocationModalOpen,
        setIsLocationModalOpen,
        checkDeliveryLocation,
        userAddresses,
        loadUserAddresses,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (!context) throw new Error('useLocation must be used within a LocationProvider');
  return context;
};