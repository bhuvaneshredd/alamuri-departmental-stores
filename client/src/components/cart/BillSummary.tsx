import React from 'react';
import { PricingBreakdown } from '../../types';

interface BillSummaryProps {
  pricing: PricingBreakdown | null;
  subtotal: number;
}

export const BillSummary: React.FC<BillSummaryProps> = ({ pricing, subtotal }) => {
  const deliveryFee = pricing?.deliveryFee ?? 25;
  const tax = pricing?.tax ?? Math.round(subtotal * 0.05 * 100) / 100;
  const couponDiscount = pricing?.couponDiscount ?? 0;
  const grandTotal = pricing?.grandTotal ?? Math.max(0, subtotal - couponDiscount + deliveryFee + tax);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-3">
      <h3 className="text-xs font-extrabold text-gray-900 uppercase tracking-wider">
        Bill Breakdown
      </h3>

      <div className="space-y-2 text-xs">
        <div className="flex justify-between text-gray-600">
          <span>Items Total</span>
          <span className="font-semibold text-gray-900">₹{subtotal.toFixed(2)}</span>
        </div>

        {pricing?.totalProductSavings ? (
          <div className="flex justify-between text-emerald-600 font-semibold">
            <span>MRP Savings</span>
            <span>-₹{pricing.totalProductSavings.toFixed(2)}</span>
          </div>
        ) : null}

        {couponDiscount > 0 ? (
          <div className="flex justify-between text-emerald-600 font-semibold">
            <span>Coupon Discount ({pricing?.couponCode})</span>
            <span>-₹{couponDiscount.toFixed(2)}</span>
          </div>
        ) : null}

        <div className="flex justify-between text-gray-600">
          <span>Delivery Partner Fee</span>
          <span>
            {deliveryFee === 0 ? (
              <span className="text-emerald-600 font-bold">FREE</span>
            ) : (
              `₹${deliveryFee.toFixed(2)}`
            )}
          </span>
        </div>

        <div className="flex justify-between text-gray-600">
          <span>Government Taxes & Charges (5%)</span>
          <span>₹{tax.toFixed(2)}</span>
        </div>

        <div className="border-t border-gray-100 pt-3 flex justify-between text-base font-black text-gray-900">
          <span>Grand Total</span>
          <span className="text-emerald-700">₹{grandTotal.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};

export default BillSummary;