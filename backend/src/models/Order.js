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
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Order', OrderSchema);
