"use client";

import { Check, Clock, Package, Wrench, CheckCircle2, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const STEPS = [
  { id: 1, title: "Order Placed", description: "We've received your request.", status: "completed", icon: Package },
  { id: 2, title: "Scheduled", description: "Assigned to a specialist.", status: "completed", icon: Clock },
  { id: 3, title: "In Progress", description: "We are actively working on it.", status: "current", icon: Wrench },
  { id: 4, title: "Completed", description: "Ready for your review.", status: "upcoming", icon: CheckCircle2 },
];

export function OrderTimeline() {
  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h3 className="text-xl font-bold text-gray-900">Order #8892</h3>
          <p className="text-sm text-gray-500 mt-1">Estimated delivery: Today, 5:00 PM</p>
        </div>
        <div className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-sm font-medium">
          In Progress
        </div>
      </div>

      <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-gray-200 before:via-gray-200 before:to-transparent">
        {STEPS.map((step) => {
          const Icon = step.icon;
          const isCompleted = step.status === "completed";
          const isCurrent = step.status === "current";
          
          return (
            <div key={step.id} className="relative flex items-center">
              <div className={`absolute left-0 w-10 h-10 rounded-full flex items-center justify-center border-4 border-white shadow-sm z-10 transition-colors duration-300
                ${isCompleted ? "bg-gray-900 text-white" : isCurrent ? "bg-indigo-600 text-white animate-pulse" : "bg-gray-100 text-gray-400"}
              `}>
                {isCompleted ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
              </div>
              <div className="ml-16">
                <h4 className={`text-lg font-bold ${isCurrent ? "text-gray-900" : isCompleted ? "text-gray-700" : "text-gray-400"}`}>
                  {step.title}
                </h4>
                <p className={`text-sm mt-1 ${isCurrent ? "text-indigo-600 font-medium" : "text-gray-500"}`}>
                  {step.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-10 pt-6 border-t border-gray-100 flex gap-3">
        <Button variant="outline" className="w-full rounded-xl h-12 text-gray-600">
          Modify Request
        </Button>
        <Button className="w-full rounded-xl h-12 bg-gray-900 text-white hover:bg-gray-800">
          <MessageCircle className="w-4 h-4 mr-2" /> Chat with us
        </Button>
      </div>
    </div>
  );
}
