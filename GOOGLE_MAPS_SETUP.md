# Google Maps Setup Guide - S7M Drive

## 📋 Tổng quan

Đã tích hợp Google Maps đơn giản vào ứng dụng S7M Drive để hiển thị bản đồ cơ bản.

## 🔧 Các thay đổi đã thực hiện

### 1. Dependencies
Đã thêm package cần thiết vào `package.json`:
- `react-native-maps`: 1.13.2

### 2. Android Configuration
- **AndroidManifest.xml**: Thêm Google Maps API key
- **Permissions**: Đã có sẵn location permissions

### 3. iOS Configuration
- **Info.plist**: Đã có sẵn location permissions
- **Pods**: Cần chạy `pod install` để cài đặt react-native-maps

### 4. Screens & Navigation
- **MapScreen.js**: Màn hình Google Maps đơn giản
- **Navigation**: MapScreen có thể truy cập từ tab "Bản đồ"

## 🚀 Cách sử dụng

### Truy cập từ tab Map
- Tab "Bản đồ" sẽ hiển thị MapTrackingScreen
- Từ MapTrackingScreen có thể navigate đến MapScreen

## 🔑 API Key

Google Maps API Key: `AIzaSyB7ETOwK6NMmiPXlHUAThIjfDbCxXq_A6c`

**Lưu ý**: Đây là API key từ s7mstore, bạn có thể thay đổi nếu cần.

## 📱 Features

### MapScreen Features:
- ✅ Hiển thị Google Maps
- ✅ Hiển thị vị trí người dùng
- ✅ Nút "My Location" để di chuyển đến vị trí hiện tại
- ✅ Compass và scale
- ✅ Có thể di chuyển và zoom bản đồ

## 🛠️ Cài đặt

### 1. Cài đặt dependencies
```bash
cd s7mdrive
npm install
```

### 2. Cài đặt iOS pods
```bash
cd ios
pod install
```

### 3. Rebuild ứng dụng
```bash
# Android
npx react-native run-android

# iOS
npx react-native run-ios
```

## 🔍 Testing

### 1. Test MapScreen
- Mở tab "Bản đồ"
- Navigate đến MapScreen
- Test các chức năng:
  - Di chuyển map
  - Chọn vị trí
  - Lấy vị trí hiện tại
  - Xác nhận vị trí

### 2. Test MapButton
- Sử dụng MapButton trong các screen khác
- Test callback function
- Test navigation

## 🐛 Troubleshooting

### 1. Map không hiển thị
- Kiểm tra API key trong AndroidManifest.xml
- Kiểm tra permissions
- Rebuild ứng dụng

### 2. Location không hoạt động
- Kiểm tra permissions trong Info.plist (iOS)
- Kiểm tra permissions trong AndroidManifest.xml (Android)
- Test trên thiết bị thật (không phải simulator)

### 3. Build errors
- Chạy `pod install` cho iOS
- Clean và rebuild project
- Kiểm tra dependencies versions

## 📚 Tài liệu tham khảo

- [React Native Maps](https://github.com/react-native-maps/react-native-maps)
- [React Native Geolocation](https://github.com/react-native-community/react-native-geolocation)
- [Google Maps API](https://developers.google.com/maps/documentation)

## 🎯 Next Steps

1. **Customize styling**: Thay đổi màu sắc, kích thước marker
2. **Add more features**: Thêm search, directions, markers
3. **Optimize performance**: Lazy loading, caching
4. **Add offline support**: Cache map tiles
5. **Integration**: Tích hợp với các screen khác trong app
