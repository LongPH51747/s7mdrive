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
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    console.log('🔍 Kiểm tra check-in hôm nay:', today);
    
    const historyResponse = await getWorkHistoryByShipper(shipperId);
    if (!historyResponse.success) {
      return false;
    }
    
    const todayCheckIn = historyResponse.data.find(work => {
      const workDate = new Date(work.createdAt).toISOString().split('T')[0];
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
    
    console.log('📅 Các ngày đã check-in trong tháng:', checkedInDays);
    
    return checkedInDays;
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
