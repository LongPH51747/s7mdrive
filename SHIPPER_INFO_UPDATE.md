# Cập nhật Hiển thị Thông tin Shipper

## Tổng quan
Đã cập nhật ứng dụng để hiển thị đúng thông tin shipper theo response mới từ API đăng nhập.

## Cấu trúc Response mới
```json
{
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "shipper": {
        "_id": "689c942c83e08d91051c5b12",
        "user_name": "namdlh",
        "name": "Đặng Lê Hải Nam",
        "phone_number": "0123456789",
        "post_office": {
            "_id": "689c91f483e08d91051c533b",
            "name": "Hà Nội",
            "address_post_office": "Cao đẳng FPT Polytechnic, Phố Trịnh Văn Bô, Quận Nam Từ Liêm, Hà Nội",
            "latitude": 21.0380074,
            "longitude": 105.7468965
        },
        "address_shipping": "Xuân Phương, Hà Nội",
        "status": false,
        "work": [],
        "createdAt": "2025-08-13T13:33:32.321Z",
        "updatedAt": "2025-08-13T13:33:32.321Z"
    }
}
```

## Các thay đổi chính

### 1. Cập nhật AuthService (`src/services/authService.js`)
- Xử lý response mới với cấu trúc `{token, shipper}`
- Map thông tin từ `shipper` object sang user object
- Thêm các trường mới:
  - `post_office_name`: Tên bưu cục
  - `post_office_address`: Địa chỉ bưu cục
  - `post_office_latitude/longitude`: Tọa độ bưu cục
  - `address_shipping`: Khu vực giao hàng
  - `work`: Danh sách công việc đã làm

### 2. Cập nhật useAuth Hook (`src/hooks/useAuth.js`)
- Cập nhật log thông tin để hiển thị đúng các trường mới
- Loại bỏ các trường không còn tồn tại (email, vehicle, license_plate)

### 3. Cập nhật DashboardScreen (`src/screens/main/DashboardScreen.js`)
- Thêm hiển thị thông tin bưu cục và khu vực giao hàng trong header

### 4. Cập nhật ProfileScreen (`src/screens/profile/ProfileScreen.js`)
- Hiển thị thông tin bưu cục và khu vực giao hàng
- Thêm navigation đến màn hình thông tin chi tiết

### 5. Tạo màn hình mới ShipperInfoScreen (`src/screens/profile/ShipperInfoScreen.js`)
- Hiển thị đầy đủ thông tin shipper
- Chia thành các section:
  - Thông tin cơ bản
  - Thông tin bưu cục
  - Khu vực giao hàng
  - Thống kê công việc
  - Thông tin hệ thống

### 6. Cập nhật Navigation (`src/navigation/MainNavigator.js`)
- Thêm ProfileNavigator để quản lý các màn hình profile
- Thêm route đến ShipperInfoScreen

## Các trường thông tin mới

### Thông tin Bưu cục (Post Office)
- **post_office_name**: Tên bưu cục (VD: "Hà Nội")
- **post_office_address**: Địa chỉ bưu cục
- **post_office_latitude/longitude**: Tọa độ bưu cục

### Thông tin Khu vực Giao hàng
- **address_shipping**: Khu vực shipper phụ trách giao hàng (VD: "Xuân Phương, Hà Nội")

### Thông tin Công việc
- **work**: Mảng các đơn hàng đã làm
- **status**: Trạng thái hoạt động (true/false)

## Cách sử dụng

1. **Đăng nhập**: Sử dụng username và password để đăng nhập
2. **Xem thông tin**: Vào Profile > Thông tin cá nhân để xem chi tiết
3. **Thông tin hiển thị**:
   - Tên shipper
   - Bưu cục làm việc
   - Khu vực giao hàng
   - Trạng thái hoạt động
   - Số đơn hàng đã làm

## Lưu ý
- Tất cả thông tin được lưu trong AsyncStorage sau khi đăng nhập thành công
- Token được lưu để sử dụng cho các API call khác
- Thông tin được cập nhật real-time khi đăng nhập lại
