# Hướng dẫn sử dụng tính năng Check-in với kiểm tra vị trí

## 📍 Tính năng mới

Ứng dụng S7M Drive đã được cập nhật với tính năng **Check-in thông minh** sử dụng GPS để đảm bảo người dùng chỉ có thể check-in khi ở gần bưu cục.

## 🔧 Cài đặt và cấu hình

### 1. Thư viện đã cài đặt
```bash
npm install react-native-geolocation-service
```

### 2. Quyền truy cập vị trí

#### Android (android/app/src/main/AndroidManifest.xml)
```xml
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
```

#### iOS (ios/s7mdrive/Info.plist)
```xml
<key>NSLocationWhenInUseUsageDescription</key>
<string>Ứng dụng cần quyền truy cập vị trí để check-in tại bưu cục</string>
```

## 🚀 Cách hoạt động

### 1. Quy trình Check-in
1. **Xin quyền truy cập vị trí** - Ứng dụng sẽ yêu cầu quyền truy cập GPS
2. **Lấy vị trí hiện tại** - Sử dụng GPS để xác định vị trí người dùng
3. **Tính khoảng cách** - So sánh với vị trí bưu cục được chỉ định
4. **Kiểm tra điều kiện** - Chỉ cho phép check-in nếu trong phạm vi 100m

### 2. Công thức tính khoảng cách
Sử dụng **Haversine formula** để tính khoảng cách chính xác giữa 2 điểm trên trái đất:

```javascript
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Bán kính trái đất (km)
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c; // Khoảng cách tính bằng km
  return distance * 1000; // Chuyển về mét
};
```

## 📊 Dữ liệu bưu cục

### Cấu trúc dữ liệu
```javascript
const postOffices = [
  {
    id: "1",
    province: "Hà Nội",
    address: "Cao đẳng FPT Polytechnic, Phố Trịnh Văn Bô, Quận Nam Từ Liêm, Hà Nội",
    latitude: 21.0380074,
    longitude: 105.7468965
  }
];
```

### Thêm bưu cục mới
Để thêm bưu cục mới, cập nhật file `src/services/locationService.js`:

```javascript
const postOffices = [
  // Bưu cục hiện tại
  {
    id: "1",
    province: "Hà Nội",
    address: "Cao đẳng FPT Polytechnic, Phố Trịnh Văn Bô, Quận Nam Từ Liêm, Hà Nội",
    latitude: 21.0380074,
    longitude: 105.7468965
  },
  // Bưu cục mới
  {
    id: "2",
    province: "Hà Nội",
    address: "Địa chỉ bưu cục mới",
    latitude: 21.0000000,
    longitude: 105.0000000
  }
];
```

## 🛠️ API và Service

### LocationService API

#### `checkDistanceToPostOffice(userId)`
Kiểm tra khoảng cách từ vị trí hiện tại đến bưu cục của user.

**Tham số:**
- `userId` (string): ID của bưu cục

**Trả về:**
```javascript
{
  success: boolean,
  distance: number, // Khoảng cách tính bằng mét
  currentLocation: {
    latitude: number,
    longitude: number
  },
  postOffice: {
    id: string,
    address: string,
    latitude: number,
    longitude: number
  },
  isWithinRange: boolean // true nếu trong phạm vi 100m
}
```

#### `getPostOfficeInfo(postOfficeId)`
Lấy thông tin bưu cục theo ID.

#### `getAllPostOffices()`
Lấy danh sách tất cả bưu cục.

## 📱 Giao diện người dùng

### Thông báo lỗi
- **Không có quyền truy cập vị trí**: Hướng dẫn user cấp quyền
- **Khoảng cách quá xa**: Hiển thị khoảng cách hiện tại và yêu cầu đến gần hơn
- **Không tìm thấy bưu cục**: Thông báo lỗi cấu hình

### Thông báo thành công
- Hiển thị địa chỉ bưu cục đã check-in
- Thông báo chúc mừng

## 🔍 Debug và Testing

### Console Logs
```javascript
console.log('Vị trí hiện tại:', currentLocation);
console.log('Khoảng cách đến bưu cục:', distance.toFixed(2), 'mét');
```

### Testing
1. **Test trong phạm vi 100m**: Check-in thành công
2. **Test ngoài phạm vi 100m**: Hiển thị thông báo khoảng cách
3. **Test không có GPS**: Hiển thị lỗi vị trí
4. **Test từ chối quyền**: Hiển thị hướng dẫn cấp quyền

## ⚙️ Cấu hình nâng cao

### Thay đổi phạm vi cho phép
```javascript
// Trong locationService.js
const ALLOWED_DISTANCE = 100; // Thay đổi từ 100m thành giá trị khác

// Trong checkDistanceToPostOffice function
isWithinRange: distance <= ALLOWED_DISTANCE
```

### Thêm nhiều bưu cục cho một user
```javascript
// Có thể mở rộng để user có thể check-in tại nhiều bưu cục
const userPostOffices = postOffices.filter(office => 
  user.allowedPostOffices.includes(office.id)
);
```

## 🚨 Lưu ý quan trọng

1. **Độ chính xác GPS**: Có thể có sai số 5-10m tùy thuộc vào thiết bị
2. **Thời gian timeout**: 15 giây để lấy vị trí
3. **Bảo mật**: Chỉ lấy vị trí khi cần thiết, không lưu trữ vĩnh viễn
4. **Pin**: Sử dụng GPS có thể tiêu tốn pin, chỉ bật khi check-in

## 📞 Hỗ trợ

Nếu gặp vấn đề với tính năng check-in:
1. Kiểm tra quyền truy cập vị trí
2. Đảm bảo GPS được bật
3. Thử lại trong khu vực có tín hiệu GPS tốt
4. Liên hệ support nếu vấn đề vẫn tiếp tục 