import React, { useState } from 'react';
import API from '../api/api';
import { useNavigate } from 'react-router-dom';

export default function SignupPage() {
  const [shopName, setShopName] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const res = await API.post('/api/auth/signup', { shopName, email, password, name });
      const { tenantId } = res.data;
      if (tenantId) localStorage.setItem('tenantId', tenantId);
      // Redirect to dashboard
      navigate('/');
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Signup failed');
    }
  }

  return (
    <div className="max-w-md mx-auto mt-12 bg-white p-6 rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Create your shop</h2>
      <form onSubmit={handleSubmit}>
        <label className="block mb-2">
          <span className="text-sm">Shop name</span>
          <input className="mt-1 block w-full border rounded p-2" value={shopName} onChange={(e) => setShopName(e.target.value)} />
        </label>
        <label className="block mb-2">
          <span className="text-sm">Your name</span>
          <input className="mt-1 block w-full border rounded p-2" value={name} onChange={(e) => setName(e.target.value)} />
        </label>
        <label className="block mb-2">
          <span className="text-sm">Email</span>
          <input className="mt-1 block w-full border rounded p-2" value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label className="block mb-4">
          <span className="text-sm">Password</span>
          <input type="password" className="mt-1 block w-full border rounded p-2" value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>
        {error && <div className="text-red-600 mb-2">{error}</div>}
        <button className="bg-green-600 text-white px-4 py-2 rounded">Create shop</button>
      </form>
    </div>
  );
}
