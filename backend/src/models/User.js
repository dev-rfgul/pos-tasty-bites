import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  tenant: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['owner','manager','cashier'], default: 'cashier' },
  name: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('User', UserSchema);
