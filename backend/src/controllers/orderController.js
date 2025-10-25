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

// List recent orders for tenant (debug / admin)
export async function listOrders(req, res, next) {
  try {
    const tenantId = req.tenantId;
    const orders = await Order.find({ tenant: tenantId }).sort({ createdAt: -1 }).limit(50).lean();
    res.json(orders);
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
    const quantity = Math.max(1, parseInt(qty, 10) || 1);
    order.orderItems.push({ menuItem: menuItem._id, name: menuItem.name, qty: quantity, unitPrice: menuItem.price, cost: menuItem.cost });
    // Save will trigger pre-save hook to recalc total
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

    // Ensure order total is up-to-date (recalculate from items)
    order.total = order.orderItems.reduce((s, it) => s + (Number(it.unitPrice || 0) * Number(it.qty || 0)), 0);

    if (typeof amount !== 'number' || amount < order.total) {
      return res.status(400).json({ error: 'Payment amount is less than order total' });
    }

    const payment = await Payment.create({ order: order._id, amount, method });
    order.status = 'paid';
    order.paidAt = new Date();
    await order.save();

    if (order.type === 'dine' && order.table) {
      await Table.findOneAndUpdate({ _id: order.table, tenant: tenantId }, { status: 'available' });
    }

    res.json({ order, payment });
  } catch (err) { next(err); }
}

export default { createOrder, addOrderItem, checkoutOrder, listOrders };
