import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { LocationProvider } from './contexts/LocationContext';
import { StoreConfigProvider } from './contexts/StoreConfigContext';

// Customer Components
import Navbar from './components/common/Navbar';
import MobileBottomNav from './components/common/MobileBottomNav';
import Footer from './components/common/Footer';
import CartDrawer from './components/cart/CartDrawer';
import AuthModal from './components/common/AuthModal';
import LocationSelectorModal from './components/common/LocationSelectorModal';

// Customer Pages
import LandingPage from './pages/LandingPage';
import HomePage from './pages/HomePage';
import CategoryPage from './pages/CategoryPage';
import ProductDetailPage from './pages/ProductDetailPage';
import SearchPage from './pages/SearchPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderConfirmationPage from './pages/OrderConfirmationPage';
import OrderTrackingPage from './pages/OrderTrackingPage';
import MyOrdersPage from './pages/MyOrdersPage';
import ProfilePage from './pages/ProfilePage';
import NotFoundPage from './pages/NotFoundPage';

// Admin Pages & Layout
import AdminLayout from './components/admin/AdminLayout';
import AdminLoginPage from './pages/admin/AdminLoginPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminProductsPage from './pages/admin/AdminProductsPage';
import AdminCategoriesPage from './pages/admin/AdminCategoriesPage';
import AdminOrdersPage from './pages/admin/AdminOrdersPage';
import AdminCustomersPage from './pages/admin/AdminCustomersPage';
import AdminInventoryPage from './pages/admin/AdminInventoryPage';
import AdminCouponsPage from './pages/admin/AdminCouponsPage';
import AdminSettingsPage from './pages/admin/AdminSettingsPage';

const queryClient = new QueryClient();

// Customer Layout wrapper
const CustomerLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-gray-50/50">
      <div>
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6">
          <Outlet />
        </main>
      </div>
      <Footer />
      <MobileBottomNav />

      {/* Global Customer Modals & Drawers */}
      <CartDrawer />
      <AuthModal />
      <LocationSelectorModal />
    </div>
  );
};

// Admin Protected Route Gatekeeper
const ProtectedAdminRoute: React.FC = () => {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950 text-white">
        <div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  return <AdminLayout />;
};

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <StoreConfigProvider>
          <LocationProvider>
            <CartProvider>
              <BrowserRouter>
                <Routes>
                  {/* Customer Website Routes */}
                  <Route element={<CustomerLayout />}>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/store" element={<HomePage />} />
                    <Route path="/home" element={<HomePage />} />
                    <Route path="/categories/:slug" element={<CategoryPage />} />
                    <Route path="/products/:slug" element={<ProductDetailPage />} />
                    <Route path="/search" element={<SearchPage />} />
                    <Route path="/cart" element={<CartPage />} />
                    <Route path="/checkout" element={<CheckoutPage />} />
                    <Route path="/orders/:orderNumber/confirmed" element={<OrderConfirmationPage />} />
                    <Route path="/orders/:id/track" element={<OrderTrackingPage />} />
                    <Route path="/orders" element={<MyOrdersPage />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="*" element={<NotFoundPage />} />
                  </Route>

                  {/* Admin Authentication */}
                  <Route path="/admin/login" element={<AdminLoginPage />} />

                  {/* Protected Admin Portal */}
                  <Route path="/admin" element={<ProtectedAdminRoute />}>
                    <Route index element={<AdminDashboardPage />} />
                    <Route path="products" element={<AdminProductsPage />} />
                    <Route path="categories" element={<AdminCategoriesPage />} />
                    <Route path="orders" element={<AdminOrdersPage />} />
                    <Route path="customers" element={<AdminCustomersPage />} />
                    <Route path="inventory" element={<AdminInventoryPage />} />
                    <Route path="coupons" element={<AdminCouponsPage />} />
                    <Route path="settings" element={<AdminSettingsPage />} />
                  </Route>
                </Routes>
              </BrowserRouter>
            </CartProvider>
          </LocationProvider>
        </StoreConfigProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;