import Order from '../models/Order.js';
import MenuItem from '../models/MenuItem.js';
import Table from '../models/Table.js';
import Payment from '../models/Payment.js';
import Tenant from '../models/Tenant.js';
import PDFDocument from 'pdfkit';

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

// Generate a simple PDF receipt for an order and stream it back
export async function generateReceipt(req, res, next) {
  try {
    const tenantId = req.tenantId;
    const { id } = req.params;
    const order = await Order.findOne({ _id: id, tenant: tenantId }).lean();
    if (!order) return res.status(404).json({ error: 'Order not found' });

    const tenant = await Tenant.findById(order.tenant).lean();

    // Create PDF
    const doc = new PDFDocument({ size: 'A4', margin: 40 });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=receipt-${order._id}.pdf`);

    doc.pipe(res);

    doc.fontSize(18).text(tenant?.name || 'Tasty Bites', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Order ID: ${order._id}`);
    doc.text(`Type: ${order.type}`);
    doc.text(`Status: ${order.status}`);
    doc.text(`Created: ${new Date(order.createdAt).toLocaleString()}`);
    if (order.paidAt) doc.text(`Paid: ${new Date(order.paidAt).toLocaleString()}`);
    doc.moveDown();

    doc.text('Items:');
    doc.moveDown(0.5);
    const tableTop = doc.y;
    order.orderItems.forEach((it) => {
      const line = `${it.name}  x${it.qty}  @ ${Number(it.unitPrice).toFixed(2)}  = ${(Number(it.unitPrice) * Number(it.qty)).toFixed(2)}`;
      doc.text(line);
    });

    doc.moveDown();
    doc.text(`Subtotal: ${Number(order.total || 0).toFixed(2)}`);
    if (order.tax) doc.text(`Tax: ${Number(order.tax || 0).toFixed(2)}`);
    if (order.discount) doc.text(`Discount: ${Number(order.discount || 0).toFixed(2)}`);
    doc.text(`Total: ${Number(order.total || 0).toFixed(2)}`, { align: 'right' });

    doc.moveDown(2);
    doc.fontSize(10).text('Thank you for your order!', { align: 'center' });

    doc.end();
  } catch (err) {
    next(err);
  }
}

export default { createOrder, addOrderItem, checkoutOrder, listOrders };
