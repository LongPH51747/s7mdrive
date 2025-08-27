import React, { useState, useEffect, useCallback } from 'react';
import { hasCheckedInToday } from '../services/workService';
import { useAuth } from './useAuth';
import { useFocusEffect } from '@react-navigation/native';

export const useCheckIn = () => {
  const { user } = useAuth();
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      checkCheckInStatus();
    }
  }, [user]);

  // Refresh check-in status when screen is focused
  useFocusEffect(
    useCallback(() => {
      if (user?.id) {
        console.log('🔍 [useCheckIn] Screen focused, refreshing check-in status...');
        checkCheckInStatus();
      }
    }, [user?.id])
  );

  const checkCheckInStatus = async () => {
    if (!user?.id) {
      setIsCheckedIn(false);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log('🔍 [useCheckIn] Checking check-in status for user:', user.id);
      const hasCheckedIn = await hasCheckedInToday(user.id);
      console.log('🔍 [useCheckIn] Check-in status result:', hasCheckedIn);
      setIsCheckedIn(hasCheckedIn);
    } catch (error) {
      console.error('❌ [useCheckIn] Error checking check-in status:', error);
      setIsCheckedIn(false);
    } finally {
      setLoading(false);
    }
  };

  const refreshCheckInStatus = async () => {
    console.log('🔍 [useCheckIn] Manual refresh requested');
    await checkCheckInStatus();
  };

  return {
    isCheckedIn,
    loading,
    refreshCheckInStatus,
  };
};
