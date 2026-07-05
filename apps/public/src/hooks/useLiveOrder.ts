import { useState, useEffect } from "react";

export type OrderStatus = "placed" | "scheduled" | "in_progress" | "completed";

export interface LiveOrderState {
  status: OrderStatus;
  fallbackMessage: string | null;
  lastUpdated: Date;
}

export function useLiveOrder(orderId: string) {
  const [order, setOrder] = useState<LiveOrderState>({
    status: "placed",
    fallbackMessage: null,
    lastUpdated: new Date(),
  });

  useEffect(() => {
    // In a real app, this would be a WebSocket or Polling connection
    const interval = setInterval(() => {
      setOrder(prev => {
        if (prev.status === "placed") {
          return { status: "scheduled", fallbackMessage: "We're matching you with a specialist.", lastUpdated: new Date() };
        }
        if (prev.status === "scheduled") {
          return { status: "in_progress", fallbackMessage: "Traffic is a bit heavy, but your provider is on the way!", lastUpdated: new Date() };
        }
        if (prev.status === "in_progress") {
          return { status: "completed", fallbackMessage: "All done! How did we do?", lastUpdated: new Date() };
        }
        return prev;
      });
    }, 10000); // Simulate progression every 10 seconds

    return () => clearInterval(interval);
  }, [orderId]);

  return order;
}
