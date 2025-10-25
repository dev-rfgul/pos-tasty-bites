import React, { useEffect, useState } from 'react';
import API from '../api/api';

type MenuItem = {
  _id: string;
  name: string;
  price: number;
  cost?: number;
  sku?: string;
  active?: boolean;
};

export default function MenuPage() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [cost, setCost] = useState('');
  const [sku, setSku] = useState('');
  const [active, setActive] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function fetchMenu() {
    try {
      const res = await API.get('/api/menu');
      setItems(res.data || []);
    } catch (e) {
      setItems([]);
    }
  }

  useEffect(() => {
    fetchMenu();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!name || !price) return setError('Name and price are required');
    const payload = { name, price: parseFloat(price), cost: cost ? parseFloat(cost) : 0, sku, active };
    setLoading(true);
    try {
      await API.post('/api/menu', payload);
      setName(''); setPrice(''); setCost(''); setSku(''); setActive(true);
      await fetchMenu();
    } catch (err) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const e: any = err;
      setError(e?.response?.data?.error || 'Failed to create menu item');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid grid-cols-3 gap-6">
      <div className="col-span-2">
        <h1 className="text-2xl font-bold mb-4">Menu</h1>
        <div className="grid grid-cols-3 gap-4">
          {items.map((it) => (
            <div key={it._id} className="p-4 bg-white rounded shadow">
              <div className="font-semibold">{it.name}</div>
              <div className="text-sm text-gray-600">Price: {it.price.toFixed(2)}</div>
              {it.sku && <div className="text-xs text-gray-400">SKU: {it.sku}</div>}
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold mb-2">Create item</h2>
        <form className="bg-white p-4 rounded shadow" onSubmit={handleCreate}>
          <label className="block mb-2">
            <span className="text-sm">Name</span>
            <input value={name} onChange={(e) => setName(e.target.value)} className="mt-1 block w-full border rounded p-2" />
          </label>
          <label className="block mb-2">
            <span className="text-sm">Price</span>
            <input value={price} onChange={(e) => setPrice(e.target.value)} className="mt-1 block w-full border rounded p-2" />
          </label>
          <label className="block mb-2">
            <span className="text-sm">Cost</span>
            <input value={cost} onChange={(e) => setCost(e.target.value)} className="mt-1 block w-full border rounded p-2" />
          </label>
          <label className="block mb-2">
            <span className="text-sm">SKU (optional)</span>
            <input value={sku} onChange={(e) => setSku(e.target.value)} className="mt-1 block w-full border rounded p-2" />
          </label>
          <label className="flex items-center gap-2 mb-4">
            <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />
            <span className="text-sm">Active</span>
          </label>
          {error && <div className="text-red-600 mb-2">{error}</div>}
          <button disabled={loading} className="bg-green-600 text-white px-4 py-2 rounded">{loading ? 'Saving...' : 'Create'}</button>
        </form>
      </div>
    </div>
  );
}
