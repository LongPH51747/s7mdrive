# 🚚 S7M Drive - App Giao Hàng Cho Cửa Hàng

## 📱 Tổng Quan

S7M Drive là ứng dụng giao hàng được thiết kế riêng cho cửa hàng của bạn, với giao diện tương tự GHN (Giao Hàng Nhanh) và các tính năng đặc biệt dành cho việc quản lý đơn hàng và shipper.

## 🎯 Tính Năng Chính

### ✅ **Đã Hoàn Thành:**
- 🔐 **Đăng nhập/Đăng xuất** với 2 vai trò: Admin và Shipper
- 🏠 **Dashboard** hiển thị thống kê đơn hàng theo thời gian thực
- 📦 **Quản lý đơn hàng** với các trạng thái khác nhau
- 👤 **Quản lý profile** cá nhân
- 🗂️ **Cấu trúc dự án** hoàn chỉnh và có tổ chức
- 🎨 **UI/UX** giống GHN với màu sắc và thiết kế chuyên nghiệp

### 🔄 **Đang Phát Triển:**
- 🗺️ **Bản đồ theo dõi** vị trí shipper real-time
- 📊 **Báo cáo chi tiết** và lịch sử giao dịch
- 🔔 **Thông báo đẩy** cho đơn hàng mới
- 💬 **Chat** giữa admin và shipper

## 🏗️ Cấu Trúc Project

```
s7mdrive/
├── src/
│   ├── screens/           # Màn hình chính
│   │   ├── auth/         # Đăng nhập, đăng ký
│   │   ├── main/         # Dashboard
│   │   ├── orders/       # Quản lý đơn hàng
│   │   ├── map/          # Bản đồ theo dõi
│   │   ├── history/      # Lịch sử giao dịch
│   │   └── profile/      # Hồ sơ cá nhân
│   ├── components/       # Component tái sử dụng
│   ├── navigation/       # Điều hướng ứng dụng
│   ├── services/         # API services
│   ├── hooks/           # React hooks tùy chỉnh
│   ├── utils/           # Utilities và helpers
│   ├── constants/       # Hằng số
│   ├── assets/          # Hình ảnh, icon
│   └── data/           # Dữ liệu tĩnh
├── db.json             # Database mẫu JSON Server
├── start-server.js     # Script khởi chạy server
└── README_DELIVERY_APP.md
```

## 🚀 Cài Đặt và Chạy

### 1. **Cài đặt dependencies:**
```bash
npm install
```

### 2. **Khởi chạy JSON Server (Terminal 1):**
```bash
npm run server
```
Hoặc:
```bash
node start-server.js
```

### 3. **Khởi chạy React Native (Terminal 2):**
```bash
npm start
```

### 4. **Chạy trên Android:**
```bash
npm run android
```

### 5. **Chạy trên iOS:**
```bash
npm run ios
```

### 6. **Chạy đồng thời (Khuyến nghị):**
```bash
npm run dev
```

## 🔑 Tài Khoản Demo

| Vai trò | Username | Password | Mô tả |
|---------|----------|----------|-------|
| **Admin** | `admin` | `123456` | Quản trị viên - Toàn quyền |
| **Shipper 1** | `shipper1` | `123456` | Nhân viên giao hàng |
| **Shipper 2** | `shipper2` | `123456` | Nhân viên giao hàng |

## 📊 API Endpoints

JSON Server chạy tại `http://localhost:3000` với các endpoints:

- `GET /users` - Danh sách người dùng
- `GET /orders` - Danh sách đơn hàng
- `GET /statistics` - Thống kê tổng quan
- `GET /notifications` - Thông báo

## 🎨 Thiết Kế UI

### **Màu Sắc Chính:**
- **Primary Orange:** `#FF6B35` - Màu chủ đạo
- **Secondary Orange:** `#FF8E53` - Màu phụ
- **Success Green:** `#4CAF50` - Trạng thái thành công
- **Warning Orange:** `#FF9800` - Cảnh báo
- **Info Blue:** `#2196F3` - Thông tin

### **Phông Chữ:**
- **Tiêu đề:** Bold, 18-24px
- **Nội dung:** Regular, 14-16px
- **Ghi chú:** Light, 12-14px

## 🔄 Luồng Hoạt Động

```
[Đăng nhập]
   ↓
[Dashboard - Trang chính]
   ├─ [Danh sách đơn hàng]
   │     ├─ [Chi tiết đơn hàng]
   │     │     ├─ Nhận đơn (Shipper)
   │     │     ├─ Theo dõi trạng thái
   │     │     └─ Hoàn thành
   │     └─ Lọc đơn (Pending/Delivering/Completed)
   │
   ├─ [Bản đồ định vị]
   │     └─ Xem vị trí shipper (Admin)
   │
   ├─ [Tạo đơn mới] (Admin)
   │     └─ Nhập thông tin khách + địa chỉ + sản phẩm
   │
   ├─ [Lịch sử đơn hàng]
   │     └─ Chi tiết lịch sử
   │
   └─ [Tài khoản cá nhân]
         ├─ Hồ sơ
         ├─ Đổi mật khẩu
         └─ Đăng xuất
```

## 📚 Video Hướng Dẫn Tham Khảo

1. **React Native Food Delivery App UI**: https://www.youtube.com/watch?v=diUDjNwZ8Lg
2. **Deliveroo Clone với React Native**: https://www.youtube.com/watch?v=taPz40VmyzQ
3. **Food Delivery App với Expo Router**: https://www.youtube.com/watch?v=FXnnCrfiNGM
4. **React Native Ecommerce Setup**: https://www.youtube.com/watch?v=OkkTXAhYa-Q

## 🛠️ Công Nghệ Sử Dụng

- **React Native 0.73.11** - Framework mobile
- **React Navigation 6** - Điều hướng
- **TypeScript** - Type safety
- **React Native Paper** - UI Components
- **React Native Vector Icons** - Icons
- **Linear Gradient** - Gradient effects
- **AsyncStorage** - Local storage
- **Axios** - HTTP client
- **JSON Server** - Mock API

## 🔮 Tính Năng Nâng Cao (Roadmap)

### **Phase 2:**
- 🗺️ **React Native Maps** - Bản đồ tích hợp
- 📍 **Geolocation** - Định vị GPS
- 🔔 **Push Notifications** - Thông báo đẩy
- 📷 **QR Code Scanner** - Scan mã vận đơn

### **Phase 3:**
- 💬 **Real-time Chat** - WebSocket chat
- 📊 **Advanced Analytics** - Báo cáo chi tiết
- 🌐 **API Backend** - Database thực
- 🔐 **JWT Authentication** - Bảo mật nâng cao

## 🐛 Xử Lý Lỗi Thường Gặp

### **Lỗi Metro:**
```bash
npx react-native start --reset-cache
```

### **Lỗi Android Build:**
```bash
cd android && ./gradlew clean && cd ..
npx react-native run-android
```

### **Lỗi iOS Build:**
```bash
cd ios && pod install && cd ..
npx react-native run-ios
```

### **Lỗi JSON Server:**
- Kiểm tra port 3000 có bị sử dụng
- Restart server: `npm run server`

## 📞 Hỗ Trợ

Nếu gặp vấn đề trong quá trình phát triển, vui lòng:

1. 📖 Đọc documentation
2. 🔍 Kiểm tra console logs
3. 🌐 Tìm kiếm Google/Stack Overflow
4. 💬 Liên hệ team support

## 📄 License

Dự án này được phát triển cho mục đích học tập và thương mại cho cửa hàng riêng.

---

**🚀 Chúc bạn phát triển app thành công! 🎉**