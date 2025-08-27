import {externalApiClient} from './apiClient';
import {API_CONFIG} from '../constants/api';

// Tạo work record mới khi shipper check-in
export const createWorkRecord = async (shipperId) => {
  try {
    console.log('📝 Tạo work record mới cho shipper:', shipperId);
    
    // Log URL API
    const apiUrl = `${API_CONFIG.BASE_URL_EXTERNAL}${API_CONFIG.ENDPOINTS.WORK_CHECKIN}/${shipperId}`;
    console.log('🌐 URL API check-in:', apiUrl);
    console.log('📤 Request body: Không có (POST request)');
    
    // Gọi API thực tế - không cần body
    const response = await externalApiClient.post(`${API_CONFIG.ENDPOINTS.WORK_CHECKIN}/${shipperId}`);
    
    console.log('📥 Response từ API:', response.data);
    
    return {
      success: true,
      data: response.data,
      message: 'Work record đã được tạo thành công'
    };
  } catch (error) {
    console.error('❌ Lỗi khi tạo work record:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Lấy lịch sử check-in của shipper từ API
export const getWorkHistoryByShipper = async (shipperId) => {
  try {
    console.log('📋 Lấy lịch sử work cho shipper:', shipperId);
    
    const apiUrl = `${API_CONFIG.BASE_URL_EXTERNAL}${API_CONFIG.ENDPOINTS.WORK_BY_SHIPPER}/${shipperId}`;
    console.log('🌐 URL API lấy lịch sử work:', apiUrl);
    
    const response = await externalApiClient.get(`${API_CONFIG.ENDPOINTS.WORK_BY_SHIPPER}/${shipperId}`);
    const workHistory = response.data;
    
    console.log('📋 Lịch sử work từ API:', workHistory);
    console.log('📋 Tổng số ngày đã làm việc:', workHistory.length);
    console.log('📋 Chi tiết từng work record:', workHistory.map(work => ({
      id: work.id,
      createdAt: work.createdAt,
      orderSuccess: work.order_success?.length || 0
    })));
    
    return {
      success: true,
      data: workHistory
    };
  } catch (error) {
    console.error('❌ Lỗi khi lấy lịch sử work:', error);
    return {
      success: false,
      error: error.message,
      data: []
    };
  }
};

// Kiểm tra xem shipper đã check-in hôm nay chưa
export const hasCheckedInToday = async (shipperId) => {
  try {
    // Sử dụng timezone của Việt Nam
    const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' }); // YYYY-MM-DD
    console.log('🔍 Kiểm tra check-in hôm nay (VN timezone):', today);
    
    const historyResponse = await getWorkHistoryByShipper(shipperId);
    if (!historyResponse.success) {
      return false;
    }
    
    const todayCheckIn = historyResponse.data.find(work => {
      // Chuyển đổi createdAt sang timezone Việt Nam
      const workDate = new Date(work.createdAt).toLocaleDateString('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' });
      console.log('🔍 So sánh ngày:', workDate, 'với', today, '=', workDate === today);
      return workDate === today;
    });
    
    const hasCheckedIn = !!todayCheckIn;
    console.log('🔍 Đã check-in hôm nay:', hasCheckedIn ? '✅ CÓ' : '❌ CHƯA');
    
    if (hasCheckedIn) {
      console.log('🔍 Thông tin check-in hôm nay:', {
        id: todayCheckIn.id,
        createdAt: todayCheckIn.createdAt,
        orderSuccess: todayCheckIn.order_success?.length || 0
      });
    }
    
    return hasCheckedIn;
  } catch (error) {
    console.error('❌ Lỗi khi kiểm tra check-in hôm nay:', error);
    return false;
  }
};

// Lấy danh sách các ngày đã check-in trong tháng
export const getCheckedInDaysInMonth = async (shipperId, year, month) => {
  try {
    console.log('📅 Lấy danh sách ngày check-in trong tháng:', year, month);
    
    const historyResponse = await getWorkHistoryByShipper(shipperId);
    if (!historyResponse.success) {
      return [];
    }
    
    const checkedInDays = historyResponse.data
      .filter(work => {
        const workDate = new Date(work.createdAt);
        return workDate.getFullYear() === year && 
               workDate.getMonth() === month;
      })
      .map(work => new Date(work.createdAt).getDate());
    
    // Loại bỏ duplicate dates bằng Set
    const uniqueCheckedInDays = [...new Set(checkedInDays)].sort((a, b) => a - b);
    
    console.log('📅 Các ngày đã check-in trong tháng (có duplicate):', checkedInDays);
    console.log('📅 Các ngày đã check-in trong tháng (đã loại bỏ duplicate):', uniqueCheckedInDays);
    
    return uniqueCheckedInDays;
  } catch (error) {
    console.error('❌ Lỗi khi lấy danh sách ngày check-in:', error);
    return [];
  }
};

// Lấy thống kê check-in
export const getCheckInStatistics = async (shipperId) => {
  try {
    console.log('📊 Lấy thống kê check-in cho shipper:', shipperId);
    
    const historyResponse = await getWorkHistoryByShipper(shipperId);
    if (!historyResponse.success) {
      return {
        totalDays: 0,
        totalOrders: 0,
        averageOrdersPerDay: 0
      };
    }
    
    const workHistory = historyResponse.data;
    const totalDays = workHistory.length;
    const totalOrders = workHistory.reduce((sum, work) => {
      return sum + (work.order_success?.length || 0);
    }, 0);
    const averageOrdersPerDay = totalDays > 0 ? (totalOrders / totalDays).toFixed(1) : 0;
    
    console.log('📊 Thống kê check-in:', {
      totalDays,
      totalOrders,
      averageOrdersPerDay
    });
    
    return {
      totalDays,
      totalOrders,
      averageOrdersPerDay
    };
  } catch (error) {
    console.error('❌ Lỗi khi lấy thống kê check-in:', error);
    return {
      totalDays: 0,
      totalOrders: 0,
      averageOrdersPerDay: 0
    };
  }
};

// Xác nhận đơn hàng hoàn thành với ảnh
export const confirmOrderSuccess = async (shipperId, orderId, imageUri) => {
  try {
    console.log('📸 Xác nhận đơn hàng hoàn thành:', {shipperId, orderId});
    console.log('📸 Image URI:', imageUri);
    
    // Tạo FormData
    const formData = new FormData();
    formData.append('id_order', orderId);
    formData.append('image', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'image.jpg'
    });
    
    // Log URL API
    const apiUrl = `${API_CONFIG.BASE_URL_EXTERNAL}${API_CONFIG.ENDPOINTS.WORK_ORDER_SUCCESS}/${shipperId}`;
    console.log('🌐 URL API xác nhận đơn hàng:', apiUrl);
    console.log('🌐 Endpoint:', API_CONFIG.ENDPOINTS.WORK_ORDER_SUCCESS);
    console.log('🌐 Base URL:', API_CONFIG.BASE_URL_EXTERNAL);
    console.log('🌐 Shipper ID:', shipperId);
    console.log('📤 FormData content:');
    console.log('   - id_order:', orderId);
    console.log('   - image:', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'image.jpg'
    });
    
    // Gọi API với multipart/form-data
    const response = await externalApiClient.put(
      `${API_CONFIG.ENDPOINTS.WORK_ORDER_SUCCESS}/${shipperId}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    
    console.log('📥 Response từ API:', response.data);
    
    return {
      success: true,
      data: response.data,
      message: 'Đơn hàng đã được xác nhận hoàn thành'
    };
  } catch (error) {
    console.error('❌ Lỗi khi xác nhận đơn hàng:', error);
    return {
      success: false,
      error: error.message
    };
  }
};
