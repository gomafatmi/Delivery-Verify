import { create } from "zustand";
import type { Delivery, DeliveryStatus } from "@/types/delivery";

interface DeliveryState {
  deliveries: Delivery[];
  selectedDelivery: Delivery | null;
  loading: boolean;
  setDeliveries: (deliveries: Delivery[]) => void;
  setSelectedDelivery: (delivery: Delivery | null) => void;
  setLoading: (loading: boolean) => void;
  updateDeliveryStatus: (id: string, status: DeliveryStatus) => void;
}

export const useDeliveryStore = create<DeliveryState>((set) => ({
  deliveries: [],
  selectedDelivery: null,
  loading: false,
  setDeliveries: (deliveries) => set({ deliveries }),
  setSelectedDelivery: (delivery) => set({ selectedDelivery: delivery }),
  setLoading: (loading) => set({ loading }),
  updateDeliveryStatus: (id, status) =>
    set((state) => ({
      deliveries: state.deliveries.map((d) =>
        d.id === id ? { ...d, status } : d
      ),
      selectedDelivery:
        state.selectedDelivery?.id === id
          ? { ...state.selectedDelivery, status }
          : state.selectedDelivery,
    })),
}));
