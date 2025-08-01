# 🚀 API Guide - S7M Drive App

## 📊 JSON Server API

### **Base URL:** 
- **Local (Simulator):** `http://localhost:3000`
- **Network (Device):** `http://192.168.1.163:3000`

---

## 🔐 **Authentication API**

### **GET /users**
Lấy danh sách tất cả người dùng

```bash
curl http://192.168.1.163:3000/users
```

**Response:**
```json
[
  {
    "id": 1,
    "username": "admin",
    "password": "123456",
    "role": "admin",
    "name": "Nguyễn Văn Admin",
    "email": "admin@s7mdrive.com",
    "phone": "0123456789",
    "avatar": "https://i.pravatar.cc/300?img=1"
  }
]
```

### **GET /users/:id**
Lấy thông tin user theo ID

```bash
curl http://192.168.1.163:3000/users/1
```

### **PATCH /users/:id**
Cập nhật thông tin user

```bash
curl -X PATCH http://192.168.1.163:3000/users/2 \
  -H "Content-Type: application/json" \
  -d '{"status": "active", "current_location": {"latitude": 10.762622, "longitude": 106.660172}}'
```

---

## 📦 **Orders API**

### **GET /orders**
Lấy danh sách đơn hàng

```bash
# Tất cả đơn hàng
curl http://192.168.1.163:3000/orders

# Lọc theo status
curl http://192.168.1.163:3000/orders?status=pending

# Lọc theo shipper
curl http://192.168.1.163:3000/orders?shipper_id=2

# Phân trang
curl http://192.168.1.163:3000/orders?_page=1&_limit=10
```

**Response:**
```json
[
  {
    "id": 1,
    "order_code": "S7M001",
    "customer_name": "Lê Thị Lan",
    "customer_phone": "0901234567",
    "pickup_address": "123 Nguyễn Huệ, Quận 1, TP.HCM",
    "delivery_address": "456 Lê Lợi, Quận 3, TP.HCM",
    "total_value": 800000,
    "shipping_fee": 25000,
    "status": "pending",
    "created_at": "2025-01-08T09:00:00.000Z"
  }
]
```

### **GET /orders/:id**
Lấy chi tiết đơn hàng

```bash
curl http://192.168.1.163:3000/orders/1
```

### **POST /orders**
Tạo đơn hàng mới

```bash
curl -X POST http://192.168.1.163:3000/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customer_name": "Nguyễn Văn A",
    "customer_phone": "0912345678",
    "pickup_address": "123 ABC Street",
    "delivery_address": "456 XYZ Street",
    "total_value": 500000,
    "shipping_fee": 30000,
    "status": "pending",
    "created_at": "2025-01-08T15:00:00.000Z"
  }'
```

### **PATCH /orders/:id**
Cập nhật đơn hàng

```bash
curl -X PATCH http://192.168.1.163:3000/orders/1 \
  -H "Content-Type: application/json" \
  -d '{"status": "confirmed", "shipper_id": 2}'
```

### **DELETE /orders/:id**
Xóa đơn hàng

```bash
curl -X DELETE http://192.168.1.163:3000/orders/1
```

---

## 📊 **Statistics API**

### **GET /statistics**
Lấy thống kê tổng quan

```bash
curl http://192.168.1.163:3000/statistics
```

**Response:**
```json
{
  "today": {
    "total_orders": 4,
    "completed": 1,
    "delivering": 1,
    "pending": 2,
    "revenue": 145000
  },
  "this_week": {
    "total_orders": 12,
    "completed": 8,
    "delivering": 2,
    "pending": 2,
    "revenue": 520000
  },
  "this_month": {
    "total_orders": 104,
    "completed": 89,
    "delivering": 8,
    "pending": 7,
    "revenue": 2850000
  }
}
```

---

## 🔔 **Notifications API**

### **GET /notifications**
Lấy danh sách thông báo

```bash
# Tất cả thông báo
curl http://192.168.1.163:3000/notifications

# Thông báo của user cụ thể
curl http://192.168.1.163:3000/notifications?user_id=1

# Chỉ thông báo chưa đọc
curl http://192.168.1.163:3000/notifications?user_id=1&read=false

# Sắp xếp theo thời gian
curl http://192.168.1.163:3000/notifications?_sort=created_at&_order=desc
```

