"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Search, Monitor, Zap, Sparkles, Wrench } from "lucide-react";
import { useFuzzySearch } from "@/hooks/useFuzzySearch";

const SERVICES_CATALOG = [
  { id: "1", title: "Website Audit", description: "Deep dive into SEO and UX", icon: Monitor, color: "bg-blue-100 text-blue-600" },
  { id: "2", title: "Performance Fix", description: "Make your site lightning fast", icon: Zap, color: "bg-amber-100 text-amber-600" },
  { id: "3", title: "Design Refresh", description: "Modernize your look and feel", icon: Sparkles, color: "bg-purple-100 text-purple-600" },
  { id: "4", title: "Plumbing Repair", description: "Fix leaks and pipes", icon: Wrench, color: "bg-emerald-100 text-emerald-600" },
  { id: "5", title: "Deep Cleaning", description: "Spotless home cleaning", icon: Sparkles, color: "bg-teal-100 text-teal-600" },
];

export function ServiceSearch() {
  const [query, setQuery] = useState("");
  const results = useFuzzySearch(SERVICES_CATALOG, ["title", "description"], query);

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <div className="relative group">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-indigo-500 transition-colors">
          <Search className="h-6 w-6" />
        </div>
        <Input
          type="text"
          placeholder="Try 'cleaning' or 'plumb'..."
          className="w-full pl-14 pr-6 h-16 text-lg rounded-2xl border-2 border-gray-100 bg-white shadow-sm focus-visible:ring-0 focus-visible:border-indigo-500 transition-all placeholder:text-gray-300"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="space-y-3">
        {results.length > 0 ? (
          results.map((service) => {
            const Icon = service.icon;
            return (
              <button key={service.id} className="w-full flex items-center p-4 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all text-left animate-in fade-in zoom-in duration-200">
                <div className={`p-3 rounded-xl ${service.color} mr-4`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">{service.title}</h4>
                  <p className="text-sm text-gray-500">{service.description}</p>
                </div>
              </button>
            );
          })
        ) : (
          <div className="py-12 text-center animate-in fade-in duration-300">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-300" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">We couldn't find a match</h3>
            <p className="text-gray-500 mt-1">Try a different word, or browse our categories.</p>
          </div>
        )}
      </div>
    </div>
  );
}
