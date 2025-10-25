import mongoose from 'mongoose';

const OrderItemSchema = new mongoose.Schema({
  menuItem: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem', required: true },
  name: { type: String },
  qty: { type: Number, default: 1 },
  unitPrice: { type: Number, required: true },
  cost: { type: Number, default: 0 },
});

const OrderSchema = new mongoose.Schema({
  tenant: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
  type: { type: String, enum: ['dine','parcel'], required: true },
  status: { type: String, enum: ['open','paid','cancelled'], default: 'open' },
  table: { type: mongoose.Schema.Types.ObjectId, ref: 'Table' },
  orderItems: { type: [OrderItemSchema], default: [] },
  total: { type: Number, default: 0 },
  tax: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  paidAt: { type: Date },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now },
}, {
  timestamps: true,
});

// compute total before save to ensure every order has up-to-date total
OrderSchema.pre('save', function (next) {
  try {
    const order = this;
    if (order.orderItems && order.orderItems.length) {
      const itemsTotal = order.orderItems.reduce((s, it) => s + (Number(it.unitPrice || 0) * Number(it.qty || 0)), 0);
      order.total = Number(itemsTotal.toFixed(2));
    } else {
      order.total = 0;
    }
    // ensure status default
    if (!order.status) order.status = 'open';
    next();
  } catch (err) {
    next(err);
  }
});

// helpful index to speed up reports
OrderSchema.index({ tenant: 1, status: 1, createdAt: -1 });

export default mongoose.model('Order', OrderSchema);
