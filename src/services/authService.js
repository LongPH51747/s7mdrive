import apiClient from './apiClient';
import {API_CONFIG} from '../constants/api';

class AuthService {
  // Đăng nhập
  async login(credentials) {
    try {
      const response = await apiClient.get(API_CONFIG.ENDPOINTS.USERS);
      const users = response.data;

      const foundUser = users.find(
        user =>
          user.username === credentials.username &&
          user.password === credentials.password,
      );

      if (foundUser) {
        // Loại bỏ password khỏi response
        const {password, ...userWithoutPassword} = foundUser;

        return {
          success: true,
          user: userWithoutPassword,
        };
      } else {
        return {
          success: false,
          message: 'Tên đăng nhập hoặc mật khẩu không đúng',
        };
      }
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: 'Lỗi kết nối server. Vui lòng thử lại.',
      };
    }
  }

  // Lấy thông tin user theo ID
  async getUserById(userId) {
    try {
      const response = await apiClient.get(
        `${API_CONFIG.ENDPOINTS.USERS}/${userId}`,
      );
      return response.data;
    } catch (error) {
      console.error('Get user error:', error);
      return null;
    }
  }

  // Lấy danh sách tất cả users (cho admin)
  async getAllUsers() {
    try {
      const response = await apiClient.get(API_CONFIG.ENDPOINTS.USERS);
      return response.data;
    } catch (error) {
      console.error('Get all users error:', error);
      return [];
    }
  }

  // Cập nhật thông tin user
  async updateUser(userId, userData) {
    try {
      await apiClient.patch(
        `${API_CONFIG.ENDPOINTS.USERS}/${userId}`,
        userData,
      );
      return true;
    } catch (error) {
      console.error('Update user error:', error);
      return false;
    }
  }

  // Cập nhật vị trí hiện tại của shipper
  async updateLocation(userId, location) {
    try {
      await apiClient.patch(`${API_CONFIG.ENDPOINTS.USERS}/${userId}`, {
        current_location: location,
      });
      return true;
    } catch (error) {
      console.error('Update location error:', error);
      return false;
    }
  }

  // Cập nhật trạng thái shipper
  async updateShipperStatus(userId, status) {
    try {
      await apiClient.patch(`${API_CONFIG.ENDPOINTS.USERS}/${userId}`, {
        status: status,
      });
      return true;
    } catch (error) {
      console.error('Update shipper status error:', error);
      return false;
    }
  }
}

export default new AuthService();
