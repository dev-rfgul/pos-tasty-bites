import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/Login';
import SignupPage from './pages/Signup';
import Dashboard from './pages/Dashboard';
import POS from './pages/POS';
import MenuPage from './pages/Menu';
import TablesPage from './pages/Tables';
import Reports from './pages/Reports';
import Navbar from './components/Navbar';

function PrivateRoute({ children }: { children: JSX.Element }) {
  const tenantId = localStorage.getItem('tenantId');
  return tenantId ? children : <Navigate to="/login" replace />;
}

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <main className="p-4">
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/pos"
              element={
                <PrivateRoute>
                  <POS />
                </PrivateRoute>
              }
            />
            <Route
              path="/menu"
              element={
                <PrivateRoute>
                  <MenuPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/tables"
              element={
                <PrivateRoute>
                  <TablesPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/reports"
              element={
                <PrivateRoute>
                  <Reports />
                </PrivateRoute>
              }
            />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
