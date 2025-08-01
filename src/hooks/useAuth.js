import React, {createContext, useContext, useState, useEffect} from 'react';
import {authService} from '../services';
import {getUserData, saveUserData, removeUserData} from '../utils/userStorage';

const AuthContext = createContext(undefined);

export const AuthProvider = ({children}) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const userData = await getUserData();
      if (userData) {
        setUser(userData);
        console.log('Đã khôi phục thông tin user từ AsyncStorage:', userData);
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    try {
      const response = await authService.login({username, password});

      if (response.success && response.user) {
        // Lưu toàn bộ thông tin user vào AsyncStorage
        const userData = {
          ...response.user,
          loginTime: new Date().toISOString(), // Thêm thời gian đăng nhập
        };
        
        setUser(userData);
        await saveUserData(userData);
        
        // Log thông tin user sau khi đăng nhập thành công
        console.log('=== THÔNG TIN USER ĐÃ ĐĂNG NHẬP ===');
        console.log('ID:', userData.id);
        console.log('Username:', userData.username);
        console.log('Tên:', userData.name);
        console.log('Email:', userData.email);
        console.log('Số điện thoại:', userData.phone);
        console.log('Vai trò:', userData.role);
        console.log('Khu vực:', userData.area);
        console.log('Phương tiện:', userData.vehicle);
        console.log('Biển số xe:', userData.license_plate);
        console.log('Trạng thái:', userData.status === 0 ? 'Hoạt động' : 'Không hoạt động');
        console.log('ID Bưu cục:', userData.id_post_office);
        console.log('Thời gian đăng nhập:', new Date(userData.loginTime).toLocaleString('vi-VN'));
        console.log('Password:', userData.password);
        console.log('=====================================');
        
        return true;
      }

      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await removeUserData();
      setUser(null);
      console.log('Đã đăng xuất và xóa thông tin user');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
    login,
    logout,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
