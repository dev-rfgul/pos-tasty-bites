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

  async function printOrder() {
    // create order, add items and request receipt PDF
    try {
      const res = await API.post('/api/orders', { type: 'parcel' });
      const orderId = res.data._id;
      for (const it of cart) {
        await API.post(`/api/orders/${orderId}/items`, { menuItemId: it.menuItem, qty: it.qty });
      }

      // request receipt PDF
      const pdfRes = await API.get(`/api/orders/${orderId}/receipt`, { responseType: 'blob' });
      const blob = new Blob([pdfRes.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `receipt-${orderId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      setCart([]);
    } catch (e) {
      console.error(e);
      alert('Failed to create/print order');
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
            <button className="bg-green-600 text-white px-3 py-2 rounded" onClick={printOrder}>Print Receipt</button>
          </div>
        </div>
      </div>
    </div>
  );
}
