import axios from 'axios';
import {getApiUrl, getExternalApiUrl, API_CONFIG} from '../constants/api';

// Tạo Axios instance cho JSON server (local)
const apiClient = axios.create({
  baseURL: getApiUrl(),
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Tạo Axios instance cho API external
const externalApiClient = axios.create({
  baseURL: getExternalApiUrl(),
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor cho local API
apiClient.interceptors.request.use(
  config => {
    const fullUrl = `${config.baseURL}${config.url}`;
    console.log(
      `🚀 Local API Request: ${config.method?.toUpperCase()} ${fullUrl}`,
    );
    return config;
  },
  error => {
    console.error('❌ Local Request Error:', error);
    return Promise.reject(error);
  },
);

// Response interceptor cho local API
apiClient.interceptors.response.use(
  response => {
    const fullUrl = `${response.config.baseURL}${response.config.url}`;
    console.log(`✅ Local API Response: ${response.status} ${fullUrl}`);
    return response;
  },
  error => {
    const fullUrl = `${error.config?.baseURL}${error.config?.url}`;
    console.error(`❌ Local Response Error: ${error.response?.status} ${fullUrl} - ${error.message}`);

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

// Request interceptor cho external API
externalApiClient.interceptors.request.use(
  config => {
    const fullUrl = `${config.baseURL}${config.url}`;
    console.log(
      `🚀 External API Request: ${config.method?.toUpperCase()} ${fullUrl}`,
    );
    return config;
  },
  error => {
    console.error('❌ External Request Error:', error);
    return Promise.reject(error);
  },
);

// Response interceptor cho external API
externalApiClient.interceptors.response.use(
  response => {
    const fullUrl = `${response.config.baseURL}${response.config.url}`;
    console.log(`✅ External API Response: ${response.status} ${fullUrl}`);
    return response;
  },
  error => {
    const fullUrl = `${error.config?.baseURL}${error.config?.url}`;
    console.error(`❌ External Response Error: ${error.response?.status} ${fullUrl} - ${error.message}`);

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

export {externalApiClient};
export default apiClient;
