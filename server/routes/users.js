import express from 'express';
import User from '../models/User.js';
import LoginRecord from '../models/LoginRecord.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// ── GET /api/users ──────────────────────────────────────
router.get('/', authenticate, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json({ users });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// ── GET /api/users/search ───────────────────────────────
router.get('/search', authenticate, async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.json({ users: [] });

    const users = await User.find({
      $or: [
        { displayName: { $regex: q, $options: 'i' } },
        { username: { $regex: q, $options: 'i' } },
      ],
    }).select('-password').limit(20);

    res.json({ users });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// ── GET /api/users/:id ─────────────────────────────────
router.get('/:id', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('friends', 'username displayName avatar points');
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// ── PUT /api/users/:id ─────────────────────────────────
router.put('/:id', authenticate, async (req, res) => {
  try {
    if (req.user._id.toString() !== req.params.id) {
      return res.status(403).json({ error: 'Unauthorized.' });
    }

    const allowedUpdates = ['displayName', 'phone', 'avatar', 'plan', 'language'];
    const updates = {};
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true }).select('-password');
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// ── POST /api/users/:id/friend ──────────────────────────
router.post('/:id/friend', authenticate, async (req, res) => {
  try {
    const targetId = req.params.id;
    const userId = req.user._id;

    if (targetId === userId.toString()) {
      return res.status(400).json({ error: 'Cannot add yourself as a friend.' });
    }

    const target = await User.findById(targetId);
    if (!target) {
      return res.status(404).json({ error: 'User not found.' });
    }

    // Check if already friends
    if (req.user.friends.includes(targetId)) {
      return res.status(400).json({ error: 'Already friends.' });
    }

    // Auto-accept: add both ways
    await User.findByIdAndUpdate(userId, { $addToSet: { friends: targetId } });
    await User.findByIdAndUpdate(targetId, { $addToSet: { friends: userId } });

    const updatedUser = await User.findById(userId)
      .select('-password')
      .populate('friends', 'username displayName avatar points');

    res.json({ success: true, user: updatedUser });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// ── DELETE /api/users/:id/friend ────────────────────────
router.delete('/:id/friend', authenticate, async (req, res) => {
  try {
    const targetId = req.params.id;
    const userId = req.user._id;

    await User.findByIdAndUpdate(userId, { $pull: { friends: targetId } });
    await User.findByIdAndUpdate(targetId, { $pull: { friends: userId } });

    const updatedUser = await User.findById(userId)
      .select('-password')
      .populate('friends', 'username displayName avatar points');

    res.json({ success: true, user: updatedUser });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// ── GET /api/users/:id/login-history ────────────────────
router.get('/:id/login-history', authenticate, async (req, res) => {
  try {
    if (req.user._id.toString() !== req.params.id) {
      return res.status(403).json({ error: 'Unauthorized.' });
    }

    const records = await LoginRecord.find({ userId: req.params.id })
      .sort({ timestamp: -1 })
      .limit(50);

    res.json({ records });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

export default router;
