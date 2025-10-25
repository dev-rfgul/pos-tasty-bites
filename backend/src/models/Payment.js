import mongoose from 'mongoose';

const PaymentSchema = new mongoose.Schema({
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  amount: { type: Number, required: true },
  method: { type: String, default: 'cash' },
  paidAt: { type: Date, default: Date.now },
});

export default mongoose.model('Payment', PaymentSchema);
