import React, { useEffect } from 'react';
import { useLocation, useParams, Link, useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { CheckCircle2, Clock, MapPin, Package, ArrowRight, Home } from 'lucide-react';
import { Order } from '../types';

export const OrderConfirmationPage: React.FC = () => {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const order: Order | undefined = location.state?.order;

  useEffect(() => {
    // Launch celebratory confetti
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });
  }, []);

  return (
    <div className="max-w-xl mx-auto py-8 sm:py-12 text-center pb-20">
      <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-10 shadow-xl space-y-6">
        {/* Animated Check */}
        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-4xl mx-auto animate-bounce shadow-md shadow-emerald-600/20">
          ⚡
        </div>

        <div>
          <span className="text-xs font-black tracking-widest text-emerald-600 uppercase">
            ORDER CONFIRMED
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 mt-1">
            Thank You for Your Order!
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-2">
            Your groceries are being packed fresh at the store and will arrive in ~10-15 minutes.
          </p>
        </div>

        {/* Order Details Chip */}
        <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 text-left space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-gray-500">Order Number:</span>
            <span className="font-bold text-gray-900">{orderNumber}</span>
          </div>
          {order && (
            <>
              <div className="flex justify-between">
                <span className="text-gray-500">Total Amount:</span>
                <span className="font-bold text-emerald-700">₹{order.total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Payment:</span>
                <span className="font-bold text-gray-900">
                  {order.paymentMethod === 'CASH_ON_DELIVERY' ? 'Cash on Delivery' : 'Paid Online'}
                </span>
              </div>
            </>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 pt-2">
          <Link
            to={`/orders/${orderNumber}/track`}
            className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 transition active:scale-95"
          >
            <Clock className="w-4 h-4" />
            <span>Track Order Live</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            to="/"
            className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Continue Shopping</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmationPage;