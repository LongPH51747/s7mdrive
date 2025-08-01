import axios from 'axios';
import {getApiUrl, API_CONFIG} from '../constants/api';

// Tạo Axios instance
const apiClient = axios.create({
  baseURL: getApiUrl(),
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  config => {
    console.log(
      `🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`,
    );
    return config;
  },
  error => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  },
);

// Response interceptor
apiClient.interceptors.response.use(
  response => {
    console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  error => {
    console.error('❌ Response Error:', error.response?.status, error.message);

    // Xử lý các lỗi phổ biến
    if (error.code === 'NETWORK_ERROR') {
      console.error(
        '🔴 Network Error: Kiểm tra kết nối mạng và địa chỉ server',
      );
    }

    if (error.code === 'ECONNREFUSED') {
      console.error(
        '🔴 Connection Refused: Server không chạy hoặc sai địa chỉ',
      );
    }

    return Promise.reject(error);
  },
);

export default apiClient;
