import mongoose from 'mongoose';

const saveSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question',
    required: true,
  },
  savedAt: {
    type: Date,
    default: Date.now,
  },
});

// Each user can only save a question once
saveSchema.index({ userId: 1, questionId: 1 }, { unique: true });

const Save = mongoose.model('Save', saveSchema);
export default Save;
