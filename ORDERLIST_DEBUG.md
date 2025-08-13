# Debug OrderList - Không hiển thị đơn hàng

## Tổng quan
API trả về 200 nhưng màn hình OrderList không hiển thị đơn hàng. Cần debug để tìm nguyên nhân.

## Vấn đề ban đầu
- API call thành công: `200 https://389a5362809e.ngrok-free.app/api/order/filterOrderAddressByCityAndWard`
- Nhưng màn hình OrderList không hiển thị đơn hàng

## Các thay đổi để debug

### 1. Cập nhật logic lấy thông tin khu vực

#### Trước (sử dụng user.area cũ):
```javascript
// Parse area string: "Xã Quốc Oai, Thành phố Hà Nội"
const areaParts = user.area.split(',').map(part => part.trim());
const ward = wardPart.replace(/^(Xã|Phường|Quận|Huyện)\s+/, '');
const province = provincePart.replace(/^(Thành phố|Tỉnh)\s+/, '');
```

#### Sau (sử dụng response đăng nhập mới):
```javascript
// Sử dụng thông tin khu vực từ response đăng nhập mới
const province = user?.post_office_name || 'Hà Nội';
const ward = user?.address_shipping?.split(',')[0] || 'Xuân Phương';
```

### 2. Thêm logs chi tiết để debug

#### Log thông tin user:
```javascript
console.log('User info for orders:', {
  post_office_name: user?.post_office_name,
  address_shipping: user?.address_shipping,
  province,
  ward
});
```

#### Log dữ liệu từ API:
```javascript
console.log('Raw data from API:', data);
console.log('Data type:', typeof data);
console.log('Data length:', Array.isArray(data) ? data.length : 'Not an array');
```

#### Log xử lý từng đơn hàng:
```javascript
console.log('Processing order:', order);
console.log('Order status:', order.status, 'Type:', typeof order.status);
console.log('Parsed status:', status, 'Is valid:', isValidStatus);
```

### 3. Cập nhật hiển thị khu vực
```javascript
// Trước
<Text style={styles.areaText}>{user?.area}</Text>

// Sau
<Text style={styles.areaText}>{user?.address_shipping}</Text>
```

## Các bước debug

### 1. Kiểm tra thông tin user
```
User info for orders: {
  post_office_name: "Hà Nội",
  address_shipping: "Xuân Phương, Hà Nội",
  province: "Hà Nội",
  ward: "Xuân Phương"
}
```

### 2. Kiểm tra dữ liệu API
```
Raw data from API: [...]
Data type: object
Data length: 5
```

### 3. Kiểm tra xử lý trạng thái
```
Processing order: {_id: "...", status: "2", ...}
Order status: "2" Type: string
Parsed status: 2 Is valid: true
```

## Các nguyên nhân có thể

### 1. **Dữ liệu không phải array**
- API trả về object thay vì array
- Cần kiểm tra cấu trúc response

### 2. **Trạng thái không đúng format**
- Status là string thay vì number
- Status không nằm trong range [2,3,4,5,6]
- **Trạng thái mới:**
  - 2: Đã xác nhận
  - 3: Rời kho
  - 4: Tới bưu cục
  - 5: Shipper nhận hàng
  - 6: Đang giao

### 3. **Thông tin khu vực sai**
- Province/ward không khớp với API
- API không trả về đơn hàng cho khu vực đó

### 4. **API response structure khác**
- Cấu trúc response thay đổi
- Data nằm trong nested object

## Cách kiểm tra

### 1. **Test API trực tiếp**:
```
GET https://389a5362809e.ngrok-free.app/api/order/filterOrderAddressByCityAndWard?province=Hà Nội&ward=Xuân Phương
```

### 2. **Kiểm tra response structure**:
```json
[
  {
    "_id": "...",
    "status": "2",
    "id_address": {...},
    "createdAt": "..."
  }
]
```

### 3. **Kiểm tra trạng thái**:
- Status có phải là string "2" không?
- Có cần parse thành number không?
- **Trạng thái hợp lệ:** 2, 3, 4, 5, 6
  - 2: Đã xác nhận (Orange)
  - 3: Rời kho (Blue)
  - 4: Tới bưu cục (Purple)
  - 5: Shipper nhận hàng (Deep Orange)
  - 6: Đang giao (Green)

## Logs cần theo dõi

### 1. **User Info**:
```
User info for orders: {post_office_name: "Hà Nội", address_shipping: "Xuân Phương, Hà Nội", province: "Hà Nội", ward: "Xuân Phương"}
```

### 2. **API Response**:
```
Raw data from API: [...]
Data type: object
Data length: 5
```

### 3. **Order Processing**:
```
Processing order: {_id: "...", status: "2", ...}
Order status: "2" Type: string
Parsed status: 2 Is valid: true
```

### 4. **Final Result**:
```
Orders fetched: 5 Active orders: 3
Active orders: [...]
```

## Troubleshooting

### 1. **Nếu data không phải array**:
```javascript
// Thêm fallback
const ordersArray = Array.isArray(data) ? data : (data.data || []);
```

### 2. **Nếu status là string**:
```javascript
// Đã xử lý với parseInt()
const status = parseInt(order.status);
```

### 3. **Nếu không có đơn hàng nào**:
- Kiểm tra khu vực có đúng không
- Kiểm tra có đơn hàng nào trong khu vực đó không
- Kiểm tra trạng thái có đúng không

### 4. **Nếu API trả về lỗi**:
- Kiểm tra URL và parameters
- Kiểm tra server logs
- Kiểm tra network connection
