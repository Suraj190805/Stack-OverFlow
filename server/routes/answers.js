import express from 'express';
import Answer from '../models/Answer.js';
import Question from '../models/Question.js';
import Vote from '../models/Vote.js';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// ── GET /api/questions/:questionId/answers ───────────────
router.get('/question/:questionId', async (req, res) => {
  try {
    const answers = await Answer.find({ questionId: req.params.questionId })
      .populate('userId', 'username displayName avatar points')
      .sort({ createdAt: -1 });

    res.json({ answers });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// ── POST /api/answers ───────────────────────────────────
router.post('/', authenticate, async (req, res) => {
  try {
    const { questionId, body } = req.body;

    if (!questionId || !body) {
      return res.status(400).json({ error: 'Question ID and body are required.' });
    }

    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({ error: 'Question not found.' });
    }

    const answer = await Answer.create({
      questionId,
      userId: req.user._id,
      body,
    });

    // Increment answer count on question
    question.answerCount += 1;
    question.lastActive = new Date();
    await question.save();

    // Award +5 points for answering
    await User.findByIdAndUpdate(req.user._id, { $inc: { points: 5 } });
    await Transaction.create({
      type: 'earned',
      userId: req.user._id,
      amount: 5,
      details: 'Answered a question',
    });

    const populated = await answer.populate('userId', 'username displayName avatar points');
    res.status(201).json({ answer: populated });
  } catch (err) {
    console.error('Create answer error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// ── DELETE /api/answers/:id ─────────────────────────────
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const answer = await Answer.findById(req.params.id);
    if (!answer) {
      return res.status(404).json({ error: 'Answer not found.' });
    }

    if (answer.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'You can only delete your own answers.' });
    }

    // Decrement answer count on question
    await Question.findByIdAndUpdate(answer.questionId, {
      $inc: { answerCount: -1 },
    });

    // Deduct 5 points for removal
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { points: -5 },
    });
    await Transaction.create({
      type: 'deducted',
      userId: req.user._id,
      amount: 5,
      details: 'Answer removed',
    });

    // Clean up votes for this answer
    await Vote.deleteMany({ targetId: answer._id, targetType: 'answer' });

    await answer.deleteOne();

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// ── POST /api/answers/:id/vote ──────────────────────────
router.post('/:id/vote', authenticate, async (req, res) => {
  try {
    const { voteType } = req.body; // 'up' or 'down'
    const answerId = req.params.id;
    const userId = req.user._id;

    const answer = await Answer.findById(answerId);
    if (!answer) {
      return res.status(404).json({ error: 'Answer not found.' });
    }

    const existingVote = await Vote.findOne({
      userId,
      targetId: answerId,
      targetType: 'answer',
    });

    if (existingVote) {
      if (existingVote.voteType === voteType) {
        // Toggle off
        await existingVote.deleteOne();
        if (voteType === 'up') {
          answer.upvotes = Math.max(0, answer.upvotes - 1);
        } else {
          answer.downvotes = Math.max(0, answer.downvotes - 1);
        }
        await answer.save();
        return res.json({ answer, action: 'removed' });
      } else {
        // Switch vote
        existingVote.voteType = voteType;
        await existingVote.save();
        if (voteType === 'up') {
          answer.upvotes += 1;
          answer.downvotes = Math.max(0, answer.downvotes - 1);
        } else {
          answer.downvotes += 1;
          answer.upvotes = Math.max(0, answer.upvotes - 1);
          await User.findByIdAndUpdate(answer.userId, { $inc: { points: -2 } });
          await Transaction.create({
            type: 'deducted',
            userId: answer.userId,
            amount: 2,
            details: 'Answer downvoted',
          });
        }
        await answer.save();
        return res.json({ answer, action: 'switched' });
      }
    }

    // New vote
    await Vote.create({
      userId,
      targetId: answerId,
      targetType: 'answer',
      voteType,
    });

    if (voteType === 'up') {
      answer.upvotes += 1;
      // 5-upvote bonus
      if (answer.upvotes === 5) {
        await User.findByIdAndUpdate(answer.userId, { $inc: { points: 5 } });
        await Transaction.create({
          type: 'earned',
          userId: answer.userId,
          amount: 5,
          details: 'Answer received 5 upvotes bonus',
        });
      }
    } else {
      answer.downvotes += 1;
      await User.findByIdAndUpdate(answer.userId, { $inc: { points: -2 } });
      await Transaction.create({
        type: 'deducted',
        userId: answer.userId,
        amount: 2,
        details: 'Answer downvoted',
      });
    }
    await answer.save();

    res.json({ answer, action: 'voted' });
  } catch (err) {
    console.error('Answer vote error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

export default router;
