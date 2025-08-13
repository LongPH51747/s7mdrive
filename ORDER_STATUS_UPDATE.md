# Cập nhật Logic Hiển thị Đơn hàng theo Trạng thái Số

## Tổng quan
Đã cập nhật logic hiển thị đơn hàng từ trạng thái "Đã xác nhận" sang các trạng thái số: 2, 3, 4, 5, 6.

## Các trạng thái mới

### Mapping trạng thái số sang text:
- **2**: "Đã xác nhận" (Màu cam)
- **3**: "Đang giao" (Màu xanh dương)
- **4**: "Đã giao" (Màu xanh lá)
- **5**: "Hoàn thành" (Màu xanh lá)
- **6**: "Đã hủy" (Màu đỏ)

### Màu sắc trạng thái:
- **Trạng thái 2**: `#FF9800` (Orange)
- **Trạng thái 3**: `#2196F3` (Blue)
- **Trạng thái 4**: `#4CAF50` (Green)
- **Trạng thái 5**: `#4CAF50` (Green)
- **Trạng thái 6**: `#F44336` (Red)

## Các thay đổi chính

### 1. Cập nhật OrderListScreen (`src/screens/orders/OrderListScreen.js`)

#### Logic lọc đơn hàng:
```javascript
// Trước: Lọc theo trạng thái "Đã xác nhận"
const confirmedOrders = data.filter(order => order.status === 'Đã xác nhận');

// Sau: Lọc theo trạng thái số 2, 3, 4, 5, 6
const activeOrders = data.filter(order => {
  const status = parseInt(order.status);
  return [2, 3, 4, 5, 6].includes(status);
});
```

#### Functions mới:
```javascript
// Lấy text trạng thái từ số
const getStatusText = (status) => {
  const statusMap = {
    2: 'Đã xác nhận',
    3: 'Đang giao',
    4: 'Đã giao',
    5: 'Hoàn thành',
    6: 'Đã hủy'
  };
  return statusMap[status] || `Trạng thái ${status}`;
};

// Lấy màu sắc trạng thái
const getStatusColor = (status) => {
  const colorMap = {
    2: '#FF9800', // Orange
    3: '#2196F3', // Blue
    4: '#4CAF50', // Green
    5: '#4CAF50', // Green
    6: '#F44336'  // Red
  };
  return colorMap[status] || '#666';
};
```

#### Hiển thị trạng thái:
```javascript
// Trước: Hiển thị số trạng thái
<Text style={styles.orderStatus}>Trạng thái: {item.status}</Text>

// Sau: Hiển thị text và màu sắc
<Text style={[styles.orderStatus, {color: getStatusColor(item.status)}]}>
  {getStatusText(item.status)}
</Text>
```

#### Logic nút "Hoàn thành":
```javascript
// Chỉ hiển thị nút "Hoàn thành" cho trạng thái 2, 3, 4
{[2, 3, 4].includes(parseInt(item.status)) && (
  <TouchableOpacity 
    style={styles.completeButton}
    onPress={() => handleCompleteOrder(item._id, orderCode)}
  >
    <Icon name="check-circle" size={16} color="white" />
    <Text style={styles.completeButtonText}>Hoàn thành</Text>
  </TouchableOpacity>
)}
```

### 2. Cập nhật UI Text

#### Header:
- **Trước**: "Đơn hàng đã xác nhận"
- **Sau**: "Đơn hàng đang hoạt động"

#### List Header:
- **Trước**: "Tổng cộng: X đơn hàng đã xác nhận"
- **Sau**: "Tổng cộng: X đơn hàng đang hoạt động"

#### Empty State:
- **Trước**: "Hiện tại không có đơn hàng nào đã xác nhận trong khu vực của bạn"
- **Sau**: "Hiện tại không có đơn hàng nào đang hoạt động trong khu vực của bạn"

## Quy trình hoạt động

### 1. Lọc đơn hàng
- Lấy tất cả đơn hàng theo khu vực
- Lọc chỉ những đơn có trạng thái 2, 3, 4, 5, 6
- Hiển thị danh sách đã lọc

### 2. Hiển thị trạng thái
- Chuyển đổi số trạng thái sang text
- Áp dụng màu sắc tương ứng
- Hiển thị trong UI

### 3. Xử lý nút "Hoàn thành"
- Chỉ hiển thị cho trạng thái 2, 3, 4
- Ẩn nút cho trạng thái 5, 6

## Lợi ích của việc cập nhật

### 1. **Hiển thị đa dạng hơn**
- Không chỉ hiển thị đơn hàng "đã xác nhận"
- Bao gồm các trạng thái khác nhau của đơn hàng

### 2. **Trực quan hơn**
- Màu sắc giúp phân biệt trạng thái dễ dàng
- Text rõ ràng thay vì chỉ số

### 3. **Logic chính xác hơn**
- Nút "Hoàn thành" chỉ hiển thị khi phù hợp
- Tránh thao tác sai trên đơn hàng đã hoàn thành

### 4. **Dễ mở rộng**
- Dễ dàng thêm trạng thái mới
- Mapping linh hoạt giữa số và text

## Cách sử dụng

1. **Xem danh sách**: Hiển thị tất cả đơn hàng có trạng thái 2-6
2. **Phân biệt trạng thái**: Dựa vào màu sắc và text
3. **Thao tác**: Chỉ có thể hoàn thành đơn hàng trạng thái 2, 3, 4
4. **Theo dõi**: Dễ dàng theo dõi tiến trình đơn hàng

## Lưu ý kỹ thuật

- **Parse status**: Sử dụng `parseInt()` để chuyển string sang number
- **Fallback**: Có xử lý trường hợp trạng thái không có trong mapping
- **Performance**: Filter được thực hiện một lần khi load data
- **UI consistency**: Màu sắc và text thống nhất trong toàn bộ app
