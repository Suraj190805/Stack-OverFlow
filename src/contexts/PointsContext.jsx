import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { pointsAPI } from '../services/api';

const PointsContext = createContext(null);

export function PointsProvider({ children }) {
  const { currentUser, updateUser, getUserById } = useAuth();
  const [transactions, setTransactions] = useState([]);

  // Fetch transactions when user changes
  useEffect(() => {
    if (currentUser) {
      pointsAPI.getTransactions()
        .then(data => setTransactions(data.transactions || []))
        .catch(err => console.error('Failed to fetch transactions:', err));
    } else {
      setTransactions([]);
    }
  }, [currentUser]);

  // Helper to refresh transactions from server
  const refreshTransactions = useCallback(async () => {
    try {
      const data = await pointsAPI.getTransactions();
      setTransactions(data.transactions || []);
    } catch (err) {
      console.error('Failed to refresh transactions:', err);
    }
  }, []);

  // Points operations are now handled server-side via vote/answer endpoints
  // These client-side stubs are kept for component compatibility
  // The actual point changes happen in the backend route handlers

  const earnForAnswer = useCallback(() => {
    // Handled by POST /api/answers (server awards +5)
    refreshTransactions();
  }, [refreshTransactions]);

  const earnForQuestion = useCallback(() => {
    // Handled by POST /api/questions (server awards +2)
    refreshTransactions();
  }, [refreshTransactions]);

  const earnUpvoteBonus = useCallback(() => {
    // Handled by POST /api/questions/:id/vote or /api/answers/:id/vote
    refreshTransactions();
  }, [refreshTransactions]);

  const deductForDownvote = useCallback(() => {
    // Handled by vote endpoints
    refreshTransactions();
  }, [refreshTransactions]);

  const deductForRemoval = useCallback(() => {
    // Handled by DELETE /api/answers/:id
    refreshTransactions();
  }, [refreshTransactions]);

  const transferPoints = useCallback(async (senderId, recipientId, amount) => {
    try {
      const data = await pointsAPI.transfer(recipientId, amount);
      refreshTransactions();
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, [refreshTransactions]);

  const getUserTransactions = useCallback((userId) => {
    return transactions.filter(t => t.userId === userId);
  }, [transactions]);

  return (
    <PointsContext.Provider value={{
      transactions,
      earnForAnswer,
      earnForQuestion,
      earnUpvoteBonus,
      deductForDownvote,
      deductForRemoval,
      transferPoints,
      getUserTransactions,
      refreshTransactions,
    }}>
      {children}
    </PointsContext.Provider>
  );
}

export function usePoints() {
  const ctx = useContext(PointsContext);
  if (!ctx) throw new Error('usePoints must be used within PointsProvider');
  return ctx;
}
