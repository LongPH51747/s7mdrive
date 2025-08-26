// API Configuration
export const API_CONFIG = {
  // Thay đổi IP này theo IP máy tính của bạn
  BASE_URL: 'http://10.0.2.2:3000',
  // Cho simulator/emulator
  LOCAL_URL: 'http://localhost:3000',
  // URL cho API bên ngoài
  BASE_URL_EXTERNAL: 'https://edf052525cbf.ngrok-free.app',

  // Endpoints
  ENDPOINTS: {

    // Order service endpoints
    ORDER_FILTER_BY_AREA: '/api/order/filterOrderAddressByCityAndWard',
    ORDER_UPDATE_STATUS: '/api/order/updateStatus',
    ORDER_RECEIVE_ALL: '/api/order/receiveOrder',
    ORDER_BY_SHIPPER: (id) => `/api/order/getOrderByShipper/${id}`,

    
    // Auth endpoints
    SHIPPER_LOGIN: '/api/shipper/login',
    
    // Work endpoints
    WORK_BY_SHIPPER: '/api/work/getWorkByShipper',
    WORK_CREATE: '/api/work',
    WORK_CHECKIN: '/api/work/checkin',
    WORK_ORDER_SUCCESS: '/api/work/order-success',
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
