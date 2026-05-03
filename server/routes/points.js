import express from 'express';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// ── GET /api/points/transactions ────────────────────────
router.get('/transactions', authenticate, async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.user._id })
      .sort({ timestamp: -1 })
      .limit(100);

    res.json({ transactions });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// ── POST /api/points/transfer ───────────────────────────
router.post('/transfer', authenticate, async (req, res) => {
  try {
    const { recipientId, amount } = req.body;
    const senderId = req.user._id;

    if (!recipientId || !amount) {
      return res.status(400).json({ error: 'Recipient and amount are required.' });
    }

    if (senderId.toString() === recipientId) {
      return res.status(400).json({ error: 'You cannot transfer points to yourself.' });
    }

    const sender = await User.findById(senderId);
    const recipient = await User.findById(recipientId);

    if (!recipient) {
      return res.status(404).json({ error: 'Recipient not found.' });
    }

    if (sender.points <= 10) {
      return res.status(400).json({ error: 'You need more than 10 points to transfer points.' });
    }

    if (amount <= 0) {
      return res.status(400).json({ error: 'Transfer amount must be positive.' });
    }

    if (amount > sender.points) {
      return res.status(400).json({ error: 'Insufficient points.' });
    }

    // Atomic transfer
    await User.findByIdAndUpdate(senderId, { $inc: { points: -amount } });
    await User.findByIdAndUpdate(recipientId, { $inc: { points: amount } });

    await Transaction.create({
      type: 'transferred',
      userId: senderId,
      amount,
      details: `Transferred to ${recipient.displayName}`,
    });

    await Transaction.create({
      type: 'received',
      userId: recipientId,
      amount,
      details: `Received from ${sender.displayName}`,
    });

    const updatedSender = await User.findById(senderId).select('-password');
    res.json({ success: true, user: updatedSender });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

export default router;
