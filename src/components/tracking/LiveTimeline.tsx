"use client";

import { useLiveOrder } from "@/hooks/useLiveOrder";
import { Check, Package, Clock, Wrench, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const TIMELINE_STEPS = [
  { id: "placed", title: "Order Placed", icon: Package },
  { id: "scheduled", title: "Scheduled", icon: Clock },
  { id: "in_progress", title: "In Progress", icon: Wrench },
  { id: "completed", title: "Completed", icon: CheckCircle2 },
];

export function LiveTimeline({ orderId }: { orderId: string }) {
  const order = useLiveOrder(orderId);

  const currentStepIndex = TIMELINE_STEPS.findIndex(s => s.id === order.status);

  return (
    <div className="w-full max-w-md mx-auto p-8 bg-white rounded-3xl shadow-sm border border-gray-100">
      <div className="mb-8">
        <h3 className="text-xl font-bold text-gray-900">Live Status</h3>
        {order.fallbackMessage && (
          <p className="text-sm text-indigo-600 font-medium mt-2 bg-indigo-50 p-3 rounded-xl animate-in fade-in duration-500">
            {order.fallbackMessage}
          </p>
        )}
      </div>

      <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-indigo-500 before:via-gray-200 before:to-transparent">
        {TIMELINE_STEPS.map((step, index) => {
          const Icon = step.icon;
          const isCompleted = index < currentStepIndex;
          const isCurrent = index === currentStepIndex;
          const isUpcoming = index > currentStepIndex;

          return (
            <div key={step.id} className="relative flex items-center">
              <div className={`absolute left-0 w-10 h-10 rounded-full flex items-center justify-center border-4 border-white shadow-sm z-10 transition-all duration-500
                ${isCompleted ? "bg-gray-900 text-white scale-100" : isCurrent ? "bg-indigo-600 text-white ring-4 ring-indigo-100 scale-110" : "bg-gray-100 text-gray-400 scale-95"}
              `}>
                {isCompleted ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
              </div>
              <div className="ml-16">
                <h4 className={`text-lg font-bold transition-colors ${isCurrent ? "text-gray-900" : isCompleted ? "text-gray-700" : "text-gray-400"}`}>
                  {step.title}
                </h4>
                {isCurrent && (
                  <p className="text-sm text-indigo-600 font-medium mt-1 animate-pulse">
                    Updating...
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <Button variant="outline" className="w-full mt-10 h-12 rounded-xl border-gray-200 text-gray-600 hover:bg-gray-50">
        View Full Receipt
      </Button>
    </div>
  );
}
