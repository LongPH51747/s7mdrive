# Cập nhật Logic Check-in sử dụng API

## Tổng quan
Đã cập nhật logic check-in để sử dụng API `/api/work/getWorkByShipper/{id}` thay vì lưu trữ local.

## API Endpoints

### 1. Lấy lịch sử check-in
- **Endpoint**: `GET https://389a5362809e.ngrok-free.app/api/work/getWorkByShipper/{id}`
- **Method**: GET
- **Parameter**: `id` - ID của shipper
- **Response**: Mảng các work records

### 2. Response Structure
```json
[
  {
    "id": "64cfa8b76e2b3c1a4f2f9b11",
    "idShipper": "64cf98d86e2b3c1a4f2f9a22",
    "order_success": [
      "64cfab156e2b3c1a4f2f9c33",
      "64cfab156e2b3c1a4f2f9c44"
    ],
    "createdAt": "2025-08-11T08:45:00.000Z",
    "updatedAt": "2025-08-11T09:15:00.000Z"
  }
]
```

## Các thay đổi chính

### 1. Tạo WorkService mới (`src/services/workService.js`)
- **getWorkHistoryByShipper(shipperId)**: Lấy lịch sử work từ API
- **hasCheckedInToday(shipperId)**: Kiểm tra đã check-in hôm nay chưa
- **getCheckedInDaysInMonth(shipperId, year, month)**: Lấy danh sách ngày check-in trong tháng
- **getCheckInStatistics(shipperId)**: Lấy thống kê check-in
- **createWorkRecord(shipperId)**: Tạo work record mới (tạm thời)

### 2. Cập nhật CheckInScreen (`src/screens/main/CheckInScreen.js`)
- **Import mới**: Sử dụng functions từ `workService` thay vì `checkInService`
- **Logic check-in**: Sử dụng `createWorkRecord()` thay vì `saveCheckIn()`
- **Reload dữ liệu**: Tự động reload từ API sau khi check-in thành công

### 3. Logic mới

#### Kiểm tra check-in hôm nay:
```javascript
const hasCheckedIn = await hasCheckedInToday(user.id);
```

#### Lấy danh sách ngày check-in:
```javascript
const checkedDays = await getCheckedInDaysInMonth(
  user.id, 
  selectedMonth.getFullYear(), 
  selectedMonth.getMonth()
);
```

#### Tạo check-in mới:
```javascript
const saveResult = await createWorkRecord(user.id);
```

## Quy trình hoạt động

### 1. Khởi tạo màn hình
- Gọi API `/api/work/getWorkByShipper/{id}` để lấy lịch sử
- Kiểm tra xem hôm nay đã check-in chưa
- Hiển thị lịch với các ngày đã check-in

### 2. Thực hiện check-in
- Kiểm tra khoảng cách đến bưu cục
- Tạo work record mới với `order_success: []`
- Cập nhật trạng thái UI
- Reload dữ liệu từ API

### 3. Hiển thị lịch
- Lọc work records theo tháng được chọn
- Trích xuất ngày từ `createdAt`
- Hiển thị các ngày đã check-in

## Thông tin cần bổ sung

### 1. API tạo work record
**Cần endpoint để tạo work record mới khi check-in:**
- **Endpoint**: `POST https://389a5362809e.ngrok-free.app/api/work`
- **Request body**: 
  ```json
  {
    "idShipper": "64cf98d86e2b3c1a4f2f9a22",
    "order_success": [],
    "createdAt": "2025-08-13T08:00:00.000Z",
    "updatedAt": "2025-08-13T08:00:00.000Z"
  }
  ```

### 2. Cập nhật work record
**Cần endpoint để cập nhật work record khi hoàn thành đơn hàng:**
- **Endpoint**: `PUT https://389a5362809e.ngrok-free.app/api/work/{id}`
- **Request body**: Cập nhật `order_success` array

## Lợi ích của việc cập nhật

### 1. **Dữ liệu thống nhất**
- Sử dụng cùng nguồn dữ liệu với backend
- Không cần đồng bộ dữ liệu local

### 2. **Thông tin chi tiết**
- Có thể theo dõi số đơn hàng hoàn thành mỗi ngày
- Thống kê hiệu suất làm việc

### 3. **Tích hợp tốt hơn**
- Dễ dàng tích hợp với các tính năng khác
- Quản lý trạng thái làm việc tập trung

## Cách sử dụng

1. **Đăng nhập**: Lấy ID shipper từ response
2. **Vào Check-in**: Tự động load lịch sử từ API
3. **Thực hiện check-in**: Tạo work record mới
4. **Xem lịch sử**: Hiển thị các ngày đã làm việc
5. **Thống kê**: Xem số đơn hàng hoàn thành

## Lưu ý kỹ thuật

- **Error handling**: Xử lý lỗi khi API không khả dụng
- **Loading states**: Hiển thị loading khi gọi API
- **Caching**: Có thể cache dữ liệu để tăng performance
- **Offline support**: Cần xử lý trường hợp offline
