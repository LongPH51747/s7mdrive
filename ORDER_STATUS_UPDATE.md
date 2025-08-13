# Cập nhật Trạng thái Đơn hàng

## Tổng quan
Cập nhật mapping trạng thái đơn hàng theo yêu cầu mới từ backend.

## Trạng thái cũ vs mới

### ❌ Trạng thái cũ (Sai):
```javascript
const statusMap = {
  2: 'Đã xác nhận',
  3: 'Đang giao',
  4: 'Đã giao',
  5: 'Hoàn thành',
  6: 'Đã hủy'
};
```

### ✅ Trạng thái mới (Đúng):
```javascript
const statusMap = {
  2: 'Đã xác nhận',
  3: 'Rời kho',
  4: 'Tới bưu cục',
  5: 'Shipper nhận hàng',
  6: 'Đang giao'
};
```

## Màu sắc tương ứng

### ❌ Màu sắc cũ:
```javascript
const colorMap = {
  2: '#FF9800', // Orange - Đã xác nhận
  3: '#2196F3', // Blue - Đang giao
  4: '#4CAF50', // Green - Đã giao
  5: '#4CAF50', // Green - Hoàn thành
  6: '#F44336'  // Red - Đã hủy
};
```

### ✅ Màu sắc mới:
```javascript
const colorMap = {
  2: '#FF9800', // Orange - Đã xác nhận
  3: '#2196F3', // Blue - Rời kho
  4: '#9C27B0', // Purple - Tới bưu cục
  5: '#FF5722', // Deep Orange - Shipper nhận hàng
  6: '#4CAF50'  // Green - Đang giao
};
```

## Logic hiển thị nút "Hoàn thành"

### ❌ Logic cũ:
```javascript
{[2, 3, 4].includes(parseInt(item.status)) && (
  <TouchableOpacity style={styles.completeButton}>
    <Text>Hoàn thành</Text>
  </TouchableOpacity>
)}
```

### ✅ Logic mới:
```javascript
{[2, 3, 4, 5, 6].includes(parseInt(item.status)) && (
  <TouchableOpacity style={styles.completeButton}>
    <Text>Hoàn thành</Text>
  </TouchableOpacity>
)}
```

## Quy trình đơn hàng mới

### 1. **Đã xác nhận** (2) - Orange
- Đơn hàng đã được xác nhận từ hệ thống
- Shipper có thể bắt đầu xử lý

### 2. **Rời kho** (3) - Blue
- Hàng đã rời khỏi kho trung tâm
- Đang trong quá trình vận chuyển

### 3. **Tới bưu cục** (4) - Purple
- Hàng đã đến bưu cục địa phương
- Sẵn sàng cho shipper nhận

### 4. **Shipper nhận hàng** (5) - Deep Orange
- Shipper đã nhận hàng từ bưu cục
- Bắt đầu giao hàng

### 5. **Đang giao** (6) - Green
- Shipper đang giao hàng cho khách
- Có thể hoàn thành đơn hàng

## Các thay đổi trong code

### 1. **File: `src/screens/orders/OrderListScreen.js`**

#### Cập nhật `getStatusText()`:
```javascript
const getStatusText = (status) => {
  const statusMap = {
    2: 'Đã xác nhận',
    3: 'Rời kho',
    4: 'Tới bưu cục',
    5: 'Shipper nhận hàng',
    6: 'Đang giao'
  };
  return statusMap[status] || `Trạng thái ${status}`;
};
```

#### Cập nhật `getStatusColor()`:
```javascript
const getStatusColor = (status) => {
  const colorMap = {
    2: '#FF9800', // Orange - Đã xác nhận
    3: '#2196F3', // Blue - Rời kho
    4: '#9C27B0', // Purple - Tới bưu cục
    5: '#FF5722', // Deep Orange - Shipper nhận hàng
    6: '#4CAF50'  // Green - Đang giao
  };
  return colorMap[status] || '#666';
};
```

#### Cập nhật logic hiển thị nút:
```javascript
{[2, 3, 4, 5, 6].includes(parseInt(item.status)) && (
  <TouchableOpacity style={styles.completeButton}>
    <Text>Hoàn thành</Text>
  </TouchableOpacity>
)}
```

## Lợi ích của thay đổi

### 1. **Chính xác hơn**
- Phản ánh đúng quy trình thực tế của đơn hàng
- Từng bước rõ ràng và logic

### 2. **Dễ theo dõi**
- Shipper biết chính xác vị trí đơn hàng
- Màu sắc phân biệt rõ từng trạng thái

### 3. **Quản lý tốt hơn**
- Có thể track được từng bước trong quy trình
- Dễ dàng xác định bottleneck

## Testing

### 1. **Kiểm tra hiển thị**
- Đơn hàng với status 2-6 hiển thị đúng text và màu
- Nút "Hoàn thành" xuất hiện cho tất cả trạng thái

### 2. **Kiểm tra logic**
- Filter đơn hàng theo status [2,3,4,5,6]
- Parse status từ string sang number

### 3. **Kiểm tra UI**
- Màu sắc phân biệt rõ từng trạng thái
- Text hiển thị đúng và dễ hiểu

## Logs cần theo dõi

```
Processing order: {_id: "...", status: "2", ...}
Order status: "2" Type: string
Parsed status: 2 Is valid: true
Status text: "Đã xác nhận"
Status color: "#FF9800"
```

## Troubleshooting

### 1. **Nếu status không hiển thị đúng**
- Kiểm tra mapping trong `getStatusText()`
- Kiểm tra kiểu dữ liệu của status

### 2. **Nếu màu sắc không đúng**
- Kiểm tra mapping trong `getStatusColor()`
- Kiểm tra CSS/React Native styles

### 3. **Nếu nút không hiển thị**
- Kiểm tra logic `[2, 3, 4, 5, 6].includes()`
- Kiểm tra `parseInt(item.status)`
