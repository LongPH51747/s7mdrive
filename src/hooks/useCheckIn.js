import { useState, useEffect } from 'react';
import { hasCheckedInToday } from '../services/workService';
import { useAuth } from './useAuth';

export const useCheckIn = () => {
  const { user } = useAuth();
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      checkCheckInStatus();
    }
  }, [user]);

  const checkCheckInStatus = async () => {
    if (!user?.id) {
      setIsCheckedIn(false);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const hasCheckedIn = await hasCheckedInToday(user.id);
      setIsCheckedIn(hasCheckedIn);
    } catch (error) {
      console.error('Error checking check-in status:', error);
      setIsCheckedIn(false);
    } finally {
      setLoading(false);
    }
  };

  const refreshCheckInStatus = () => {
    checkCheckInStatus();
  };

  return {
    isCheckedIn,
    loading,
    refreshCheckInStatus,
  };
};
