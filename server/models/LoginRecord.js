import mongoose from 'mongoose';

const loginRecordSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  browser: {
    type: String,
    default: '',
  },
  os: {
    type: String,
    default: '',
  },
  deviceType: {
    type: String,
    default: '',
  },
  ip: {
    type: String,
    default: '',
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    default: 'Success',
  },
});

loginRecordSchema.index({ userId: 1, timestamp: -1 });

const LoginRecord = mongoose.model('LoginRecord', loginRecordSchema);
export default LoginRecord;
