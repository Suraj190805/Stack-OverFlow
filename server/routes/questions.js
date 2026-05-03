import express from 'express';
import Question from '../models/Question.js';
import Answer from '../models/Answer.js';
import Vote from '../models/Vote.js';
import Save from '../models/Save.js';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// ── GET /api/questions ──────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 15,
      sort = 'newest',
      tag,
      search,
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    let filter = {};
    let sortOption = {};

    // Tag filter
    if (tag) {
      filter.tags = tag.toLowerCase();
    }

    // Search filter
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } },
      ];
    }

    // Sort options
    switch (sort) {
      case 'newest':
        sortOption = { createdAt: -1 };
        break;
      case 'active':
        sortOption = { lastActive: -1 };
        break;
      case 'bountied':
        filter.bounty = { $gt: 0 };
        sortOption = { bounty: -1 };
        break;
      case 'votes':
      case 'score':
        // Sort by net score (upvotes - downvotes) — use aggregation later if needed
        sortOption = { upvotes: -1 };
        break;
      case 'unanswered':
        filter.answerCount = 0;
        sortOption = { createdAt: -1 };
        break;
      case 'frequent':
        sortOption = { views: -1 };
        break;
      default:
        sortOption = { createdAt: -1 };
    }

    const total = await Question.countDocuments(filter);
    const questions = await Question.find(filter)
      .sort(sortOption)
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .populate('userId', 'username displayName avatar points');

    res.json({
      questions,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (err) {
    console.error('Get questions error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// ── GET /api/questions/tags ─────────────────────────────
router.get('/tags', async (req, res) => {
  try {
    const tags = await Question.aggregate([
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);
    res.json({ tags: tags.map(t => ({ name: t._id, count: t.count })) });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// ── GET /api/questions/bountied-count ───────────────────
router.get('/bountied-count', async (req, res) => {
  try {
    const count = await Question.countDocuments({ bounty: { $gt: 0 } });
    res.json({ count });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// ── GET /api/questions/:id ──────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const question = await Question.findById(req.params.id)
      .populate('userId', 'username displayName avatar points');
    if (!question) {
      return res.status(404).json({ error: 'Question not found.' });
    }

    // Increment views
    question.views += 1;
    await question.save();

    res.json({ question });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// ── POST /api/questions ─────────────────────────────────
router.post('/', authenticate, async (req, res) => {
  try {
    const { title, body, tags, category, bounty } = req.body;

    if (!title || !body) {
      return res.status(400).json({ error: 'Title and body are required.' });
    }

    const question = await Question.create({
      userId: req.user._id,
      title,
      body,
      tags: tags || [],
      category: category || null,
      bounty: bounty || 0,
    });

    // Award points for asking
    await User.findByIdAndUpdate(req.user._id, { $inc: { points: 2 } });
    await Transaction.create({
      type: 'earned',
      userId: req.user._id,
      amount: 2,
      details: 'Asked a question',
    });

    const populated = await question.populate('userId', 'username displayName avatar points');
    res.status(201).json({ question: populated });
  } catch (err) {
    console.error('Create question error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// ── POST /api/questions/:id/vote ────────────────────────
router.post('/:id/vote', authenticate, async (req, res) => {
  try {
    const { voteType } = req.body; // 'up' or 'down'
    const questionId = req.params.id;
    const userId = req.user._id;

    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({ error: 'Question not found.' });
    }

    // Check existing vote
    const existingVote = await Vote.findOne({
      userId,
      targetId: questionId,
      targetType: 'question',
    });

    if (existingVote) {
      if (existingVote.voteType === voteType) {
        // Toggle off: remove vote
        await existingVote.deleteOne();
        if (voteType === 'up') {
          question.upvotes = Math.max(0, question.upvotes - 1);
        } else {
          question.downvotes = Math.max(0, question.downvotes - 1);
        }
        await question.save();
        return res.json({ question, action: 'removed' });
      } else {
        // Switch vote
        existingVote.voteType = voteType;
        await existingVote.save();
        if (voteType === 'up') {
          question.upvotes += 1;
          question.downvotes = Math.max(0, question.downvotes - 1);
        } else {
          question.downvotes += 1;
          question.upvotes = Math.max(0, question.upvotes - 1);
          // Deduct points from question author
          await User.findByIdAndUpdate(question.userId, { $inc: { points: -2 } });
          await Transaction.create({
            type: 'deducted',
            userId: question.userId,
            amount: 2,
            details: 'Question downvoted',
          });
        }
        await question.save();
        return res.json({ question, action: 'switched' });
      }
    }

    // New vote
    await Vote.create({
      userId,
      targetId: questionId,
      targetType: 'question',
      voteType,
    });

    if (voteType === 'up') {
      question.upvotes += 1;
      // Check upvote milestone bonus
      if (question.upvotes % 5 === 0) {
        await User.findByIdAndUpdate(question.userId, { $inc: { points: 5 } });
        await Transaction.create({
          type: 'earned',
          userId: question.userId,
          amount: 5,
          details: 'Question received 5-upvote bonus',
        });
      }
    } else {
      question.downvotes += 1;
      // Deduct points from question author
      await User.findByIdAndUpdate(question.userId, { $inc: { points: -2 } });
      await Transaction.create({
        type: 'deducted',
        userId: question.userId,
        amount: 2,
        details: 'Question downvoted',
      });
    }
    await question.save();

    res.json({ question, action: 'voted' });
  } catch (err) {
    console.error('Vote error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// ── POST /api/questions/:id/save ────────────────────────
router.post('/:id/save', authenticate, async (req, res) => {
  try {
    const questionId = req.params.id;
    const userId = req.user._id;

    const existing = await Save.findOne({ userId, questionId });
    if (existing) {
      await existing.deleteOne();
      return res.json({ saved: false });
    }

    await Save.create({ userId, questionId });
    res.json({ saved: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// ── GET /api/questions/user/saves ───────────────────────
router.get('/user/saves', authenticate, async (req, res) => {
  try {
    const saves = await Save.find({ userId: req.user._id })
      .populate({
        path: 'questionId',
        populate: { path: 'userId', select: 'username displayName avatar points' },
      })
      .sort({ savedAt: -1 });

    res.json({ saves });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// ── GET /api/questions/user/votes ───────────────────────
router.get('/user/votes', authenticate, async (req, res) => {
  try {
    const votes = await Vote.find({ userId: req.user._id });
    // Convert to a map for easy lookup: { targetId: voteType }
    const voteMap = {};
    votes.forEach(v => {
      const key = v.targetType === 'answer' ? `ans_${v.targetId}` : v.targetId.toString();
      voteMap[key] = v.voteType;
    });
    res.json({ votes: voteMap });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

export default router;
