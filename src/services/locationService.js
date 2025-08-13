import Geolocation from 'react-native-geolocation-service';
import {PermissionsAndroid, Platform, Alert} from 'react-native';

// Dữ liệu post_office từ db.json
const postOffices = [
  {
    id: "1",
    province: "Hà Nội",
    address: "Cao đẳng FPT Polytechnic, Phố Trịnh Văn Bô, Quận Nam Từ Liêm, Hà Nội",
    latitude: 21.0380074,
    longitude: 105.7468965
  }
];

// Hàm xin quyền truy cập vị trí
export const requestLocationPermission = async () => {
  console.log('🔐 Bắt đầu xin quyền truy cập vị trí...');
  console.log('🔐 Platform:', Platform.OS);
  
  if (Platform.OS === 'ios') {
    console.log('🔐 Đang xin quyền trên iOS...');
    const auth = await Geolocation.requestAuthorization('whenInUse');
    console.log('🔐 Kết quả quyền iOS:', auth);
    
    if (auth === 'granted') {
      console.log('✅ Quyền iOS đã được cấp');
      return true;
    } else {
      console.log('❌ Quyền iOS bị từ chối:', auth);
    }
  }

  if (Platform.OS === 'android') {
    console.log('🔐 Đang xin quyền trên Android...');
    console.log('🔐 Quyền yêu cầu:', PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
    
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title: 'Quyền truy cập vị trí',
        message: 'Ứng dụng cần quyền truy cập vị trí để check-in',
        buttonNeutral: 'Hỏi lại sau',
        buttonNegative: 'Từ chối',
        buttonPositive: 'Đồng ý',
      },
    );
    
    console.log('🔐 Kết quả quyền Android:', granted);
    console.log('🔐 Các trạng thái có thể:');
    console.log('   - GRANTED:', PermissionsAndroid.RESULTS.GRANTED);
    console.log('   - DENIED:', PermissionsAndroid.RESULTS.DENIED);
    console.log('   - NEVER_ASK_AGAIN:', PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN);
    
    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      console.log('✅ Quyền Android đã được cấp');
      return true;
    } else if (granted === PermissionsAndroid.RESULTS.DENIED) {
      console.log('❌ Quyền Android bị từ chối');
    } else if (granted === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
      console.log('❌ Quyền Android bị từ chối vĩnh viễn');
    }
  }
  
  console.log('❌ Không có quyền truy cập vị trí');
  return false;
};

// Hàm tính khoảng cách giữa 2 điểm (Haversine formula)
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  console.log('📏 Bắt đầu tính khoảng cách bằng Haversine formula...');
  console.log('📏 Điểm 1 (vị trí của bạn):', { lat: lat1, lon: lon1 });
  console.log('📏 Điểm 2 (bưu cục):', { lat: lat2, lon: lon2 });
  
  const R = 6371; // Bán kính trái đất (km)
  console.log('📏 Bán kính trái đất (R):', R, 'km');
  
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  console.log('📏 Chênh lệch Latitude (radians):', dLat.toFixed(6));
  console.log('📏 Chênh lệch Longitude (radians):', dLon.toFixed(6));
  
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  console.log('📏 Giá trị a (intermediate):', a.toFixed(6));
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  console.log('📏 Giá trị c (angular distance):', c.toFixed(6));
  
  const distanceKm = R * c; // Khoảng cách tính bằng km
  const distanceM = distanceKm * 1000; // Chuyển về mét
  
  console.log('📏 Khoảng cách tính được:');
  console.log('   - Kilomet:', distanceKm.toFixed(6), 'km');
  console.log('   - Mét:', distanceM.toFixed(2), 'm');
  console.log('   - Mét (làm tròn):', Math.round(distanceM), 'm');
  
  return distanceM;
};

// Hàm lấy vị trí hiện tại
export const getCurrentLocation = () => {
  return new Promise((resolve, reject) => {
    console.log('📍 Bắt đầu lấy vị trí GPS...');
    console.log('📍 Cấu hình GPS:');
    console.log('   - enableHighAccuracy:', true);
    console.log('   - timeout:', '15 giây');
    console.log('   - maximumAge:', '10 giây');
    
    Geolocation.getCurrentPosition(
      (position) => {
        console.log('📍 GPS thành công!');
        console.log('📍 Thông tin vị trí chi tiết:');
        console.log('   - Latitude:', position.coords.latitude);
        console.log('   - Longitude:', position.coords.longitude);
        console.log('   - Accuracy:', position.coords.accuracy, 'mét');
        console.log('   - Altitude:', position.coords.altitude || 'Không có');
        console.log('   - Heading:', position.coords.heading || 'Không có');
        console.log('   - Speed:', position.coords.speed || 'Không có');
        console.log('   - Timestamp:', new Date(position.timestamp).toLocaleString('vi-VN'));
        
        const location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp
        };
        
        console.log('📍 Vị trí đã lấy thành công:', location);
        resolve(location);
      },
      (error) => {
        console.error('📍 GPS thất bại!');
        console.error('📍 Mã lỗi:', error.code);
        console.error('📍 Thông báo lỗi:', error.message);
        
        // Giải thích mã lỗi
        const errorMessages = {
          1: 'PERMISSION_DENIED - Người dùng từ chối quyền truy cập vị trí',
          2: 'POSITION_UNAVAILABLE - Không thể xác định vị trí',
          3: 'TIMEOUT - Hết thời gian chờ lấy vị trí',
          4: 'PLAY_SERVICE_NOT_AVAILABLE - Google Play Services không khả dụng (Android)',
          5: 'SETTINGS_NOT_SATISFIED - Cài đặt vị trí không thỏa mãn',
          6: 'INTERNAL_ERROR - Lỗi nội bộ'
        };
        
        console.error('📍 Giải thích lỗi:', errorMessages[error.code] || 'Lỗi không xác định');
        reject(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 10000,
      }
    );
  });
};

