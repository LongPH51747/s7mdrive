# 📊 Hướng dẫn Check-in với Database

## 🎯 Tổng quan

Tính năng check-in đã được nâng cấp để lưu trữ dữ liệu vào database, cho phép:
- Lưu lịch sử check-in/check-out
- Hiển thị lịch với màu sắc cho các ngày đã check-in
- Theo dõi thời gian làm việc

## 🗄️ Cấu trúc Database

### Bảng `users`
```json
{
  "id": "2",
  "username": "shipper1",
  "password": "123456",
  "role": "shipper",
  "name": "Nguyễn Hoàng Thuận",
  "id_post_office": "1",
  "area": "Xã Quốc Oai, Thành phố Hà Nội",
  "email": "shipper1@s7mdrive.com",
  "phone": "0987654321",
  "avatar": "https://i.pravatar.cc/300?img=2",
  "vehicle": "Honda Wave",
  "license_plate": "29A1-12345",
  "status": 0,
  "check_in": [
    {
      "id": "1704691200000",
      "date": "2025-01-08",
      "time": "09:30:15",
      "timestamp": "2025-01-08T09:30:15.123Z",
      "location": {
        "latitude": 21.0380074,
        "longitude": 105.7468965,
        "accuracy": 5,
        "timestamp": 1704691200000
      },
      "distance": 25.5,
      "post_office_id": "1",
      "check_out": {
        "time": "17:30:45",
        "timestamp": "2025-01-08T17:30:45.456Z",
        "work_duration": 28830000
      }
    }
  ]
}
```

## 🔧 Các Service Functions

### `checkInService.js`

#### 1. `saveCheckIn(userId, checkInData)`
- **Mục đích**: Lưu thông tin check-in vào database
- **Tham số**:
  - `userId`: ID của user
  - `checkInData`: Object chứa thông tin check-in
- **Trả về**: `{success: boolean, data: object, checkInRecord: object}`

#### 2. `saveCheckOut(userId, checkOutData)`
- **Mục đích**: Lưu thông tin check-out vào database
- **Tham số**:
  - `userId`: ID của user
  - `checkOutData`: Object chứa thông tin check-out
- **Trả về**: `{success: boolean, data: object}`

#### 3. `hasCheckedInToday(userId)`
- **Mục đích**: Kiểm tra user đã check-in hôm nay chưa
- **Trả về**: `boolean`

#### 4. `getCheckedInDaysInMonth(userId, year, month)`
- **Mục đích**: Lấy danh sách ngày đã check-in trong tháng
- **Trả về**: `Array<number>` (danh sách ngày)

#### 5. `getCheckInHistory(userId)`
- **Mục đích**: Lấy toàn bộ lịch sử check-in
- **Trả về**: `{success: boolean, data: Array}`

## 🎨 Hiển thị Calendar

### Màu sắc Calendar
- **Ngày hôm nay**: Cam (`#FF6B35`)
- **Ngày đã check-in**: Xanh lá (`#4CAF50`)
- **Hôm nay đã check-in**: Xanh lá đậm (`#2E7D32`)
- **Ngày bình thường**: Trắng

### Logic hiển thị
```javascript
const isToday = day === currentDay;
const isCheckedInDay = checkedInDays.includes(day);
const isTodayCheckedIn = isToday && isCheckedIn;

// Áp dụng styles
isToday && styles.today,           // Cam cho hôm nay
isCheckedInDay && styles.checkedInDay,  // Xanh lá cho ngày đã check-in
isTodayCheckedIn && styles.todayCheckedIn  // Xanh lá đậm cho hôm nay đã check-in
```

## 📱 Luồng hoạt động

### 1. Khi mở màn hình Check-in
```javascript
useEffect(() => {
  // 1. Kiểm tra trạng thái check-in hôm nay
  const hasCheckedIn = await hasCheckedInToday(user.id);
  setIsCheckedIn(hasCheckedIn);
  
  // 2. Lấy danh sách ngày đã check-in trong tháng
  const checkedDays = await getCheckedInDaysInMonth(user.id, year, month);
  setCheckedInDays(checkedDays);
}, [user?.id]);
```

### 2. Khi Check-in
```javascript
// 1. Kiểm tra khoảng cách
const locationResult = await checkDistanceToPostOffice(user.id_post_office);

// 2. Lưu vào database
const checkInData = {
  date: "2025-01-08",
  time: "09:30:15",
  timestamp: "2025-01-08T09:30:15.123Z",
  location: currentLocation,
  distance: 25.5,
  post_office_id: "1"
};

const saveResult = await saveCheckIn(user.id, checkInData);

// 3. Cập nhật UI
setIsCheckedIn(true);
setCheckedInDays([...checkedInDays, today.getDate()]);
```

### 3. Khi Check-out
```javascript
// 1. Tính thời gian làm việc
const workDuration = checkOutTime - checkInTime;

// 2. Lưu vào database
const checkOutData = {
  time: "17:30:45",
  timestamp: "2025-01-08T17:30:45.456Z",
  work_duration: workDuration
};

const saveResult = await saveCheckOut(user.id, checkOutData);

// 3. Cập nhật UI
setIsCheckedIn(false);
setCheckInTime(null);
```

## 🔍 Debug và Logging

### Console Logs
- `💾 Bắt đầu lưu check-in data...`
- `📋 Lấy lịch sử check-in cho user:`
- `🔍 Kiểm tra check-in hôm nay:`
- `📅 Lấy danh sách ngày check-in trong tháng:`
- `✅ Đã lưu check-in thành công!`

### Thông tin chi tiết
- Vị trí GPS chính xác
- Khoảng cách đến bưu cục
- Thời gian check-in/check-out
- Thời gian làm việc
- ID của record check-in

## 🚀 Tính năng mở rộng

### Có thể thêm:
1. **Thống kê làm việc**: Tổng giờ làm việc trong tuần/tháng
2. **Báo cáo**: Export dữ liệu check-in
3. **Đồng bộ**: Sync với server chính
4. **Offline**: Lưu cache khi không có mạng
5. **Notification**: Nhắc nhở check-in/check-out

## ⚠️ Lưu ý quan trọng

1. **Dữ liệu nhạy cảm**: Vị trí GPS được lưu trữ
2. **Backup**: Cần backup dữ liệu thường xuyên
3. **Privacy**: Tuân thủ quy định bảo mật
4. **Performance**: Tối ưu query cho dữ liệu lớn
5. **Validation**: Kiểm tra dữ liệu đầu vào

## 📊 Ví dụ dữ liệu

### Check-in record hoàn chỉnh
```json
{
  "id": "1704691200000",
  "date": "2025-01-08",
  "time": "09:30:15",
  "timestamp": "2025-01-08T09:30:15.123Z",
  "location": {
    "latitude": 21.0380074,
    "longitude": 105.7468965,
    "accuracy": 5,
    "timestamp": 1704691200000
  },
  "distance": 25.5,
  "post_office_id": "1",
  "check_out": {
    "time": "17:30:45",
    "timestamp": "2025-01-08T17:30:45.456Z",
    "work_duration": 28830000
  }
}
```

### Thống kê làm việc
- **Ngày**: 2025-01-08
- **Check-in**: 09:30:15
- **Check-out**: 17:30:45
- **Thời gian làm việc**: 8 giờ 0 phút
- **Khoảng cách**: 25.5m
- **Địa điểm**: Cao đẳng FPT Polytechnic 