import React from 'react';
import { Routes, Route } from "react-router-dom";
import Register from './pages/Regester';
import Login from './pages/Login';
import Home from './pages/Home';
import Admin from './pages/Admin';
import Seller from './pages/Seller';
import Sellerlogin from './pages/Sellerlogin';
import SellerRegister from './pages/SellerRegister';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/order-success" element={<OrderSuccess />} />
        <Route path="/sellerlogin" element={<Sellerlogin />} />
        <Route path="/sellerregister" element={<SellerRegister />} />

       
        <Route path="/admin" element={
          <ProtectedRoute roleRequired="admin">
            <Admin />
          </ProtectedRoute>
        } />
        <Route path="/seller" element={
          <ProtectedRoute roleRequired="seller">
            <Seller />
          </ProtectedRoute>
        } />
      </Routes>
    </div>
  )
}

export default App

