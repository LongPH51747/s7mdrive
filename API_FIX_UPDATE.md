# Sửa Lỗi API Calls - Chuyển từ Local sang External

## Tổng quan
Đã sửa lỗi API calls từ local server sang external API để tránh lỗi "Network Error".

## Vấn đề ban đầu
```
LOG  🚀 Local API Request: GET /statistics
ERROR ❌ Local Response Error: undefined Network Error
ERROR Get statistics error: [AxiosError: Network Error]
```

## Nguyên nhân
- Đang sử dụng `apiClient` (local) thay vì `externalApiClient` (external)
- Local server không chạy hoặc không có endpoint tương ứng
- Cần sử dụng external API với URL: `https://389a5362809e.ngrok-free.app`

## Các thay đổi chính

### 1. Cập nhật StatisticsService (`src/services/statisticsService.js`)

#### Import thay đổi:
```javascript
// Trước
import apiClient from './apiClient';

// Sau
import {externalApiClient} from './apiClient';
```

#### Tất cả API calls:
```javascript
// Trước
const response = await apiClient.get(API_CONFIG.ENDPOINTS.STATISTICS);

// Sau
const response = await externalApiClient.get(API_CONFIG.ENDPOINTS.STATISTICS);
```

#### Cập nhật calculateStatisticsFromOrders:
```javascript
// Thêm parameters province và ward
async calculateStatisticsFromOrders(province = 'Hà Nội', ward = 'Xuân Phương') {
  // Sử dụng endpoint đúng với parameters
  const url = `${API_CONFIG.ENDPOINTS.ORDER_FILTER_BY_AREA}?province=${encodeURIComponent(province)}&ward=${encodeURIComponent(ward)}`;
  const ordersResponse = await externalApiClient.get(url);
}
```

### 2. Cập nhật DashboardScreen (`src/screens/main/DashboardScreen.js`)

#### Truyền thông tin khu vực:
```javascript
// Lấy thông tin khu vực từ user
const province = user?.post_office_name || 'Hà Nội';
const ward = user?.address_shipping?.split(',')[0] || 'Xuân Phương';

const calculatedStats = await statisticsService.calculateStatisticsFromOrders(province, ward);
```

### 3. Endpoints được sử dụng

#### Statistics API:
- **URL**: `https://389a5362809e.ngrok-free.app/statistics`
- **Method**: GET
- **Purpose**: Lấy thống kê tổng quan

#### Orders Filter API:
- **URL**: `https://389a5362809e.ngrok-free.app/api/order/filterOrderAddressByCityAndWard?province=Hà Nội&ward=Xuân Phương`
- **Method**: GET
- **Parameters**: 
  - `province`: Tỉnh/Thành phố
  - `ward`: Quận/Huyện/Xã
- **Purpose**: Lấy đơn hàng theo khu vực

## Các API calls đã sửa

### 1. StatisticsService
- ✅ `getStatistics()` - Lấy thống kê tổng quan
- ✅ `getCustomStatistics()` - Lấy thống kê tùy chỉnh
- ✅ `getShipperPerformance()` - Lấy hiệu suất shipper
- ✅ `getRevenueReport()` - Lấy báo cáo doanh thu
- ✅ `calculateStatisticsFromOrders()` - Tính toán từ đơn hàng
- ✅ `updateStatistics()` - Cập nhật thống kê

### 2. OrderService (đã đúng)
- ✅ `getOrdersByArea()` - Đã sử dụng external API
- ✅ `updateOrderStatusToDelivered()` - Đã sử dụng external API

### 3. WorkService (đã đúng)
- ✅ `getWorkHistoryByShipper()` - Đã sử dụng external API

## URL Examples

### Statistics:
```
GET https://389a5362809e.ngrok-free.app/statistics
```

### Orders by Area:
```
GET https://389a5362809e.ngrok-free.app/api/order/filterOrderAddressByCityAndWard?province=Hà Nội&ward=Xuân Phương
```

### Work History:
```
GET https://389a5362809e.ngrok-free.app/api/work/getWorkByShipper/689c942c83e08d91051c5b12
```

## Lợi ích của việc sửa

### 1. **Không còn lỗi Network Error**
- Sử dụng external API thay vì local server
- API endpoints thực tế và hoạt động

### 2. **Dữ liệu thực tế**
- Lấy dữ liệu từ server thực tế
- Không phụ thuộc vào local database

### 3. **Tính nhất quán**
- Tất cả services sử dụng cùng external API
- Tránh xung đột giữa local và external data

### 4. **Performance tốt hơn**
- Không cần chạy local server
- Giảm overhead của local development

## Cách kiểm tra

### 1. Log messages đúng:
```
🚀 External API Request: GET /statistics
✅ External API Response: 200 /statistics
```

### 2. Không còn lỗi:
```
❌ Local Response Error: undefined Network Error
```

### 3. Dữ liệu hiển thị:
- Statistics hiển thị đúng
- Orders list load thành công
- Work history load thành công

## Lưu ý kỹ thuật

- **URL Encoding**: Sử dụng `encodeURIComponent()` cho parameters
- **Error Handling**: Xử lý lỗi khi external API không khả dụng
- **Fallback**: Có fallback logic khi API không trả về data
- **Timeout**: Sử dụng timeout phù hợp cho external API calls
