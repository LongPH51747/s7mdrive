// API Configuration
export const API_CONFIG = {
  // Thay đổi IP này theo IP máy tính của bạn
  BASE_URL: 'http://192.168.100.120:3000',
  // Cho simulator/emulator
  LOCAL_URL: 'http://localhost:3000',

  // Endpoints
  ENDPOINTS: {
    USERS: '/users',
    ORDERS: '/orders',
    STATISTICS: '/statistics',
    NOTIFICATIONS: '/notifications',
  },

  // Timeout
  TIMEOUT: 10000,
};

// Lấy URL phù hợp (cho thiết bị thật hoặc simulator)
export const getApiUrl = () => {
  // Sử dụng IP thật cho thiết bị, localhost cho simulator
  return __DEV__ ? API_CONFIG.BASE_URL : API_CONFIG.LOCAL_URL;
};

export default API_CONFIG;
