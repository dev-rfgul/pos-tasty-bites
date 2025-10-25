import mongoose from 'mongoose';

const MenuItemSchema = new mongoose.Schema({
  tenant: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  cost: { type: Number, default: 0 },
  sku: { type: String },
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('MenuItem', MenuItemSchema);
