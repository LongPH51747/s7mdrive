import apiClient from './apiClient';

// Lưu thông tin check-in vào database (chỉ ngày giờ)
export const saveCheckIn = async (userId) => {
  try {
    console.log('💾 Bắt đầu lưu check-in...');
    console.log('💾 User ID:', userId);
    
    // Lấy thông tin user hiện tại
    const response = await apiClient.get(`/users/${userId}`);
    const currentUser = response.data;
    
    // Tạo object check-in đơn giản
    const checkInTime = new Date();
    const newCheckIn = {
      date: checkInTime.toISOString().split('T')[0], // YYYY-MM-DD
      time: checkInTime.toTimeString().split(' ')[0] // HH:mm:ss
    };
    
    console.log('💾 Check-in record mới:', newCheckIn);
    
    // Thêm vào mảng check_in hiện tại
    const updatedCheckIn = [...(currentUser.check_in || []), newCheckIn];
    
    // Cập nhật user với check-in mới
    const updateResponse = await apiClient.patch(`/users/${userId}`, {
      check_in: updatedCheckIn
    });
    
    console.log('✅ Đã lưu check-in thành công!');
    console.log('✅ Tổng số lần check-in:', updatedCheckIn.length);
    
    return {
      success: true,
      data: updateResponse.data,
      checkInRecord: newCheckIn
    };
  } catch (error) {
    console.error('❌ Lỗi khi lưu check-in:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Lấy lịch sử check-in của user
export const getCheckInHistory = async (userId) => {
  try {
    console.log('📋 Lấy lịch sử check-in cho user:', userId);
    
    const response = await apiClient.get(`/users/${userId}`);
    const user = response.data;
    
    const checkInHistory = user.check_in || [];
    
    console.log('📋 Lịch sử check-in:', checkInHistory);
    console.log('📋 Tổng số lần check-in:', checkInHistory.length);
    
    return {
      success: true,
      data: checkInHistory
    };
  } catch (error) {
    console.error('❌ Lỗi khi lấy lịch sử check-in:', error);
    return {
      success: false,
      error: error.message,
      data: []
    };
  }
};

// Kiểm tra xem user đã check-in hôm nay chưa
export const hasCheckedInToday = async (userId) => {
  try {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    console.log('🔍 Kiểm tra check-in hôm nay:', today);
    
    const historyResponse = await getCheckInHistory(userId);
    if (!historyResponse.success) {
      return false;
    }
    
    const todayCheckIn = historyResponse.data.find(
      record => record.date === today
    );
    
    const hasCheckedIn = !!todayCheckIn;
    console.log('🔍 Đã check-in hôm nay:', hasCheckedIn ? '✅ CÓ' : '❌ CHƯA');
    
    if (hasCheckedIn) {
      console.log('🔍 Thông tin check-in hôm nay:', todayCheckIn);
    }
    
    return hasCheckedIn;
  } catch (error) {
    console.error('❌ Lỗi khi kiểm tra check-in hôm nay:', error);
    return false;
  }
};

// Lấy danh sách các ngày đã check-in trong tháng
export const getCheckedInDaysInMonth = async (userId, year, month) => {
  try {
    console.log('📅 Lấy danh sách ngày check-in trong tháng:', year, month);
    
    const historyResponse = await getCheckInHistory(userId);
    if (!historyResponse.success) {
      return [];
    }
    
    const checkedInDays = historyResponse.data
      .filter(record => {
        const recordDate = new Date(record.date);
        return recordDate.getFullYear() === year && 
               recordDate.getMonth() === month;
      })
      .map(record => new Date(record.date).getDate());
    
    console.log('📅 Các ngày đã check-in trong tháng:', checkedInDays);
    
    return checkedInDays;
  } catch (error) {
    console.error('❌ Lỗi khi lấy danh sách ngày check-in:', error);
    return [];
  }
}; 