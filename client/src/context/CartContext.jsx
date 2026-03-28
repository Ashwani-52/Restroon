// src/context/CartContext.jsx
import { createContext, useContext, useState } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
    const [cart, setCart] = useState([]);   // [{ menuItem, name, price, quantity, image }]
    const [cafeId, setCafeId] = useState(null);

    const addToCart = (item, cafe_id) => {
        // If adding from different cafe, clear cart
        if (cafeId && cafeId !== cafe_id) {
            if (!window.confirm('Your cart has items from another cafe. Clear and add new item?')) return;
            setCart([]);
        }
        setCafeId(cafe_id);
        setCart(prev => {
            const existing = prev.find(i => i.menuItem === item._id);
            if (existing) {
                return prev.map(i =>
                    i.menuItem === item._id
                        ? { ...i, quantity: i.quantity + 1 }
                        : i
                );
            }
            return [...prev, {
                menuItem: item._id,
                name: item.name,
                price: item.price,
                image: item.image,
                quantity: 1
            }];
        });
    };

    const removeFromCart = (menuItemId) => {
        setCart(prev => prev.filter(i => i.menuItem !== menuItemId));
        if (cart.length === 1) setCafeId(null);
    };

    const updateQty = (menuItemId, qty) => {
        if (qty === 0) { removeFromCart(menuItemId); return; }
        setCart(prev => prev.map(i =>
            i.menuItem === menuItemId ? { ...i, quantity: qty } : i
        ));
    };

    const clearCart = () => { setCart([]); setCafeId(null); };

    const total = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const count = cart.reduce((sum, i) => sum + i.quantity, 0);

    return (
        <CartContext.Provider value={{
            cart, cafeId, total, count,
            addToCart, removeFromCart, updateQty, clearCart
        }}>
            {children}
        </CartContext.Provider>
    );
}

export const useCart = () => useContext(CartContext);