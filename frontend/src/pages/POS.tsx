import React, { useEffect, useState } from 'react';
import API from '../api/api';
import Invoice from '../components/Invoice';

export default function POS() {
  const [menu, setMenu] = useState<any[]>([]);
  const [cart, setCart] = useState<any[]>([]);
  const [showInvoice, setShowInvoice] = useState(false);
  const [loadingPrint, setLoadingPrint] = useState(false);
  const [orderInfo, setOrderInfo] = useState<any>(null);

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

  async function handleShowInvoice() {
    if (!cart.length) return alert('Cart is empty');
    setLoadingPrint(true);

    try {
      // create order on server so it's persisted for reports
      const res = await API.post('/api/orders', { type: 'parcel' });
      const orderId = res.data._id;
      for (const it of cart) {
        await API.post(`/api/orders/${orderId}/items`, { menuItemId: it.menuItem, qty: it.qty });
      }

      // build orderInfo for the modal (client-side representation)
      const subtotal = cart.reduce((s, c) => s + c.unitPrice * c.qty, 0);
      const tax = 0; // adjust if you have tax settings
      const totalWithTax = subtotal + tax;

      const info = {
        orderDate: new Date().toISOString(),
        customerDetails: { name: 'Walk-in', phone: '', guests: 1 },
        items: cart.map((c) => ({ name: c.name, quantity: c.qty, price: c.unitPrice })),
        bills: { total: subtotal, tax, totalWithTax },
        paymentMethod: 'Cash',
        paymentData: undefined,
      };

      setOrderInfo(info);
      setShowInvoice(true);
    } catch (e) {
      console.error(e);
      alert('Failed to create order for printing');
    } finally {
      setLoadingPrint(false);
    }
  }

  // when modal is closed, clear cart
  function handleSetShowInvoice(v: boolean) {
    setShowInvoice(v);
    if (!v) {
      setCart([]);
      setOrderInfo(null);
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
            <button className="bg-green-600 text-white px-3 py-2 rounded" onClick={handleShowInvoice} disabled={loadingPrint}>{loadingPrint ? 'Preparing...' : 'Print Receipt'}</button>
          </div>
        </div>
      </div>

      {showInvoice && orderInfo && (
        <Invoice orderInfo={orderInfo} setShowInvoice={handleSetShowInvoice} />
      )}
    </div>
  );
}
