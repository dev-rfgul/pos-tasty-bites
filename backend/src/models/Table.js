import mongoose from 'mongoose';

const TableSchema = new mongoose.Schema({
  tenant: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
  name: { type: String, required: true },
  status: { type: String, enum: ['available','occupied','reserved','dirty'], default: 'available' },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Table', TableSchema);
