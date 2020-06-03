import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const cart = await AsyncStorage.getItem('@GoMarketPlace:cart');

      if (cart) {
        setProducts([...JSON.parse(cart)]);
      }
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async product => {
      const saveProduct = {
        ...product,
        quantity: 1,
      };

      setProducts([...products, saveProduct]);

      await AsyncStorage.setItem(
        '@GoMarketPlace:cart',
        JSON.stringify(products),
      );
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      const cartProducts = products.map(product => {
        if (product.id === id) {
          const quantity = product.quantity + 1;
          return { ...product, quantity };
        }
        return product;
      });

      setProducts(cartProducts);

      await AsyncStorage.setItem(
        '@GoMarketPlace:cart',
        JSON.stringify(cartProducts),
      );
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const cartProducts = products.map(product => {
        if (product.id === id && product.quantity >= 1) {
          const quantity = product.quantity - 1;
          return { ...product, quantity };
        }
        return product;
      });

      setProducts(cartProducts);

      await AsyncStorage.setItem(
        '@GoMarketPlace:cart',
        JSON.stringify(cartProducts),
      );
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
