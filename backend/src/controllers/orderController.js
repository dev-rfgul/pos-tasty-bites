import Order from '../models/Order.js';
import MenuItem from '../models/MenuItem.js';
import Table from '../models/Table.js';
import Payment from '../models/Payment.js';

// Create/open an order
export async function createOrder(req, res, next) {
  try {
    const tenantId = req.tenantId;
    const { type, tableId } = req.body;
    if (!type) return res.status(400).json({ error: 'type required' });

    const order = await Order.create({ tenant: tenantId, type, table: tableId });
    // If dine and table provided, mark table occupied
    if (type === 'dine' && tableId) {
      await Table.findOneAndUpdate({ _id: tableId, tenant: tenantId }, { status: 'occupied' });
    }
    res.status(201).json(order);
  } catch (err) { next(err); }
}

// Add item to order
export async function addOrderItem(req, res, next) {
  try {
    const tenantId = req.tenantId;
    const { id } = req.params; // order id
    const { menuItemId, qty = 1 } = req.body;
    const order = await Order.findOne({ _id: id, tenant: tenantId });
    if (!order) return res.status(404).json({ error: 'Order not found' });

    const menuItem = await MenuItem.findOne({ _id: menuItemId, tenant: tenantId });
    if (!menuItem) return res.status(404).json({ error: 'Menu item not found' });

    order.orderItems.push({ menuItem: menuItem._id, name: menuItem.name, qty, unitPrice: menuItem.price, cost: menuItem.cost });
    // Recalculate total (simple sum)
    order.total = order.orderItems.reduce((s, it) => s + (it.unitPrice * it.qty), 0);
    await order.save();
    res.json(order);
  } catch (err) { next(err); }
}

// Checkout: create payment, mark order paid, free table if applicable
export async function checkoutOrder(req, res, next) {
  try {
    const tenantId = req.tenantId;
    const { id } = req.params; // order id
    const { amount, method = 'cash' } = req.body;
    const order = await Order.findOne({ _id: id, tenant: tenantId });
    if (!order) return res.status(404).json({ error: 'Order not found' });

    const payment = await Payment.create({ order: order._id, amount, method });
    order.status = 'paid';
    await order.save();

    if (order.type === 'dine' && order.table) {
      await Table.findOneAndUpdate({ _id: order.table, tenant: tenantId }, { status: 'available' });
    }

    res.json({ order, payment });
  } catch (err) { next(err); }
}

export default { createOrder, addOrderItem, checkoutOrder };