// Hàm kiểm tra khoảng cách đến bưu cục (sử dụng user data)
export const checkDistanceToPostOfficeWithUserData = async (user) => {
  console.log('=== BẮT ĐẦU KIỂM TRA KHOẢNG CÁCH (USER DATA) ===');
  console.log('Thông tin user:', {
    id: user?.id,
    name: user?.name,
    post_office_name: user?.post_office_name,
    post_office_address: user?.post_office_address,
    post_office_latitude: user?.post_office_latitude,
    post_office_longitude: user?.post_office_longitude
  });
  console.log('Thời gian bắt đầu:', new Date().toLocaleString('vi-VN'));
  
  try {
    // Xin quyền truy cập vị trí
    console.log('🔐 Đang xin quyền truy cập vị trí...');
    const hasPermission = await requestLocationPermission();
    console.log('✅ Quyền truy cập vị trí:', hasPermission ? 'Đã cấp' : 'Bị từ chối');
    
    if (!hasPermission) {
      throw new Error('Không có quyền truy cập vị trí');
    }

    // Lấy vị trí hiện tại
    console.log('📍 Đang lấy vị trí hiện tại...');
    const currentLocation = await getCurrentLocation();
    console.log('📍 Vị trí hiện tại của bạn:');
    console.log('   - Latitude:', currentLocation.latitude);
    console.log('   - Longitude:', currentLocation.longitude);
    console.log('   - Link Google Maps:', `https://www.google.com/maps?q=${currentLocation.latitude},${currentLocation.longitude}`);

    // Kiểm tra thông tin bưu cục từ user
    if (!user?.post_office_latitude || !user?.post_office_longitude) {
      console.log('❌ Không có thông tin tọa độ bưu cục từ user');
      throw new Error('Không có thông tin tọa độ bưu cục');
    }

    const postOfficeData = {
      id: user.id,
      name: user.post_office_name,
      address: user.post_office_address,
      latitude: user.post_office_latitude,
      longitude: user.post_office_longitude
    };

    console.log('🏢 Thông tin bưu cục từ user:');
    console.log('   - ID:', postOfficeData.id);
    console.log('   - Tên:', postOfficeData.name);
    console.log('   - Địa chỉ:', postOfficeData.address);
    console.log('   - Latitude:', postOfficeData.latitude);
    console.log('   - Longitude:', postOfficeData.longitude);
    console.log('   - Link Google Maps:', `https://www.google.com/maps?q=${postOfficeData.latitude},${postOfficeData.longitude}`);

    // Tính khoảng cách
    console.log('📏 Đang tính khoảng cách...');
    const distance = calculateDistance(
      currentLocation.latitude,
      currentLocation.longitude,
      postOfficeData.latitude,
      postOfficeData.longitude
    );

    console.log('📏 Kết quả tính khoảng cách:');
    console.log('   - Khoảng cách chính xác:', distance.toFixed(2), 'mét');
    console.log('   - Khoảng cách làm tròn:', Math.round(distance), 'mét');
    console.log('   - Phạm vi cho phép:', '100 mét');
    console.log('   - Có trong phạm vi không:', distance <= 100 ? '✅ CÓ' : '❌ KHÔNG');

    // Thông tin chi tiết về vị trí
    console.log('🗺️ Thông tin chi tiết:');
    console.log('   - Vị trí của bạn:', `${currentLocation.latitude}, ${currentLocation.longitude}`);
    console.log('   - Vị trí bưu cục:', `${postOfficeData.latitude}, ${postOfficeData.longitude}`);
    console.log('   - Chênh lệch Latitude:', Math.abs(currentLocation.latitude - postOfficeData.latitude).toFixed(6));
    console.log('   - Chênh lệch Longitude:', Math.abs(currentLocation.longitude - postOfficeData.longitude).toFixed(6));

    const result = {
      success: true,
      distance: distance,
      currentLocation: currentLocation,
      postOffice: postOfficeData,
      isWithinRange: distance <= 100
    };

    console.log('✅ Kết quả cuối cùng:', result);
    console.log('=== KẾT THÚC KIỂM TRA KHOẢNG CÁCH (USER DATA) ===\n');
    
    return result;
  } catch (error) {
    console.error('❌ Lỗi khi kiểm tra khoảng cách:', error);
    console.log('=== KẾT THÚC KIỂM TRA KHOẢNG CÁCH (USER DATA) (LỖI) ===\n');
    return {
      success: false,
      error: error.message
    };
  }
};

