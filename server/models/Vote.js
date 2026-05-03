import mongoose from 'mongoose';

const voteSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  targetType: {
    type: String,
    enum: ['question', 'answer'],
    required: true,
  },
  voteType: {
    type: String,
    enum: ['up', 'down'],
    required: true,
  },
}, {
  timestamps: true,
});

// Each user can only vote once per target
voteSchema.index({ userId: 1, targetId: 1, targetType: 1 }, { unique: true });

const Vote = mongoose.model('Vote', voteSchema);
export default Vote;
