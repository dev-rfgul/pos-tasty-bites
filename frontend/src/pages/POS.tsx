import React, { useEffect, useState } from 'react';
import API from '../api/api';

export default function POS() {
  const [menu, setMenu] = useState<any[]>([]);
  const [cart, setCart] = useState<any[]>([]);

  useEffect(() => {
    API.get('/api/menu').then((r) => setMenu(r.data)).catch(() => setMenu([]));
  }, []);

  function addToCart(item: any) {
    const existing = cart.find((c) => c.menuItem === item._id);
    if (existing) {
      setCart(cart.map((c) => (c.menuItem === item._id ? { ...c, qty: c.qty + 1 } : c)));
    } else {
      setCart([...cart, { menuItem: item._id, name: item.name, qty: 1, unitPrice: item.price }]);
    }
  }

  async function saveOrder() {
    // create order and add items
    try {
      const res = await API.post('/api/orders', { type: 'parcel' });
      const orderId = res.data._id;
      for (const it of cart) {
        await API.post(`/api/orders/${orderId}/items`, { menuItemId: it.menuItem, qty: it.qty });
      }
      alert('Order saved');
      setCart([]);
    } catch (e) {
      alert('Failed to save order');
    }
  }

  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="col-span-2">
        <h2 className="text-xl font-bold mb-2">Menu</h2>
        <div className="grid grid-cols-3 gap-3">
          {menu.map((m) => (
            <div key={m._id} className="p-3 bg-white rounded shadow">
              <div className="font-semibold">{m.name}</div>
              <div className="text-sm text-gray-600">{m.price}</div>
              <button className="mt-2 bg-blue-500 text-white px-2 py-1 rounded" onClick={() => addToCart(m)}>Add</button>
            </div>
          ))}
        </div>
      </div>
      <div>
        <h2 className="text-xl font-bold mb-2">Cart</h2>
        <div className="bg-white p-3 rounded shadow">
          {cart.map((c) => (
            <div key={c.menuItem} className="flex justify-between mb-2">
              <div>{c.name} x {c.qty}</div>
              <div>{(c.unitPrice * c.qty).toFixed(2)}</div>
            </div>
          ))}
          <div className="mt-4">
            <button className="bg-green-600 text-white px-3 py-2 rounded" onClick={saveOrder}>Save Order</button>
          </div>
        </div>
      </div>
    </div>
  );
}
