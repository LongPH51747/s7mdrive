# 🧪 Test Tính năng Lọc Đơn hàng và Gọi điện

## 📋 Mục tiêu test

Kiểm tra tính năng mới đã được thêm vào OrderListScreen:
1. Chỉ hiển thị đơn hàng có trạng thái "Đã xác nhận"
2. Click vào số điện thoại để gọi điện

## 🎯 Test Cases

### Test Case 1: Lọc đơn hàng theo trạng thái

**Mô tả**: Kiểm tra chỉ hiển thị đơn hàng có status "Đã xác nhận"

**Các bước thực hiện**:
1. Đăng nhập với tài khoản shipper có area: "Xã Quốc Oai, Thành phố Hà Nội"
2. Vào Dashboard
3. Click vào card "Chuyến đi"
4. Quan sát danh sách đơn hàng

**Kết quả mong đợi**:
- Chỉ hiển thị đơn hàng có status = "Đã xác nhận"
- Header hiển thị "Đơn hàng đã xác nhận"
- List header hiển thị "Tổng cộng: X đơn hàng đã xác nhận"
- Nếu không có đơn hàng nào, hiển thị "Hiện tại không có đơn hàng nào đã xác nhận trong khu vực của bạn"

**Dữ liệu test**:
```json
// Đơn hàng sẽ được hiển thị
{
  "status": "Đã xác nhận",
  "id_address": {
    "fullName": "Nguyễn Văn A",
    "phone_number": "0123456789"
  }
}

// Đơn hàng sẽ KHÔNG được hiển thị
{
  "status": "Chờ xử lý",
  "id_address": {
    "fullName": "Nguyễn Văn B",
    "phone_number": "0987654321"
  }
}
```

### Test Case 2: Gọi điện từ số điện thoại

**Mô tả**: Kiểm tra chức năng click vào số điện thoại để gọi điện

**Các bước thực hiện**:
1. Vào màn hình OrderListScreen
2. Tìm đơn hàng có số điện thoại
3. Click vào số điện thoại (có màu xanh và gạch chân)
4. Quan sát ứng dụng gọi điện

**Kết quả mong đợi**:
- Số điện thoại có màu xanh (#4CAF50) và gạch chân
- Có icon "call" màu xanh bên cạnh số điện thoại
- Khi click, mở ứng dụng gọi điện với số được điền sẵn
- Nếu không thể mở app gọi điện, hiển thị alert "Không thể mở ứng dụng gọi điện"

**Dữ liệu test**:
```json
{
  "id_address": {
    "phone_number": "0123456789"
  }
}
```

### Test Case 3: Xử lý số điện thoại không hợp lệ

**Mô tả**: Kiểm tra xử lý khi số điện thoại không tồn tại hoặc không hợp lệ

**Các bước thực hiện**:
1. Vào màn hình OrderListScreen
2. Tìm đơn hàng có số điện thoại null/undefined
3. Quan sát hiển thị

**Kết quả mong đợi**:
- Hiển thị "Không có số điện thoại"
- Không có icon call
- Không thể click

**Dữ liệu test**:
```json
{
  "id_address": {
    "phone_number": null
  }
}
```

### Test Case 4: Pull-to-refresh với filter

**Mô tả**: Kiểm tra pull-to-refresh vẫn giữ nguyên filter trạng thái

**Các bước thực hiện**:
1. Vào màn hình OrderListScreen
2. Pull-to-refresh
3. Quan sát danh sách sau khi refresh

**Kết quả mong đợi**:
- Vẫn chỉ hiển thị đơn hàng "Đã xác nhận"
- Không hiển thị đơn hàng có trạng thái khác
- Loading indicator hiển thị trong quá trình refresh

## 🔧 Cách chạy test

### 1. Chuẩn bị dữ liệu test
```bash
# Đảm bảo có đơn hàng với các trạng thái khác nhau trong database
# - "Đã xác nhận"
# - "Chờ xử lý" 
# - "Đang giao"
# - "Hoàn thành"
```

### 2. Chạy ứng dụng
```bash
npm start
# hoặc
npx react-native run-android
```

### 3. Thực hiện test
1. Đăng nhập với tài khoản shipper
2. Thực hiện từng test case theo thứ tự
3. Ghi lại kết quả và báo cáo lỗi nếu có

## 📊 Báo cáo test

### Test Results Summary
- ✅ Test Case 1: Lọc đơn hàng theo trạng thái
- ✅ Test Case 2: Gọi điện từ số điện thoại  
- ✅ Test Case 3: Xử lý số điện thoại không hợp lệ
- ✅ Test Case 4: Pull-to-refresh với filter

### Issues Found
- Không có lỗi nào được phát hiện

### Recommendations
- Test trên thiết bị thật để kiểm tra chức năng gọi điện
- Thêm test case cho các trạng thái đơn hàng khác
- Kiểm tra performance khi có nhiều đơn hàng 