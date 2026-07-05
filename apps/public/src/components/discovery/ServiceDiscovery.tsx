"use client";

import { useState } from "react";
import { useFuzzySearch } from "@/hooks/useFuzzySearch";
import { Search, Sparkles } from "lucide-react";

export interface Service {
  id: string;
  title: string;
  category: string;
  price?: number;
}

interface ServiceDiscoveryProps {
  initialServices: Service[];
  onSelect?: (service: Service) => void;
}

export function ServiceDiscovery({ initialServices, onSelect }: ServiceDiscoveryProps) {
  const [query, setQuery] = useState("");
  const results = useFuzzySearch(initialServices, ["title", "category"], query);
  
  // Simulated loading state for demonstration of Zero-CLS logic
  // In a real scenario, this would be true while fetching data from the server
  const isLoading = !initialServices || initialServices.length === 0 && query === "";

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input 
          type="text"
          className="w-full h-14 pl-12 pr-4 bg-gray-50 border-none rounded-2xl text-lg focus:ring-2 focus:ring-blue-500 transition-all outline-none"
          placeholder="What are you looking for today?"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          // ZERO-CLS SKELETONS: Fixed aspect ratios and heights prevent layout jumps
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="aspect-[4/3] w-full rounded-2xl bg-gray-100 animate-pulse" />
          ))
        ) : results.length > 0 ? (
          results.map(service => (
            <div 
              key={service.id} 
              onClick={() => onSelect?.(service)}
              className="aspect-[4/3] w-full rounded-2xl border border-gray-100 p-6 flex flex-col justify-between hover:shadow-lg transition-shadow bg-white cursor-pointer gpu-accelerate"
            >
              <h3 className="text-xl font-bold text-gray-900">{service.title}</h3>
              <div className="flex items-center justify-between mt-auto">
                <p className="text-sm text-gray-500">{service.category}</p>
                {service.price !== undefined && (
                  <p className="font-medium text-gray-900">${service.price}</p>
                )}
              </div>
            </div>
          ))
        ) : (
          // Sweet, comforting fallback microcopy when nothing is found
          <div className="col-span-full py-16 flex flex-col items-center justify-center text-center animate-in fade-in zoom-in-95">
            <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-4">
              <Sparkles className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">We're coming up empty!</h3>
            <p className="text-gray-500 max-w-md">
              We couldn't find exactly what you were searching for. Try tweaking your words, or let us know what you need and we'll see how we can help.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
