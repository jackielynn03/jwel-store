import React, { createContext, useState, useContext } from 'react';

const ShopContext = createContext();

export const useShop = () => useContext(ShopContext);

export const ShopProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const addToCart = (item) => {
    setCartItems((prev) => [...prev, item]);
    setIsCartOpen(true); // Automatically open the cart when an item is added
  };

  const removeFromCart = (indexToRemove) => {
    setCartItems((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  return (
    <ShopContext.Provider value={{ cartItems, isCartOpen, setIsCartOpen, addToCart, removeFromCart }}>
      {children}
    </ShopContext.Provider>
  );
};