import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Navbar() {
  const navigate = useNavigate();

  function logout() {
    localStorage.removeItem('tenantId');
    navigate('/login');
  }

  return (
    <nav className="bg-white shadow">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/" className="font-bold text-lg">Tasty Bites</Link>
          <Link to="/pos" className="text-sm text-gray-600">POS</Link>
          <Link to="/menu" className="text-sm text-gray-600">Menu</Link>
          <Link to="/tables" className="text-sm text-gray-600">Tables</Link>
          <Link to="/reports" className="text-sm text-gray-600">Reports</Link>
        </div>
        <div>
          <button onClick={logout} className="text-sm text-red-600">Logout</button>
        </div>
      </div>
    </nav>
  );
}
