import express from 'express';
import User from '../models/User.js';
import LoginRecord from '../models/LoginRecord.js';
import { authenticate, generateToken } from '../middleware/auth.js';

const router = express.Router();

// ── POST /api/auth/register ─────────────────────────────
router.post('/register', async (req, res) => {
  try {
    const { username, displayName, email, phone, password } = req.body;

    if (!username || !displayName || !email || !password) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    // Check for existing user
    const existing = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { username: username.toLowerCase() }],
    });
    if (existing) {
      return res.status(400).json({ error: 'Email or username already exists.' });
    }

    const user = await User.create({
      username,
      displayName,
      email,
      phone: phone || '',
      password,
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: user.toJSON(),
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Server error during registration.' });
  }
});

// ── POST /api/auth/login ────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password, loginMeta } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      // Record failed login
      if (loginMeta) {
        await LoginRecord.create({
          userId: user._id,
          browser: loginMeta.browser || '',
          os: loginMeta.os || '',
          deviceType: loginMeta.deviceType || '',
          ip: loginMeta.ip || '',
          status: 'Failed - Invalid Password',
        });
      }
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Record successful login
    if (loginMeta) {
      await LoginRecord.create({
        userId: user._id,
        browser: loginMeta.browser || '',
        os: loginMeta.os || '',
        deviceType: loginMeta.deviceType || '',
        ip: loginMeta.ip || '',
        status: 'Success',
      });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: user.toJSON(),
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error during login.' });
  }
});

// ── GET /api/auth/me ────────────────────────────────────
router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('friends', 'username displayName avatar points');
    res.json({ user: user.toJSON() });
  } catch (err) {
    console.error('Get me error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// ── POST /api/auth/forgot-password ──────────────────────
router.post('/forgot-password', async (req, res) => {
  try {
    const { identifier } = req.body; // email or phone
    const user = await User.findOne({
      $or: [{ email: identifier }, { phone: identifier }],
    });
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }
    // OTP generation is handled client-side via EmailJS (existing flow)
    res.json({ success: true, email: user.email, displayName: user.displayName });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// ── POST /api/auth/reset-password ───────────────────────
router.post('/reset-password', async (req, res) => {
  try {
    const { identifier, newPassword } = req.body;
    const user = await User.findOne({
      $or: [{ email: identifier }, { phone: identifier }],
    });
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }
    user.password = newPassword; // pre-save hook will hash it
    await user.save();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

export default router;