### **POST /notifications**
Tạo thông báo mới

```bash
curl -X POST http://192.168.1.163:3000/notifications \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Đơn hàng mới",
    "message": "Bạn có đơn hàng mới #S7M001",
    "type": "new_order",
    "user_id": 1,
    "read": false,
    "created_at": "2025-01-08T15:00:00.000Z"
  }'
```

### **PATCH /notifications/:id**
Đánh dấu thông báo đã đọc

```bash
curl -X PATCH http://192.168.1.163:3000/notifications/1 \
  -H "Content-Type: application/json" \
  -d '{"read": true}'
```

---

## 🔍 **Advanced Queries**

### **Full-text Search**
```bash
# Tìm kiếm đơn hàng theo tên khách hàng
curl http://192.168.1.163:3000/orders?q=Nguyễn

# Tìm kiếm trong nhiều field
curl http://192.168.1.163:3000/orders?customer_name_like=Lê
```

### **Range Queries**
```bash
# Đơn hàng có giá trị >= 500000
curl http://192.168.1.163:3000/orders?total_value_gte=500000

# Đơn hàng tạo trong khoảng thời gian
curl http://192.168.1.163:3000/orders?created_at_gte=2025-01-01&created_at_lte=2025-01-31
```

### **Sorting & Pagination**
```bash
# Sắp xếp theo ngày tạo mới nhất
curl http://192.168.1.163:3000/orders?_sort=created_at&_order=desc

# Phân trang 10 items mỗi trang
curl http://192.168.1.163:3000/orders?_page=1&_limit=10

# Lấy 5 đơn hàng mới nhất
curl http://192.168.1.163:3000/orders?_sort=created_at&_order=desc&_limit=5
```

### **Relationships & Expand**
```bash
# Lấy đơn hàng với thông tin shipper
curl http://192.168.1.163:3000/orders?_expand=shipper

# Lấy user với tất cả đơn hàng của họ
curl http://192.168.1.163:3000/users?_embed=orders
```

---

## 🛠️ **Utility Operations**

### **Backup Database**
```bash
curl http://192.168.1.163:3000/db > backup.json
```

### **Health Check**
```bash
curl http://192.168.1.163:3000/
```

### **Reset Data** 
Restart server để reset về dữ liệu ban đầu từ `db.json`

---

## 📱 **React Native Implementation**

### **Sử dụng Services trong App:**

```typescript
import { orderService, authService, statisticsService } from '../services';

// Đăng nhập
const loginResult = await authService.login({ username: 'admin', password: '123456' });

// Lấy đơn hàng
const orders = await orderService.getOrders({ status: 'pending' });

// Cập nhật đơn hàng
await orderService.updateOrder(1, { status: 'confirmed', shipper_id: 2 });

// Lấy thống kê
const stats = await statisticsService.getStatistics();
```

---

## 🚨 **Error Handling**

### **Common HTTP Status Codes:**
- **200**: Success
- **201**: Created successfully  
- **404**: Resource not found
- **500**: Server error

### **Error Response Format:**
```json
{
  "error": "Not Found",
  "message": "Order with id 999 not found"
}
```

---

## 🔧 **Development Tips**

1. **Kiểm tra server đang chạy:**
   ```bash
   curl http://192.168.1.163:3000/
   ```

2. **View database trong browser:**
   Mở: http://192.168.1.163:3000

3. **Real-time watching:**
   JSON Server tự động reload khi `db.json` thay đổi

4. **Custom routes:**
   Thêm vào `start-server.js` nếu cần routes đặc biệt

5. **CORS:** 
   Đã được enable mặc định cho React Native

---

## 📚 **Resources**

- [JSON Server Documentation](https://github.com/typicode/json-server)
- [REST API Best Practices](https://restfulapi.net/)
- [React Native Networking](https://reactnative.dev/docs/network)

---

**🎉 Happy Coding! Chúc bạn phát triển app thành công!**