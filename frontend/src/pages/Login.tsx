import React, { useState } from 'react';
import API from '../api/api';
import { useNavigate, Link } from 'react-router-dom';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const res = await API.post('/api/auth/login', { email, password });
      const { tenantId } = res.data;
      if (tenantId) localStorage.setItem('tenantId', tenantId);
      // basic redirect
      navigate('/');
    } catch (err) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const e: any = err;
      setError(e?.response?.data?.error || 'Login failed');
    }
  }

  return (
    <div className="max-w-md mx-auto mt-20 bg-white p-6 rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Sign in</h2>
      <form onSubmit={handleSubmit}>
        <label className="block mb-2">
          <span className="text-sm">Email</span>
          <input className="mt-1 block w-full border rounded p-2" value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label className="block mb-4">
          <span className="text-sm">Password</span>
          <input type="password" className="mt-1 block w-full border rounded p-2" value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>
        {error && <div className="text-red-600 mb-2">{error}</div>}
        <div className="flex items-center justify-between">
          <button className="bg-blue-600 text-white px-4 py-2 rounded">Sign in</button>
          <Link to="/signup" className="text-sm text-blue-600">Create account</Link>
        </div>
      </form>
    </div>
  );
}
