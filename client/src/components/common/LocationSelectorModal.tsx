import React, { useState } from 'react';
import { X, MapPin, CheckCircle2, AlertCircle, Plus, Navigation } from 'lucide-react';
import { useLocation } from '../../contexts/LocationContext';
import { useAuth } from '../../contexts/AuthContext';
import { Address } from '../../types';

export const LocationSelectorModal: React.FC = () => {
  const {
    isLocationModalOpen,
    setIsLocationModalOpen,
    userAddresses,
    selectedAddress,
    setSelectedAddress,
    checkDeliveryLocation,
    isDeliverable,
    deliveryDistance,
    estimatedMinutes,
    deliveryMessage,
  } = useLocation();

  const { isAuthenticated, setIsAuthModalOpen } = useAuth();
  const [detecting, setDetecting] = useState(false);

  if (!isLocationModalOpen) return null;

  const handleSelectAddress = async (addr: Address) => {
    setSelectedAddress(addr);
    await checkDeliveryLocation(addr.latitude || undefined, addr.longitude || undefined, addr.id);
    setIsLocationModalOpen(false);
  };

  const handleUseCurrentLocation = () => {
    setDetecting(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          await checkDeliveryLocation(lat, lng);
          setDetecting(false);
        },
        (error) => {
          console.warn('Geolocation error:', error);
          // Fallback to demo store vicinity coordinates
          checkDeliveryLocation(12.9784, 77.6408);
          setDetecting(false);
        },
        { timeout: 5000 }
      );
    } else {
      setDetecting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl p-6 sm:p-7 animate-slide-up">
        {/* Close Button */}
        <button
          onClick={() => setIsLocationModalOpen(false)}
          className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-gray-900 leading-tight">
              Select Delivery Location
            </h2>
            <p className="text-xs text-gray-500">
              We deliver within 7.5 km from our physical store in 10-15 minutes
            </p>
          </div>
        </div>

        {/* Deliverability Status Banner */}
        <div
          className={`p-3.5 rounded-2xl border mb-5 flex items-start gap-3 ${
            isDeliverable
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-red-50 border-red-200 text-red-900'
          }`}
        >
          {isDeliverable ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          )}
          <div className="text-xs">
            <p className="font-bold">
              {isDeliverable ? `Delivering in ~${estimatedMinutes} Mins` : 'Out of Delivery Area'}
            </p>
            <p className="opacity-90 mt-0.5">{deliveryMessage}</p>
          </div>
        </div>

        {/* GPS Geolocation Button */}
        <button
          onClick={handleUseCurrentLocation}
          disabled={detecting}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 mb-4 rounded-xl border border-emerald-500 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 text-xs font-bold transition active:scale-95"
        >
          <Navigation className={`w-4 h-4 ${detecting ? 'animate-spin' : ''}`} />
          <span>{detecting ? 'Detecting Location...' : 'Use Current Device Location'}</span>
        </button>

        {/* Saved Addresses List */}
        {isAuthenticated ? (
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                Saved Addresses
              </span>
            </div>

            {userAddresses.length === 0 ? (
              <p className="text-xs text-gray-500 italic py-2">
                No addresses saved yet. Add your address in your profile or at checkout.
              </p>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {userAddresses.map((addr) => {
                  const isSelected = selectedAddress?.id === addr.id;
                  return (
                    <div
                      key={addr.id}
                      onClick={() => handleSelectAddress(addr)}
                      className={`p-3 rounded-2xl border cursor-pointer transition flex items-start justify-between ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500/20'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded-md text-[10px] font-bold uppercase shrink-0 mt-0.5">
                          {addr.addressType}
                        </span>
                        <div>
                          <p className="text-xs font-bold text-gray-900">{addr.fullName} ({addr.phone})</p>
                          <p className="text-xs text-gray-600 mt-0.5">
                            {addr.house}, {addr.street}, {addr.area}, {addr.city} - {addr.pincode}
                          </p>
                          {addr.landmark && (
                            <p className="text-[11px] text-gray-400 mt-0.5">
                              Landmark: {addr.landmark}
                            </p>
                          )}
                        </div>
                      </div>
                      {isSelected && (
                        <span className="text-emerald-600 text-xs font-bold shrink-0 ml-2">
                          Active ✓
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-3 border-t border-gray-100">
            <p className="text-xs text-gray-500 mb-2">Sign in to view and select your saved addresses</p>
            <button
              onClick={() => {
                setIsLocationModalOpen(false);
                setIsAuthModalOpen(true);
              }}
              className="px-4 py-2 bg-gray-900 text-white rounded-xl text-xs font-bold hover:bg-gray-800 transition"
            >
              Sign In to View Addresses
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LocationSelectorModal;