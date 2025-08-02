# 🚚 Tính năng Hiển thị Đơn hàng theo Khu vực

## 📋 Tổng quan

Tính năng này cho phép shipper xem danh sách đơn hàng trong khu vực của mình khi click vào "Chuyến đi" trên màn hình Dashboard.

## 🎯 Chức năng chính

1. **Hiển thị đơn hàng đã xác nhận theo khu vực**: Lấy danh sách đơn hàng có trạng thái "Đã xác nhận" dựa trên trường `area` của user
2. **Parse thông tin khu vực**: Tự động tách thông tin xã/phường và tỉnh/thành từ trường `area`
3. **Hiển thị thông tin cơ bản**: Tên, địa chỉ, số điện thoại và số tiền thu hộ
4. **Gọi điện trực tiếp**: Click vào số điện thoại để mở ứng dụng gọi điện với số được điền sẵn
5. **Navigation**: Chuyển đến chi tiết đơn hàng khi click vào item

## 🔧 Các file đã được cập nhật

### 1. `src/services/orderService.js`
- **Thêm method**: `getOrdersByArea(province, ward)`
- **API endpoint**: `https://92f8fa709052.ngrok-free.app/api/order/filterOrderAddressByCityAndWard`
- **Xử lý**: Sử dụng axios trực tiếp cho URL ngrok

### 2. `src/screens/orders/OrderListScreen.js`
- **Cập nhật hoàn toàn**: Chuyển từ hiển thị tất cả đơn hàng sang hiển thị đơn hàng đã xác nhận theo khu vực
- **Parse area**: Xử lý định dạng "Xã Quốc Oai, Thành phố Hà Nội"
- **Lọc trạng thái**: Chỉ hiển thị đơn hàng có status "Đã xác nhận"
- **Gọi điện**: Thêm chức năng click vào số điện thoại để gọi điện
- **UI mới**: Giao diện hiển thị thông tin đơn hàng theo yêu cầu

### 3. `src/screens/main/DashboardScreen.js`
- **Thêm TouchableOpacity**: Wrap StatCard "Chuyến đi" để có thể click
- **Navigation**: Navigate đến 'OrderList' khi click

### 4. `src/navigation/MainNavigator.js`
- **Thêm route**: OrderList vào DashboardNavigator

## 📊 Cấu trúc dữ liệu

### Input: Trường `area` của user
```json
{
  "area": "Xã Quốc Oai, Thành phố Hà Nội"
}
```

### Output: Thông tin đơn hàng
```json
{
  "_id": "68722b2d335f4448c22d390b",
  "id_address": {
    "fullName": "Nguyễn Hoàng Văn",
    "addressDetail": "Xóm 3 bala a, Xã Quốc Oai, Thành phố Hà Nội",
    "phone_number": "0973024795"
  },
  "total_amount": 1419000,
  "status": "Giao thành công",
  "createdAt": "2025-09-12T09:30:21.721Z"
}
```

## 🎨 Giao diện hiển thị

### Màn hình OrderListScreen
- **Header**: Tiêu đề "Đơn hàng đã xác nhận" và hiển thị khu vực hiện tại
- **List header**: Tổng số đơn hàng đã xác nhận
- **Order item**: 
  - Tên khách hàng và trạng thái
  - Địa chỉ giao hàng
  - Số điện thoại (có thể click để gọi điện)
  - Số tiền thu hộ
  - Ngày tạo và mã đơn hàng
- **Empty state**: Hiển thị khi không có đơn hàng đã xác nhận

## 🔄 Luồng hoạt động

1. User click vào "Chuyến đi" trên Dashboard
2. Navigate đến OrderListScreen
3. Parse trường `area` của user để lấy ward và province
4. Gọi API với tham số province và ward
5. Lọc chỉ những đơn hàng có trạng thái "Đã xác nhận"
6. Hiển thị danh sách đơn hàng đã xác nhận
7. User có thể click vào số điện thoại để gọi điện
8. User có thể click vào đơn hàng để xem chi tiết

## 🛠️ Cách sử dụng

1. **Đăng nhập**: Với tài khoản shipper có trường `area`
2. **Vào Dashboard**: Màn hình chính của ứng dụng
3. **Click "Chuyến đi"**: Card thống kê đầu tiên
4. **Xem danh sách**: Đơn hàng đã xác nhận trong khu vực của bạn
5. **Click số điện thoại**: Gọi điện trực tiếp cho khách hàng
6. **Click đơn hàng**: Xem chi tiết (nếu cần)

## ⚠️ Lưu ý

- Trường `area` phải có định dạng: "Xã/Phường/Quận/Huyện Tên, Thành phố/Tỉnh Tên"
- API ngrok có thể không ổn định, cần kiểm tra kết nối
- Chỉ hiển thị đơn hàng có trạng thái "Đã xác nhận" trong khu vực được chỉ định
- Số điện thoại có thể click để gọi điện trực tiếp
- Có thể pull-to-refresh để cập nhật danh sách

## 🐛 Xử lý lỗi

- **Không có area**: Hiển thị alert "Không tìm thấy thông tin khu vực"
- **Định dạng sai**: Hiển thị alert "Định dạng khu vực không đúng"
- **API lỗi**: Hiển thị alert "Không thể tải danh sách đơn hàng"
- **Không có đơn hàng đã xác nhận**: Hiển thị empty state với icon và thông báo
- **Lỗi gọi điện**: Hiển thị alert "Không thể mở ứng dụng gọi điện" 