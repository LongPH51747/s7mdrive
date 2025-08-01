# Hướng dẫn sử dụng tính năng lưu trữ thông tin User

## Tổng quan

Tính năng này cho phép lưu trữ toàn bộ thông tin người dùng vào AsyncStorage sau khi đăng nhập thành công, bao gồm cả password và các thông tin bảo mật khác.

## Cấu trúc dữ liệu User được lưu

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
  "loginTime": "2024-01-15T10:30:00.000Z",
  "savedAt": "2024-01-15T10:30:00.000Z"
}
```

## Các file đã được cập nhật

### 1. `src/services/authService.js`
- **Thay đổi**: Trả về toàn bộ thông tin user bao gồm cả password
- **Trước**: Loại bỏ password khỏi response
- **Sau**: Trả về đầy đủ thông tin user

### 2. `src/hooks/useAuth.js`
- **Thay đổi**: Sử dụng utility functions để quản lý AsyncStorage
- **Tính năng mới**: Thêm thời gian đăng nhập vào user data

### 3. `src/utils/userStorage.js` (Mới)
- **Chức năng**:
  - `saveUserData()`: Lưu thông tin user
  - `getUserData()`: Đọc thông tin user
  - `removeUserData()`: Xóa thông tin user
  - `hasUserData()`: Kiểm tra có user data không
  - `updateUserData()`: Cập nhật thông tin user

### 4. `src/screens/auth/LoginScreen.js`
- **Tính năng mới**: Nút kiểm tra thông tin user đã lưu
- **Hiển thị**: Alert với thông tin cơ bản và tùy chọn xem chi tiết

### 5. `src/components/UserInfoDisplay.js` (Mới)
- **Chức năng**: Component hiển thị đầy đủ thông tin user đã lưu
- **Tính năng**: Xóa thông tin user, refresh data

## Cách sử dụng

### 1. Đăng nhập và lưu thông tin
```javascript
const { login } = useAuth();
const success = await login('shipper1', '123456');
// Thông tin user sẽ tự động được lưu vào AsyncStorage
```

### 2. Truy cập thông tin user đã lưu
```javascript
import { getUserData } from '../utils/userStorage';

const userData = await getUserData();
if (userData) {
  console.log('User name:', userData.name);
  console.log('User role:', userData.role);
  console.log('Login time:', userData.loginTime);
}
```

### 3. Sử dụng trong component
```javascript
import { useAuth } from '../hooks/useAuth';

const MyComponent = () => {
  const { user } = useAuth();
  
  if (user) {
    return (
      <Text>Xin chào {user.name}</Text>
    );
  }
  
  return <Text>Chưa đăng nhập</Text>;
};
```

### 4. Cập nhật thông tin user
```javascript
import { updateUserData } from '../utils/userStorage';

await updateUserData({
  status: 1,
  current_location: {
    latitude: 10.762622,
    longitude: 106.660172,
    address: "Quận 1, TP.HCM"
  }
});
```

### 5. Xóa thông tin user
```javascript
import { removeUserData } from '../utils/userStorage';

await removeUserData();
// Hoặc sử dụng logout từ useAuth
const { logout } = useAuth();
await logout();
```

## Tính năng bảo mật

### 1. Mã hóa password (Tùy chọn)
```javascript
// Có thể thêm mã hóa password trước khi lưu
import CryptoJS from 'crypto-js';

const encryptedPassword = CryptoJS.AES.encrypt(
  userData.password, 
  'secret-key'
).toString();
```

### 2. Kiểm tra thời gian hết hạn
```javascript
const checkTokenExpiry = (loginTime) => {
  const now = new Date();
  const loginDate = new Date(loginTime);
  const hoursDiff = (now - loginDate) / (1000 * 60 * 60);
  
  // Tự động logout sau 24 giờ
  if (hoursDiff > 24) {
    removeUserData();
    return false;
  }
  return true;
};
```

## Lưu ý quan trọng

1. **Bảo mật**: Password được lưu dưới dạng plain text, nên cân nhắc mã hóa
2. **Dung lượng**: AsyncStorage có giới hạn dung lượng, không nên lưu quá nhiều dữ liệu
3. **Đồng bộ**: Luôn sử dụng async/await khi thao tác với AsyncStorage
4. **Error handling**: Luôn wrap trong try-catch để xử lý lỗi
5. **Performance**: Không nên gọi AsyncStorage quá thường xuyên

## Testing

### 1. Test đăng nhập
1. Mở app và đăng nhập với tài khoản demo
2. Nhấn nút "Kiểm tra thông tin user đã lưu"
3. Xác nhận thông tin hiển thị đúng

### 2. Test persistence
1. Đăng nhập thành công
2. Đóng app và mở lại
3. Kiểm tra xem thông tin user có được khôi phục không

### 3. Test logout
1. Đăng nhập thành công
2. Thực hiện logout
3. Kiểm tra xem thông tin user có bị xóa không

## Troubleshooting

### Lỗi thường gặp

1. **"AsyncStorage is not available"**
   - Kiểm tra đã cài đặt `@react-native-async-storage/async-storage`
   - Link thư viện với native code

2. **"JSON parse error"**
   - Kiểm tra dữ liệu trong AsyncStorage có đúng format JSON không
   - Xóa dữ liệu cũ và thử lại

3. **"User data not found"**
   - Kiểm tra key 'userData' có đúng không
   - Xác nhận đã đăng nhập thành công

### Debug

```javascript
// Kiểm tra tất cả keys trong AsyncStorage
import AsyncStorage from '@react-native-async-storage/async-storage';

const getAllKeys = async () => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    console.log('All keys:', keys);
    
    for (const key of keys) {
      const value = await AsyncStorage.getItem(key);
      console.log(`${key}:`, value);
    }
  } catch (error) {
    console.error('Error getting all keys:', error);
  }
};
``` 