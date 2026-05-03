import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { authAPI, usersAPI, setToken, removeToken, getToken } from '../services/api';
import { getLoginMetadata, getIPAddress, getDeviceType, getAuthRequirement } from '../utils/deviceDetection';
import { isMobileLoginAllowed, getMobileLoginMessage, isLoginWindowOpen, getLoginWindowMessage } from '../utils/timeRestrictions';
import { sendOtpEmail } from '../utils/emailService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const pendingOtpRef = useRef(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [loginHistory, setLoginHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  // ── Bootstrap: check for existing token on mount ──────
  useEffect(() => {
    const token = getToken();
    if (token) {
      authAPI.getMe()
        .then(data => {
          setCurrentUser(data.user);
        })
        .catch(() => {
          removeToken();
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  // ── Fetch all users (for search, discovery, etc.) ─────
  const fetchAllUsers = useCallback(async () => {
    try {
      const data = await usersAPI.getAll();
      setUsers(data.users || []);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    }
  }, []);

  useEffect(() => {
    if (currentUser) {
      fetchAllUsers();
    }
  }, [currentUser, fetchAllUsers]);

  // ── Login ─────────────────────────────────────────────
  const login = useCallback(async (email, password) => {
    try {
      // Check login time window — all devices restricted to 10 AM – 1 PM IST
      if (!isLoginWindowOpen()) {
        return { success: false, error: getLoginWindowMessage() };
      }

      // Additional mobile-specific check
      const deviceType = getDeviceType();
      if (deviceType === 'Mobile' && !isMobileLoginAllowed()) {
        return { success: false, error: getMobileLoginMessage() };
      }

      // Check browser-based auth requirement
      const authReq = getAuthRequirement();

      // Skip OTP if the user just verified via forgot-password flow
      const otpVerifiedUser = sessionStorage.getItem('so_otp_verified_user');
      if (otpVerifiedUser === email) {
        sessionStorage.removeItem('so_otp_verified_user');
        // Fall through to direct login — OTP already verified
      } else if (authReq === 'email_otp') {
        // For Chrome: generate OTP before actually logging in
        // We need to verify the user exists first
        const otp = String(Math.floor(100000 + Math.random() * 900000));
        pendingOtpRef.current = { otp, email, password };

        console.log('🔑 [DEMO] Login OTP for', email, ':', otp);

        sendOtpEmail({
          toEmail: email,
          toName: email,
          otp,
          purpose: 'Login Verification',
        }).catch(err => console.error('❌ OTP email send error:', err));

        return { success: false, requiresOtp: true, otpType: 'email', user: { email }, message: `OTP has been sent to ${email}` };
      }

      // Collect login metadata
      const meta = getLoginMetadata();
      const ip = await getIPAddress();
      const loginMeta = {
        browser: meta.browser,
        os: meta.os,
        deviceType: meta.deviceType,
        ip,
      };

      const data = await authAPI.login(email, password, loginMeta);
      setToken(data.token);
      setCurrentUser(data.user);
      return { success: true, user: data.user };
    } catch (err) {
      return { success: false, error: err.message || 'Invalid email or password.' };
    }
  }, []);

  // ── Complete OTP Login ────────────────────────────────
  const completeOtpLogin = useCallback(async (user, enteredOtp) => {
    console.log('🔐 completeOtpLogin called');
    console.log('🔐 enteredOtp:', enteredOtp);
    console.log('🔐 pendingOtpRef:', pendingOtpRef.current ? { otp: pendingOtpRef.current.otp, email: pendingOtpRef.current.email } : 'NULL');

    if (!pendingOtpRef.current) {
      return { success: false, error: 'OTP session expired. Please try logging in again.' };
    }

    if (enteredOtp !== pendingOtpRef.current.otp) {
      console.log('🔐 OTP MISMATCH! entered:', enteredOtp, 'expected:', pendingOtpRef.current.otp);
      return { success: false, error: 'Invalid OTP. Please check your email and try again.' };
    }

    console.log('🔐 OTP matched! Proceeding with login...');
    const { email, password } = pendingOtpRef.current;
    pendingOtpRef.current = null;

    try {
      const meta = getLoginMetadata();
      const ip = await getIPAddress();
      const loginMeta = {
        browser: meta.browser,
        os: meta.os,
        deviceType: meta.deviceType,
        ip,
      };

      const data = await authAPI.login(email, password, loginMeta);
      setToken(data.token);
      setCurrentUser(data.user);
      console.log('🔐 Login successful!');
      return { success: true, user: data.user };
    } catch (err) {
      console.error('🔐 Login API error:', err.message);
      return { success: false, error: err.message };
    }
  }, []);

  // ── Logout ────────────────────────────────────────────
  const logout = useCallback(() => {
    removeToken();
    setCurrentUser(null);
    setUsers([]);
    setLoginHistory([]);
  }, []);

  // ── Register ──────────────────────────────────────────
  const register = useCallback(async (userData) => {
    try {
      const data = await authAPI.register({
        username: userData.username,
        displayName: userData.displayName,
        email: userData.email,
        phone: userData.phone || '',
        password: userData.password,
      });
      setToken(data.token);
      setCurrentUser(data.user);
      return { success: true, user: data.user };
    } catch (err) {
      return { success: false, error: err.message || 'Registration failed.' };
    }
  }, []);

  // ── Update User ───────────────────────────────────────
  const updateUser = useCallback(async (userId, updates) => {
    try {
      const data = await usersAPI.update(userId, updates);
      if (currentUser?._id === userId) {
        setCurrentUser(data.user);
      }
      // Refresh users list
      fetchAllUsers();
    } catch (err) {
      console.error('Update user error:', err);
    }
  }, [currentUser, fetchAllUsers]);

  // ── Update Password ───────────────────────────────────
  const updatePassword = useCallback(async (identifier, newPassword) => {
    try {
      await authAPI.resetPassword(identifier, newPassword);
    } catch (err) {
      console.error('Update password error:', err);
    }
  }, []);

  // ── Get User By ID ────────────────────────────────────
  const getUserById = useCallback((id) => {
    return users.find(u => u._id === id);
  }, [users]);

  // ── Search Users ──────────────────────────────────────
  const searchUsers = useCallback(async (query) => {
    if (!query) return [];
    try {
      const data = await usersAPI.search(query);
      return data.users || [];
    } catch {
      return [];
    }
  }, []);

  // ── Login History ─────────────────────────────────────
  const getUserLoginHistory = useCallback(async (userId) => {
    try {
      const data = await usersAPI.getLoginHistory(userId);
      setLoginHistory(data.records || []);
      return data.records || [];
    } catch {
      return [];
    }
  }, []);

  // ── Friend System ─────────────────────────────────────
  const sendFriendRequest = useCallback(async (targetUserId) => {
    if (!currentUser) return { success: false };
    if (targetUserId === currentUser._id) return { success: false };
    if (currentUser.friends?.some(f => (f._id || f) === targetUserId)) {
      return { success: false, error: 'Already friends' };
    }
    try {
      const data = await usersAPI.addFriend(targetUserId);
      setCurrentUser(data.user);
      fetchAllUsers();
      return { success: true, autoAccepted: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, [currentUser, fetchAllUsers]);

  const removeFriend = useCallback(async (friendId) => {
    if (!currentUser) return;
    try {
      const data = await usersAPI.removeFriend(friendId);
      setCurrentUser(data.user);
      fetchAllUsers();
    } catch (err) {
      console.error('Remove friend error:', err);
    }
  }, [currentUser, fetchAllUsers]);

  // Stubs for compatibility — these are now auto-accepted
  const acceptFriendRequest = useCallback(() => {}, []);
  const rejectFriendRequest = useCallback(() => {}, []);
  const cancelFriendRequest = useCallback(() => {}, []);
  const getIncomingRequests = useCallback(() => [], []);
  const getOutgoingRequests = useCallback(() => [], []);

  const getAllUsers = useCallback(() => users, [users]);

  const value = {
    currentUser,
    users,
    loading,
    login,
    completeOtpLogin,
    logout,
    register,
    updateUser,
    updatePassword,
    getUserById,
    searchUsers,
    getUserLoginHistory,
    loginHistory,
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    cancelFriendRequest,
    removeFriend,
    getIncomingRequests,
    getOutgoingRequests,
    getAllUsers,
    fetchAllUsers,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
