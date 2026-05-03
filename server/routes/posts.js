import express from 'express';
import Post from '../models/Post.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// ── GET /api/posts ──────────────────────────────────────
router.get('/', authenticate, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    // Get posts from user's friends + own posts
    const friendIds = [...req.user.friends, req.user._id];

    const total = await Post.countDocuments({ userId: { $in: friendIds } });
    const posts = await Post.find({ userId: { $in: friendIds } })
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .populate('userId', 'username displayName avatar points')
      .populate('comments.userId', 'username displayName avatar');

    res.json({
      posts,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// ── POST /api/posts ─────────────────────────────────────
router.post('/', authenticate, async (req, res) => {
  try {
    const { content, media, mediaType } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Content is required.' });
    }

    const post = await Post.create({
      userId: req.user._id,
      content,
      media: media || null,
      mediaType: mediaType || null,
    });

    const populated = await post.populate('userId', 'username displayName avatar points');
    res.status(201).json({ post: populated });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// ── POST /api/posts/:id/like ────────────────────────────
router.post('/:id/like', authenticate, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ error: 'Post not found.' });
    }

    const userIdStr = req.user._id.toString();
    const alreadyLiked = post.likes.some(id => id.toString() === userIdStr);

    if (alreadyLiked) {
      post.likes = post.likes.filter(id => id.toString() !== userIdStr);
    } else {
      post.likes.push(req.user._id);
    }

    await post.save();

    const populated = await post.populate([
      { path: 'userId', select: 'username displayName avatar points' },
      { path: 'comments.userId', select: 'username displayName avatar' },
    ]);

    res.json({ post: populated });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// ── POST /api/posts/:id/comment ─────────────────────────
router.post('/:id/comment', authenticate, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'Comment text is required.' });
    }

    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ error: 'Post not found.' });
    }

    post.comments.push({
      userId: req.user._id,
      text,
    });

    await post.save();

    const populated = await post.populate([
      { path: 'userId', select: 'username displayName avatar points' },
      { path: 'comments.userId', select: 'username displayName avatar' },
    ]);

    res.json({ post: populated });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

export default router;
