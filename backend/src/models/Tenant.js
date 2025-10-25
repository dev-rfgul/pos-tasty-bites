import mongoose from 'mongoose';

const TenantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  plan: { type: String, default: 'free' },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Tenant', TenantSchema);
