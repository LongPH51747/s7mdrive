/**
 * Helper functions for the app
 */

// Format currency to Vietnamese dong
export const formatCurrency = amount => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
};

// Format date to Vietnamese format
export const formatDate = (dateString, options) => {
  const date = new Date(dateString);
  const defaultOptions = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  };

  return date.toLocaleString('vi-VN', options || defaultOptions);
};

// Format relative time (e.g., "2 hours ago")
export const formatRelativeTime = dateString => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'Vừa xong';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} phút trước`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} giờ trước`;
  } else {
    const days = Math.floor(diffInSeconds / 86400);
    if (days === 1) return 'Hôm qua';
    if (days < 7) return `${days} ngày trước`;
    return formatDate(dateString, {day: '2-digit', month: '2-digit'});
  }
};

// Get status color
export const getStatusColor = status => {
  const statusColors = {
    pending: '#FF9800',
    confirmed: '#2196F3',
    delivering: '#FF5722',
    completed: '#4CAF50',
    cancelled: '#F44336',
  };
  return statusColors[status] || '#999';
};

// Get status text in Vietnamese
export const getStatusText = status => {
  const statusTexts = {
    pending: 'Chờ xử lý',
    confirmed: 'Đã xác nhận',
    delivering: 'Đang giao',
    completed: 'Hoàn thành',
    cancelled: 'Đã hủy',
  };
  return statusTexts[status] || status;
};

// Generate unique order code
export const generateOrderCode = (prefix = 'S7M') => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, '0');
  return `${prefix}${timestamp}${random}`;
};

// Calculate distance between two coordinates (Haversine formula)
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Convert degrees to radians
const toRadians = degrees => {
  return degrees * (Math.PI / 180);
};

// Calculate estimated delivery time based on distance
export const calculateEstimatedTime = distanceKm => {
  // Assuming average speed of 25 km/h in city
  const avgSpeedKmh = 25;
  const timeInHours = distanceKm / avgSpeedKmh;
  const timeInMinutes = Math.ceil(timeInHours * 60);

  // Minimum 15 minutes, maximum 120 minutes
  return Math.max(15, Math.min(120, timeInMinutes));
};

// Calculate shipping fee based on distance and order value
export const calculateShippingFee = (distanceKm, orderValue) => {
  const baseFee = 20000; // Base fee 20k VND
  const distanceFee = Math.ceil(distanceKm) * 3000; // 3k per km
  const valueFee = orderValue > 1000000 ? orderValue * 0.001 : 0; // 0.1% for high-value orders

  const totalFee = baseFee + distanceFee + valueFee;

  // Round to nearest 1000
  return Math.round(totalFee / 1000) * 1000;
};

// Validate phone number (Vietnamese format)
export const validatePhoneNumber = phone => {
  const phoneRegex = /^(0|\+84)[3|5|7|8|9][0-9]{8}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

// Format phone number
export const formatPhoneNumber = phone => {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return cleaned.replace(/(\d{4})(\d{3})(\d{3})/, '$1 $2 $3');
  }
  return phone;
};

// Truncate text with ellipsis
export const truncateText = (text, maxLength) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
};

// Deep clone object
export const deepClone = obj => {
  return JSON.parse(JSON.stringify(obj));
};

// Debounce function
export const debounce = (func, wait) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
};

// Check if string is valid email
export const isValidEmail = email => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Get greeting based on time
export const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Chào buổi sáng';
  if (hour < 18) return 'Chào buổi chiều';
  return 'Chào buổi tối';
};

// Convert file size to human readable format
export const formatFileSize = bytes => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export default {
  formatCurrency,
  formatDate,
  formatRelativeTime,
  getStatusColor,
  getStatusText,
  generateOrderCode,
  calculateDistance,
  calculateEstimatedTime,
  calculateShippingFee,
  validatePhoneNumber,
  formatPhoneNumber,
  truncateText,
  deepClone,
  debounce,
  isValidEmail,
  getGreeting,
  formatFileSize,
};
