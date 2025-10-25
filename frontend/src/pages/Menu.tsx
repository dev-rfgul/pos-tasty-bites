import React, { useEffect, useState } from 'react';
import API from '../api/api';

export default function MenuPage() {
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    API.get('/api/menu').then((r) => setItems(r.data)).catch(() => setItems([]));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Menu</h1>
      <div className="grid grid-cols-3 gap-4">
        {items.map((it) => (
          <div key={it._id} className="p-4 bg-white rounded shadow">
            <div className="font-semibold">{it.name}</div>
            <div className="text-sm text-gray-600">Price: {it.price}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
