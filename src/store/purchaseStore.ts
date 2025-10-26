import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Product = 'pro' | 'extra_life' | 'power_up';

interface PurchaseStore {
  isPro: boolean;
  purchasedProducts: Set<Product>;
  hasPurchased: (product: Product) => boolean;
  setPro: (isPro: boolean) => void;
  addPurchase: (product: Product) => void;
}

export const usePurchaseStore = create<PurchaseStore>()(
  persist(
    (set, get) => ({
      isPro: false,
      purchasedProducts: new Set<Product>(),
      hasPurchased: (product: Product) => {
        if (product === 'pro') {
          return get().isPro;
        }
        return get().purchasedProducts.has(product);
      },
      setPro: (isPro: boolean) => {
        set({ isPro });
      },
      addPurchase: (product: Product) => {
        const current = get().purchasedProducts;
        const updated = new Set(current);
        updated.add(product);
        set({ purchasedProducts: updated });
        if (product === 'pro') {
          set({ isPro: true });
        }
      },
    }),
    {
      name: 'purchase-store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);