// Hàm kiểm tra khoảng cách đến bưu cục (legacy - sử dụng userId)
export const checkDistanceToPostOffice = async (userId) => {
  console.log('=== BẮT ĐẦU KIỂM TRA KHOẢNG CÁCH ===');
  console.log('User ID (post_office_id):', userId);
  console.log('Thời gian bắt đầu:', new Date().toLocaleString('vi-VN'));
  
  try {
    // Xin quyền truy cập vị trí
    console.log('🔐 Đang xin quyền truy cập vị trí...');
    const hasPermission = await requestLocationPermission();
    console.log('✅ Quyền truy cập vị trí:', hasPermission ? 'Đã cấp' : 'Bị từ chối');
    
    if (!hasPermission) {
      throw new Error('Không có quyền truy cập vị trí');
    }

    // Lấy vị trí hiện tại
    console.log('📍 Đang lấy vị trí hiện tại...');
    const currentLocation = await getCurrentLocation();
    console.log('📍 Vị trí hiện tại của bạn:');
    console.log('   - Latitude:', currentLocation.latitude);
    console.log('   - Longitude:', currentLocation.longitude);
    console.log('   - Link Google Maps:', `https://www.google.com/maps?q=${currentLocation.latitude},${currentLocation.longitude}`);

    // Tìm post_office của user
    console.log('🏢 Đang tìm thông tin bưu cục...');
    console.log('📋 Danh sách tất cả bưu cục:', postOffices);
    const userPostOffice = postOffices.find(office => office.id === userId);
    
    if (!userPostOffice) {
      console.log('❌ Không tìm thấy bưu cục với ID:', userId);
      throw new Error('Không tìm thấy thông tin bưu cục');
    }

    console.log('🏢 Thông tin bưu cục của bạn:');
    console.log('   - ID:', userPostOffice.id);
    console.log('   - Tỉnh/Thành:', userPostOffice.province);
    console.log('   - Địa chỉ:', userPostOffice.address);
    console.log('   - Latitude:', userPostOffice.latitude);
    console.log('   - Longitude:', userPostOffice.longitude);
    console.log('   - Link Google Maps:', `https://www.google.com/maps?q=${userPostOffice.latitude},${userPostOffice.longitude}`);

    // Tính khoảng cách
    console.log('📏 Đang tính khoảng cách...');
    const distance = calculateDistance(
      currentLocation.latitude,
      currentLocation.longitude,
      userPostOffice.latitude,
      userPostOffice.longitude
    );

    console.log('📏 Kết quả tính khoảng cách:');
    console.log('   - Khoảng cách chính xác:', distance.toFixed(2), 'mét');
    console.log('   - Khoảng cách làm tròn:', Math.round(distance), 'mét');
    console.log('   - Phạm vi cho phép:', '100 mét');
    console.log('   - Có trong phạm vi không:', distance <= 100 ? '✅ CÓ' : '❌ KHÔNG');

    // Thông tin chi tiết về vị trí
    console.log('🗺️ Thông tin chi tiết:');
    console.log('   - Vị trí của bạn:', `${currentLocation.latitude}, ${currentLocation.longitude}`);
    console.log('   - Vị trí bưu cục:', `${userPostOffice.latitude}, ${userPostOffice.longitude}`);
    console.log('   - Chênh lệch Latitude:', Math.abs(currentLocation.latitude - userPostOffice.latitude).toFixed(6));
    console.log('   - Chênh lệch Longitude:', Math.abs(currentLocation.longitude - userPostOffice.longitude).toFixed(6));

    const result = {
      success: true,
      distance: distance,
      currentLocation: currentLocation,
      postOffice: userPostOffice,
      isWithinRange: distance <= 2000
    };

    console.log('✅ Kết quả cuối cùng:', result);
    console.log('=== KẾT THÚC KIỂM TRA KHOẢNG CÁCH ===\n');
    
    return result;
  } catch (error) {
    console.error('❌ Lỗi khi kiểm tra khoảng cách:', error);
    console.log('=== KẾT THÚC KIỂM TRA KHOẢNG CÁCH (LỖI) ===\n');
    return {
      success: false,
      error: error.message
    };
  }
};

// Hàm lấy thông tin bưu cục
export const getPostOfficeInfo = (postOfficeId) => {
  return postOffices.find(office => office.id === postOfficeId);
};

// Hàm lấy tất cả bưu cục
export const getAllPostOffices = () => {
  return postOffices;
}; 