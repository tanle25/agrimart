"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, Variant } from '@/shared/types';

export interface CartItem extends Product {
    quantity: number;
    selectedVariant?: Variant;
}

interface CartContextType {
    cartItems: CartItem[];
    addToCart: (product: Product, quantity: number, variant?: Variant) => void;
    removeFromCart: (index: number) => void;
    updateQuantity: (index: number, delta: number) => void;
    clearCart: () => void;
    cartCount: number;
    cartTotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    // Initialize cart from localStorage
    useEffect(() => {
        const saved = localStorage.getItem('cart');
        if (saved) {
            try {
                // eslint-disable-next-line react-hooks/set-state-in-effect
                setCartItems(JSON.parse(saved));
            } catch (e) {
                console.error("Failed to parse cart", e);
            }
        }
        setIsLoaded(true);
    }, []);

    // Save to localStorage whenever cartItems changes, but only after initial load
    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem('cart', JSON.stringify(cartItems));
        }
    }, [cartItems, isLoaded]);

    const addToCart = (product: Product, quantity: number, variant?: Variant) => {
        setCartItems(prev => {
            const existingIndex = prev.findIndex(item =>
                item.id === product.id &&
                ((!item.selectedVariant && !variant) || (item.selectedVariant?.id === variant?.id))
            );

            if (existingIndex >= 0) {
                const newCart = [...prev];
                newCart[existingIndex] = {
                    ...newCart[existingIndex],
                    quantity: newCart[existingIndex].quantity + quantity
                };
                return newCart;
            } else {
                return [...prev, { ...product, quantity, selectedVariant: variant }];
            }
        });
    };

    const removeFromCart = (index: number) => {
        setCartItems(prev => prev.filter((_, i) => i !== index));
    };

    const updateQuantity = (index: number, delta: number) => {
        setCartItems(prev => {
            const newCart = [...prev];
            const item = { ...newCart[index] };
            const newQty = item.quantity + delta;

            if (newQty > 0) {
                item.quantity = newQty;
                newCart[index] = item;
            }
            return newCart;
        });
    };

    const clearCart = () => {
        setCartItems([]);
    };

    const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    // Calculate total assuming local price is correct for display
    // Real validation happens on backend
    const cartTotal = cartItems.reduce((sum, item) => {
        const price = item.selectedVariant ? (item.selectedVariant.salePrice || item.selectedVariant.price) : (item.salePrice || item.price);
        return sum + (price * item.quantity);
    }, 0);

    return (
        <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQuantity, clearCart, cartCount, cartTotal }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error("useCart must be used within a CartProvider");
    }
    return context;
};
