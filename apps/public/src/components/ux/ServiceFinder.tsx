"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Search, Sparkles, Wrench, Monitor, Zap } from "lucide-react";

const SERVICES = [
  { id: 1, title: "Website Audit", icon: Monitor, color: "bg-blue-100 text-blue-600" },
  { id: 2, title: "Performance Fix", icon: Zap, color: "bg-amber-100 text-amber-600" },
  { id: 3, title: "Design Refresh", icon: Sparkles, color: "bg-purple-100 text-purple-600" },
  { id: 4, title: "Tech Support", icon: Wrench, color: "bg-emerald-100 text-emerald-600" },
];

export function ServiceFinder() {
  const [query, setQuery] = useState("");

  const filteredServices = useMemo(() => {
    return SERVICES.filter(s => s.title.toLowerCase().includes(query.toLowerCase()));
  }, [query]);

  return (
    <div className="w-full max-w-3xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
          What do you need help with?
        </h1>
        <p className="text-lg text-gray-500 max-w-xl mx-auto">
          Type what you're looking for, or pick an option below. We'll handle the rest.
        </p>
      </div>

      <div className="relative group">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-indigo-500 transition-colors">
          <Search className="h-6 w-6" />
        </div>
        <Input
          type="text"
          placeholder="Try 'Design Refresh'..."
          className="w-full pl-14 pr-6 h-16 text-lg rounded-2xl border-2 border-gray-100 bg-white shadow-sm focus-visible:ring-0 focus-visible:border-indigo-500 transition-all placeholder:text-gray-300"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {filteredServices.length > 0 ? (
          filteredServices.map(service => {
            const Icon = service.icon;
            return (
              <button key={service.id} className="flex flex-col items-center justify-center p-6 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200 hover:-translate-y-1 transition-all duration-200">
                <div className={`p-4 rounded-xl ${service.color} mb-4`}>
                  <Icon className="w-6 h-6" />
                </div>
                <span className="font-medium text-gray-900">{service.title}</span>
              </button>
            );
          })
        ) : (
          <div className="col-span-full py-12 text-center text-gray-500">
            We couldn't find that, but let's try something else.
          </div>
        )}
      </div>
    </div>
  );
}
