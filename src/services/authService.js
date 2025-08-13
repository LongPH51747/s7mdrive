import apiClient, {externalApiClient} from './apiClient';
import {API_CONFIG} from '../constants/api';

class AuthService {
  // Đăng nhập sử dụng API external
  async login(credentials) {
    try {
      console.log('🔐 Đang đăng nhập với API external...');
      console.log('📤 Request body:', {
        user_name: credentials.username,
        password: credentials.password,
      });

      const response = await externalApiClient.post(API_CONFIG.ENDPOINTS.SHIPPER_LOGIN, {
        user_name: credentials.username,
        password: credentials.password,
      });

      console.log('📥 Response status:', response.status);
      console.log('📥 Response data:', response.data);

      // Kiểm tra status code 200
      if (response.status === 200) {
        // Đăng nhập thành công
        const responseData = response.data;
        
        // Xử lý response mới với cấu trúc {token, shipper}
        if (responseData.token && responseData.shipper) {
          const shipperData = responseData.shipper;
          
          // Tạo object user với format tương thích
          const user = {
            id: shipperData._id,
            username: shipperData.user_name,
            name: shipperData.name,
            phone: shipperData.phone_number,
            role: 'shipper',
            status: shipperData.status,
            password: credentials.password, // Lưu password để tương thích
            
            // Thông tin bưu cục
            post_office: shipperData.post_office,
            post_office_name: shipperData.post_office?.name,
            post_office_address: shipperData.post_office?.address_post_office,
            post_office_latitude: shipperData.post_office?.latitude,
            post_office_longitude: shipperData.post_office?.longitude,
            
            // Thông tin khu vực giao hàng
            address_shipping: shipperData.address_shipping,
            
            // Thông tin công việc
            work: shipperData.work || [],
            
            // Token
            token: responseData.token,
            
            // Thông tin thời gian
            createdAt: shipperData.createdAt,
            updatedAt: shipperData.updatedAt,
            
            ...shipperData, // Thêm tất cả data khác từ server
          };

          return {
            success: true,
            user: user,
          };
        } else {
          return {
            success: false,
            message: 'Response không hợp lệ: thiếu token hoặc thông tin shipper',
          };
        }
      } else {
        return {
          success: false,
          message: 'Đăng nhập thất bại',
        };
      }
    } catch (error) {
      console.error('❌ Login error:', error);
      
      // Xử lý các loại lỗi khác nhau
      if (error.response) {
        // Server trả về response với status code khác 200
        console.error('❌ Server error:', error.response.status, error.response.data);
        return {
          success: false,
          message: error.response.data?.message || 'Tên đăng nhập hoặc mật khẩu không đúng',
        };
      } else if (error.request) {
        // Không nhận được response từ server
        console.error('❌ Network error:', error.request);
        return {
          success: false,
          message: 'Lỗi kết nối server. Vui lòng kiểm tra mạng và thử lại.',
        };
      } else {
        // Lỗi khác
        console.error('❌ Other error:', error.message);
        return {
          success: false,
          message: 'Có lỗi xảy ra, vui lòng thử lại.',
        };
      }
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
