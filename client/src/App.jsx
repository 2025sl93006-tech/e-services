import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import PrivateRoute from './components/common/PrivateRoute';
import AdminRoute from './components/common/AdminRoute';

// Public pages
import HomePage          from './pages/HomePage';
import ServicesPage      from './pages/ServicesPage';
import ServiceDetailPage from './pages/ServiceDetailPage';
import LoginPage         from './pages/LoginPage';
import RegisterPage      from './pages/RegisterPage';

// User pages
import UserDashboard   from './pages/UserDashboard';
import OrderServicePage from './pages/OrderServicePage';
import MyOrdersPage    from './pages/MyOrdersPage';

// Admin pages
import AdminDashboard        from './pages/AdminDashboard';
import ManageCategoriesPage  from './pages/ManageCategoriesPage';
import ManageProvidersPage   from './pages/ManageProvidersPage';
import ManageOrdersPage      from './pages/ManageOrdersPage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="d-flex flex-column min-vh-100">
          <Navbar />
          <main className="flex-grow-1">
            <Routes>
              {/* Public */}
              <Route path="/"              element={<HomePage />} />
              <Route path="/services"      element={<ServicesPage />} />
              <Route path="/services/:id"  element={<ServiceDetailPage />} />
              <Route path="/login"         element={<LoginPage />} />
              <Route path="/register"      element={<RegisterPage />} />

              {/* User (private) */}
              <Route path="/user/dashboard" element={<PrivateRoute><UserDashboard /></PrivateRoute>} />
              <Route path="/user/order/:providerId" element={<PrivateRoute><OrderServicePage /></PrivateRoute>} />
              <Route path="/user/my-orders" element={<PrivateRoute><MyOrdersPage /></PrivateRoute>} />
              <Route path="/user/orders/:id" element={<PrivateRoute><MyOrdersPage /></PrivateRoute>} />

              {/* Admin */}
              <Route path="/admin"             element={<AdminRoute><AdminDashboard /></AdminRoute>} />
              <Route path="/admin/categories"  element={<AdminRoute><ManageCategoriesPage /></AdminRoute>} />
              <Route path="/admin/providers"   element={<AdminRoute><ManageProvidersPage /></AdminRoute>} />
              <Route path="/admin/orders"      element={<AdminRoute><ManageOrdersPage /></AdminRoute>} />

              {/* 404 fallback */}
              <Route path="*" element={<div className="text-center py-5"><h3>Page Not Found</h3></div>} />
            </Routes>
          </main>
          <Footer />
        </div>
        <ToastContainer position="top-right" autoClose={3000} />
      </BrowserRouter>
    </AuthProvider>
  );
}
