# Cập nhật Logging API Calls - Hiển thị URL đầy đủ

## Tổng quan
Đã cập nhật logging để hiển thị URL đầy đủ thay vì chỉ path, giúp debug dễ dàng hơn.

## Vấn đề ban đầu
```
LOG  🚀 External API Request: GET /statistics
ERROR ❌ External Response Error: 404 Request failed with status code 404
```

**Vấn đề**: Chỉ hiển thị path `/statistics`, không biết URL đầy đủ là gì.

## Các thay đổi chính

### 1. Cập nhật apiClient.js (`src/services/apiClient.js`)

#### Request Interceptors:
```javascript
// Trước
console.log(`🚀 External API Request: ${config.method?.toUpperCase()} ${config.url}`);

// Sau
const fullUrl = `${config.baseURL}${config.url}`;
console.log(`🚀 External API Request: ${config.method?.toUpperCase()} ${fullUrl}`);
```

#### Response Interceptors:
```javascript
// Trước
console.log(`✅ External API Response: ${response.status} ${response.config.url}`);

// Sau
const fullUrl = `${response.config.baseURL}${response.config.url}`;
console.log(`✅ External API Response: ${response.status} ${fullUrl}`);
```

#### Error Interceptors:
```javascript
// Trước
console.error('❌ External Response Error:', error.response?.status, error.message);

// Sau
const fullUrl = `${error.config?.baseURL}${error.config?.url}`;
console.error(`❌ External Response Error: ${error.response?.status} ${fullUrl} - ${error.message}`);
```

## Log Examples

### 1. Request Logs:
```
🚀 External API Request: GET https://389a5362809e.ngrok-free.app/statistics
🚀 External API Request: GET https://389a5362809e.ngrok-free.app/api/order/filterOrderAddressByCityAndWard?province=H%C3%A0%20N%E1%BB%99i&ward=Xu%C3%A2n%20Ph%C6%B0%C6%A1ng
🚀 External API Request: GET https://389a5362809e.ngrok-free.app/api/work/getWorkByShipper/689c942c83e08d91051c5b12
```

### 2. Response Logs:
```
✅ External API Response: 200 https://389a5362809e.ngrok-free.app/statistics
✅ External API Response: 200 https://389a5362809e.ngrok-free.app/api/order/filterOrderAddressByCityAndWard?province=H%C3%A0%20N%E1%BB%99i&ward=Xu%C3%A2n%20Ph%C6%B0%C6%A1ng
✅ External API Response: 200 https://389a5362809e.ngrok-free.app/api/work/getWorkByShipper/689c942c83e08d91051c5b12
```

### 3. Error Logs:
```
❌ External Response Error: 404 https://389a5362809e.ngrok-free.app/statistics - Request failed with status code 404
❌ External Response Error: 500 https://389a5362809e.ngrok-free.app/api/work/getWorkByShipper/123 - Internal Server Error
```

## Các API Endpoints được log

### 1. Statistics API:
- **URL**: `https://389a5362809e.ngrok-free.app/statistics`
- **Method**: GET
- **Status**: 404 (Endpoint không tồn tại)

### 2. Orders Filter API:
- **URL**: `https://389a5362809e.ngrok-free.app/api/order/filterOrderAddressByCityAndWard?province=Hà Nội&ward=Xuân Phương`
- **Method**: GET
- **Status**: 200 (Thành công)

### 3. Work History API:
- **URL**: `https://389a5362809e.ngrok-free.app/api/work/getWorkByShipper/{id}`
- **Method**: GET
- **Status**: 200 (Thành công)

## Lợi ích của việc cập nhật

### 1. **Debug dễ dàng hơn**
- Biết chính xác URL đang gọi
- Có thể test trực tiếp trên browser/Postman
- Dễ dàng xác định endpoint nào có vấn đề

### 2. **Troubleshooting nhanh hơn**
- Copy URL trực tiếp từ log
- Không cần đoán base URL
- Xác định nhanh lỗi 404, 500, etc.

### 3. **Documentation tự động**
- Log tạo ra documentation về API calls
- Dễ dàng track các endpoints đang sử dụng
- Có thể dùng để tạo API documentation

### 4. **Monitoring tốt hơn**
- Theo dõi được tất cả API calls
- Phát hiện endpoints không tồn tại
- Track performance của từng endpoint

## Cách sử dụng logs

### 1. **Copy URL để test**:
```
🚀 External API Request: GET https://389a5362809e.ngrok-free.app/statistics
```
→ Copy `https://389a5362809e.ngrok-free.app/statistics` để test trên browser

### 2. **Xác định lỗi endpoint**:
```
❌ External Response Error: 404 https://389a5362809e.ngrok-free.app/statistics
```
→ Endpoint `/statistics` không tồn tại, cần kiểm tra lại

### 3. **Verify parameters**:
```
🚀 External API Request: GET https://389a5362809e.ngrok-free.app/api/order/filterOrderAddressByCityAndWard?province=H%C3%A0%20N%E1%BB%99i&ward=Xu%C3%A2n%20Ph%C6%B0%C6%A1ng
```
→ Parameters được encode đúng, URL đầy đủ

## Lưu ý kỹ thuật

- **URL Encoding**: Parameters được encode tự động
- **Base URL**: Lấy từ `getExternalApiUrl()` trong constants
- **Error Handling**: Log cả URL khi có lỗi
- **Performance**: Không ảnh hưởng performance vì chỉ log khi cần

## Troubleshooting với logs mới

### 1. **404 Error**:
```
❌ External Response Error: 404 https://389a5362809e.ngrok-free.app/statistics
```
→ Endpoint không tồn tại, cần kiểm tra API documentation

### 2. **500 Error**:
```
❌ External Response Error: 500 https://389a5362809e.ngrok-free.app/api/work/getWorkByShipper/123
```
→ Server error, cần kiểm tra backend logs

### 3. **Network Error**:
```
❌ External Response Error: undefined https://389a5362809e.ngrok-free.app/api/order/filterOrderAddressByCityAndWard
```
→ Network issue, kiểm tra kết nối internet
