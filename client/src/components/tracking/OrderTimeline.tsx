import React from 'react';
import { CheckCircle2, Clock, Package, Truck, Check, XCircle } from 'lucide-react';
import { OrderStatus, OrderStatusHistory } from '../../types';

interface OrderTimelineProps {
  currentStatus: OrderStatus;
  history?: OrderStatusHistory[];
}

const steps: Array<{ status: OrderStatus; label: string; icon: any }> = [
  { status: 'PLACED', label: 'Order Placed', icon: Clock },
  { status: 'CONFIRMED', label: 'Accepted by Store', icon: CheckCircle2 },
  { status: 'PACKING', label: 'Packing Items', icon: Package },
  { status: 'READY_FOR_DELIVERY', label: 'Ready for Dispatch', icon: Check },
  { status: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', icon: Truck },
  { status: 'DELIVERED', label: 'Delivered', icon: CheckCircle2 },
];

export const OrderTimeline: React.FC<OrderTimelineProps> = ({ currentStatus, history = [] }) => {
  if (currentStatus === 'CANCELLED') {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-red-700">
        <XCircle className="w-6 h-6 shrink-0" />
        <div>
          <h4 className="text-sm font-bold">Order Cancelled</h4>
          <p className="text-xs text-red-600 mt-0.5">
            This order was cancelled. Any online payment has been initiated for refund.
          </p>
        </div>
      </div>
    );
  }

  const currentStepIndex = steps.findIndex((s) => s.status === currentStatus);

  return (
    <div className="py-4">
      <div className="space-y-4">
        {steps.map((step, index) => {
          const isCompleted = index <= currentStepIndex;
          const isCurrent = index === currentStepIndex;
          const StepIcon = step.icon;

          // Find history entry timestamp if available
          const historyEntry = history.find((h) => h.status === step.status);

          return (
            <div key={step.status} className="flex items-start gap-4 relative">
              {/* Vertical connector line */}
              {index < steps.length - 1 && (
                <div
                  className={`absolute left-4 top-8 -bottom-4 w-0.5 ${
                    index < currentStepIndex ? 'bg-emerald-500' : 'bg-gray-200'
                  }`}
                />
              )}

              {/* Icon marker */}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 z-10 transition-colors ${
                  isCompleted
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                    : 'bg-gray-100 text-gray-400 border border-gray-200'
                } ${isCurrent ? 'ring-4 ring-emerald-500/20' : ''}`}
              >
                <StepIcon className="w-4 h-4" />
              </div>

              {/* Label & Details */}
              <div className="flex-1 min-w-0 pt-0.5">
                <div className="flex items-center justify-between">
                  <h4
                    className={`text-xs sm:text-sm font-bold ${
                      isCompleted ? 'text-gray-900' : 'text-gray-400'
                    }`}
                  >
                    {step.label}
                  </h4>
                  {historyEntry && (
                    <span className="text-[10px] text-gray-400">
                      {new Date(historyEntry.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  )}
                </div>
                {historyEntry?.comment && (
                  <p className="text-xs text-gray-500 mt-0.5">{historyEntry.comment}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const OrderStatusBadge: React.FC<{ status: OrderStatus }> = ({ status }) => {
  const styles: Record<OrderStatus, string> = {
    PLACED: 'bg-blue-50 text-blue-700 border-blue-200',
    CONFIRMED: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    PACKING: 'bg-amber-50 text-amber-700 border-amber-200',
    READY_FOR_DELIVERY: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    OUT_FOR_DELIVERY: 'bg-orange-50 text-orange-700 border-orange-200 animate-pulse-subtle',
    DELIVERED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    CANCELLED: 'bg-red-50 text-red-700 border-red-200',
  };

  const labels: Record<OrderStatus, string> = {
    PLACED: 'Order Placed',
    CONFIRMED: 'Confirmed',
    PACKING: 'Packing',
    READY_FOR_DELIVERY: 'Ready for Dispatch',
    OUT_FOR_DELIVERY: '⚡ Out for Delivery',
    DELIVERED: '✓ Delivered',
    CANCELLED: 'Cancelled',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
        styles[status] || 'bg-gray-100 text-gray-700 border-gray-200'
      }`}
    >
      {labels[status] || status}
    </span>
  );
};