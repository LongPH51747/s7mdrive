// API Configuration
export const API_CONFIG = {
  // Thay đổi IP này theo IP máy tính của bạn
  BASE_URL: 'http://192.168.110.35:3000',
  // Cho simulator/emulator
  LOCAL_URL: 'http://localhost:3000',
  // URL cho API bên ngoài
  BASE_URL_EXTERNAL: 'https://6bb16771d823.ngrok-free.app',

  // Endpoints
  ENDPOINTS: {
    USERS: '/users',
    ORDERS: '/orders',
    STATISTICS: '/statistics',
    NOTIFICATIONS: '/notifications',
    
    // Order service endpoints
    ORDER_FILTER_BY_AREA: '/api/order/filterOrderAddressByCityAndWard',
    ORDER_UPDATE_STATUS: '/api/order/updateStatus',
  },

  // Timeout
  TIMEOUT: 10000,
};

// Lấy URL phù hợp (cho thiết bị thật hoặc simulator)
export const getApiUrl = () => {
  // Sử dụng IP thật cho thiết bị, localhost cho simulator
  return __DEV__ ? API_CONFIG.BASE_URL : API_CONFIG.LOCAL_URL;
};

// Lấy URL cho API bên ngoài
export const getExternalApiUrl = () => {
  return API_CONFIG.BASE_URL_EXTERNAL;
};

export default API_CONFIG;
