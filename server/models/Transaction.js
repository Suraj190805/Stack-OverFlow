import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['earned', 'deducted', 'transferred', 'received'],
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  details: {
    type: String,
    default: '',
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

transactionSchema.index({ userId: 1, timestamp: -1 });

const Transaction = mongoose.model('Transaction', transactionSchema);
export default Transaction;
