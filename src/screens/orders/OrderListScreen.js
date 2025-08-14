import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
  RefreshControl,
  Alert,
  ActivityIndicator,
  Linking,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useAuth} from '../../hooks/useAuth';
import {useCheckIn} from '../../hooks/useCheckIn';
import {useNavigation} from '@react-navigation/native';
import {orderService, confirmOrderSuccess} from '../../services';


const OrderListScreen = () => {
  const {user} = useAuth();
  const {isCheckedIn, loading: checkInLoading} = useCheckIn();
  const navigation = useNavigation();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [processingOrder, setProcessingOrder] = useState(null);

  useEffect(() => {
    if (!checkInLoading) {
      if (!isCheckedIn) {
        Alert.alert(
          'Yêu cầu Check-in',
          'Bạn cần check in để tiếp tục làm việc',
          [
            {
              text: 'Hủy',
              onPress: () => navigation.goBack(),
            },
            {
              text: 'Check-in ngay',
              onPress: () => navigation.navigate('CheckIn'),
            },
          ]
        );
        return;
      }
      fetchOrdersByArea();
    }
  }, [isCheckedIn, checkInLoading]);

  const fetchOrdersByArea = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Sử dụng thông tin khu vực từ response đăng nhập mới
      const province = user?.post_office_name || 'Hà Nội';
      const ward = user?.address_shipping?.split(',')[0] || 'Xuân Phương';
      
      console.log('User info for orders:', {
        post_office_name: user?.post_office_name,
        address_shipping: user?.address_shipping,
        province,
        ward
      });

      console.log('Fetching orders for area:', {ward, province});
      
      const data = await orderService.getOrdersByArea(province, ward);
      
      console.log('Raw data from API:', data);
      console.log('Data type:', typeof data);
      console.log('Data length:', Array.isArray(data) ? data.length : 'Not an array');
      
      // Đảm bảo data là array
      const ordersArray = Array.isArray(data) ? data : [];
      
      // Lọc những đơn hàng có trạng thái số: 2, 3, 4, 5, 6, 7
      const activeOrders = ordersArray.filter(order => {
        console.log('Processing order:', order);
        console.log('Order status:', order.status, 'Type:', typeof order.status);
        
        const status = parseInt(order.status);
        const isValidStatus = [2, 3, 4, 5, 6, 7].includes(status);
        
        console.log('Parsed status:', status, 'Is valid:', isValidStatus);
        return isValidStatus;
      });
      
      setOrders(activeOrders);
      
      console.log('Orders fetched:', ordersArray.length, 'Active orders:', activeOrders.length);
      console.log('Active orders:', activeOrders);
    } catch (error) {
      console.error('Error fetching orders by area:', error);
      setError('Không thể tải danh sách đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchOrdersByArea();
    setRefreshing(false);
  };

  // Xin quyền truy cập camera
  const requestCameraPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'Quyền truy cập camera',
            message: 'Ứng dụng cần quyền truy cập camera để chụp ảnh xác nhận đơn hàng',
            buttonNeutral: 'Hỏi lại sau',
            buttonNegative: 'Từ chối',
            buttonPositive: 'Đồng ý',
          },
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    } else {
      return true; // iOS sẽ hỏi quyền khi launch camera
    }
  };



  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const getStatusText = (status) => {
    const statusMap = {
      2: 'Đã xác nhận',
      3: 'Rời kho',
      4: 'Tới bưu cục',
      5: 'Shipper nhận hàng',
      6: 'Đang giao',
      7: 'Giao thành công'
    };
    return statusMap[status] || `Trạng thái ${status}`;
  };

  const getStatusColor = (status) => {
    const colorMap = {
      2: '#FF9800', // Orange - Đã xác nhận
      3: '#2196F3', // Blue - Rời kho
      4: '#9C27B0', // Purple - Tới bưu cục
      5: '#FF5722', // Deep Orange - Shipper nhận hàng
      6: '#4CAF50', // Green - Đang giao
      7: '#00BCD4'  // Cyan - Giao thành công
    };
    return colorMap[status] || '#666';
  };

  const handleCallPhone = (phoneNumber) => {
    if (phoneNumber) {
      const phoneUrl = `tel:${phoneNumber}`;
      Linking.openURL(phoneUrl).catch(err => {
        console.error('Error opening phone app:', err);
        Alert.alert('Lỗi', 'Không thể mở ứng dụng gọi điện');
      });
    }
  };

  const handleOpenMaps = (addressData) => {
    if (addressData?.latitude && addressData?.longitude) {
      // Use coordinates for precise location
      const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${addressData.latitude},${addressData.longitude}`;
      
      Linking.openURL(mapsUrl).catch(err => {
        console.error('Error opening Google Maps:', err);
        Alert.alert('Lỗi', 'Không thể mở Google Maps');
      });
    } else if (addressData?.addressDetail) {
      // Fallback to address if coordinates are not available
      const encodedAddress = encodeURIComponent(addressData.addressDetail);
      const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`;
      
      Linking.openURL(mapsUrl).catch(err => {
        console.error('Error opening Google Maps:', err);
        Alert.alert('Lỗi', 'Không thể mở Google Maps');
      });
    } else {
      Alert.alert('Thông báo', 'Không có thông tin vị trí để chỉ đường');
    }
  };

  const handleCompleteOrder = async (orderId, orderCode) => {
    // Tìm order object từ orderId
    const order = orders.find(o => o._id === orderId);
    if (!order) {
      Alert.alert('Lỗi', 'Không tìm thấy thông tin đơn hàng');
      return;
    }

    try {
      console.log('📸 Bắt đầu xử lý hoàn thành đơn hàng:', orderId);
      console.log('📸 Loading ImagePicker dynamically...');
      console.log('📸 confirmOrderSuccess function:', confirmOrderSuccess);
      setProcessingOrder(orderId);
      
      // Xin quyền camera
      const hasPermission = await requestCameraPermission();
      if (!hasPermission) {
        Alert.alert('Lỗi', 'Cần quyền truy cập camera để chụp ảnh xác nhận');
        setProcessingOrder(null);
        return;
      }

      // Mở camera
      const ImagePicker = require('react-native-image-picker');
      const result = await ImagePicker.launchCamera({
        mediaType: 'photo',
        quality: 0.8,
        includeBase64: false,
        saveToPhotos: false,
      });

      if (result.didCancel) {
        console.log('📸 Người dùng hủy chụp ảnh');
        setProcessingOrder(null);
        return;
      }

      if (result.errorCode) {
        console.error('📸 Lỗi camera:', result.errorMessage);
        Alert.alert('Lỗi', 'Không thể mở camera: ' + result.errorMessage);
        setProcessingOrder(null);
        return;
      }

      const imageUri = result.assets?.[0]?.uri;
      if (!imageUri) {
        console.error('📸 Không có ảnh được chụp');
        Alert.alert('Lỗi', 'Không thể lấy ảnh từ camera');
        setProcessingOrder(null);
        return;
      }

      console.log('📸 Ảnh đã chụp:', imageUri);

      // Gọi API xác nhận đơn hàng hoàn thành
      const confirmResult = await confirmOrderSuccess(user.id, orderId, imageUri);
      
      if (confirmResult.success) {
        console.log('✅ Đơn hàng đã được xác nhận hoàn thành');
        Alert.alert(
          'Thành công',
          'Đơn hàng đã được xác nhận hoàn thành!',
          [
            {
              text: 'OK',
              onPress: () => {
                // Refresh danh sách đơn hàng
                fetchOrdersByArea();
              }
            }
          ]
        );
      } else {
        console.error('❌ Lỗi khi xác nhận đơn hàng:', confirmResult.error);
        Alert.alert('Lỗi', 'Không thể xác nhận đơn hàng: ' + confirmResult.error);
      }
    } catch (error) {
      console.error('❌ Lỗi khi xử lý hoàn thành đơn hàng:', error);
      Alert.alert('Lỗi', 'Có lỗi xảy ra khi xử lý đơn hàng');
    } finally {
      setProcessingOrder(null);
    }
  };

  const renderOrderItem = ({item}) => {
    const isCompleted = parseInt(item.status) === 7;
    
    return (
    <TouchableOpacity
      style={[
        styles.orderItem,
        isCompleted && styles.completedOrderItem
      ]}
      onPress={() => navigation.navigate('OrderDetail', {orderId: item._id})}>
      <View style={styles.orderHeader}>
        <View style={styles.orderInfo}>
          <Text style={styles.customerName}>
            {item.id_address?.fullName || 'Không có tên'}
          </Text>
          <Text style={[styles.orderStatus, {color: getStatusColor(item.status)}]}>
            {getStatusText(item.status)}
          </Text>
        </View>
        <Icon name="chevron-right" size={24} color="#666" />
      </View>

      <View style={styles.orderDetails}>
        <View style={styles.detailRow}>
          <Icon name="location-on" size={16} color="#666" />
          <Text style={styles.detailText} numberOfLines={2}>
            {item.id_address?.addressDetail || 'Không có địa chỉ'}
          </Text>
        </View>

                 <View style={styles.detailRow}>
           <Icon name="phone" size={16} color="#666" />
           <TouchableOpacity
             onPress={() => handleCallPhone(item.id_address?.phone_number)}
             style={styles.phoneContainer}>
             <Text style={[styles.detailText, styles.phoneText]}>
               {item.id_address?.phone_number || 'Không có số điện thoại'}
             </Text>
             {item.id_address?.phone_number && (
               <Icon name="call" size={16} color="#4CAF50" style={styles.callIcon} />
             )}
           </TouchableOpacity>
         </View>

                 <View style={styles.detailRow}>
           <Icon name="account-balance-wallet" size={16} color="#666" />
           <Text style={styles.amountText}>
             Thu hộ: {formatCurrency(item.payment_method === "COD" ? item.total_amount : 0)}
           </Text>
         </View>

                 <View style={styles.detailRow}>
           <Icon name="directions" size={16} color="#666" />
           <TouchableOpacity
             onPress={() => handleOpenMaps(item.id_address)}
             style={styles.mapsContainer}>
             <Text style={[styles.detailText, styles.mapsText]}>
               Chỉ đường bằng maps
             </Text>
             <Icon name="launch" size={16} color="#2196F3" style={styles.mapsIcon} />
           </TouchableOpacity>
         </View>
      </View>

      <View style={styles.orderFooter}>
        <View style={styles.orderInfo}>
          <Text style={styles.orderDate}>
            {new Date(item.createdAt).toLocaleDateString('vi-VN')}
          </Text>
          <Text style={styles.orderCode}>
            #{item._id.slice(-8).toUpperCase()}
          </Text>
        </View>
        {[2, 3, 4, 5, 6].includes(parseInt(item.status)) && !isCompleted && (
          <TouchableOpacity 
            style={[styles.completeButton, processingOrder === item._id && styles.completeButtonDisabled]}
            onPress={() => handleCompleteOrder(item._id, `#${item._id.slice(-8).toUpperCase()}`)}
            disabled={processingOrder === item._id}
          >
            {processingOrder === item._id ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Icon name="check-circle" size={16} color="white" />
            )}
            <Text style={styles.completeButtonText}>
              {processingOrder === item._id ? 'Đang xử lý...' : 'Hoàn thành'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Icon name="local-shipping" size={64} color="#ccc" />
      <Text style={styles.emptyStateTitle}>Không có đơn hàng</Text>
      <Text style={styles.emptyStateSubtitle}>
        Hiện tại không có đơn hàng nào đang hoạt động trong khu vực của bạn
      </Text>
    </View>
  );

  const renderErrorState = () => (
    <View style={styles.emptyState}>
      <Icon name="error-outline" size={64} color="#f44336" />
      <Text style={styles.emptyStateTitle}>Có lỗi xảy ra</Text>
      <Text style={styles.emptyStateSubtitle}>{error}</Text>
      <TouchableOpacity style={styles.retryButton} onPress={fetchOrdersByArea}>
        <Text style={styles.retryButtonText}>Thử lại</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#FF6B35" />

      {/* Header */}
      <LinearGradient
        colors={['#FF6B35', '#FF8E53']}
        style={styles.header}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}>
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
                     <Text style={styles.headerTitle}>Đơn hàng đang hoạt động</Text>
          <View style={styles.headerRight}>
            <Text style={styles.areaText}>{user?.address_shipping}</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Content */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF6B35" />
          <Text style={styles.loadingText}>Đang tải danh sách đơn hàng...</Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          renderItem={renderOrderItem}
          keyExtractor={item => item._id}
          style={styles.list}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={error ? renderErrorState : renderEmptyState}
                     ListHeaderComponent={
             <View style={styles.listHeader}>
               <Text style={styles.listHeaderTitle}>
                 Tổng cộng: {orders.length} đơn hàng đang hoạt động
               </Text>
             </View>
           }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    flex: 1,
    textAlign: 'center',
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  areaText: {
    fontSize: 12,
    color: 'white',
    opacity: 0.9,
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: 15,
  },
  listHeader: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  listHeaderTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  orderItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  completedOrderItem: {
    backgroundColor: '#E8F5E8', // Màu nền xanh nhạt cho đơn hàng đã hoàn thành
    borderLeftWidth: 4,
    borderLeftColor: '#00BCD4', // Viền bên trái màu cyan
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  orderInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  orderStatus: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '500',
  },
  orderDetails: {
    marginBottom: 10,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    flex: 1,
  },
  amountText: {
    fontSize: 14,
    color: '#FF6B35',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  orderInfo: {
    flex: 1,
  },
  orderDate: {
    fontSize: 12,
    color: '#999',
  },
  orderCode: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  completeButton: {
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  completeButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  completeButtonDisabled: {
    backgroundColor: '#ccc',
    opacity: 0.7,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 15,
    marginBottom: 5,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    paddingHorizontal: 30,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 15,
  },
  retryButton: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 15,
  },
     retryButtonText: {
     color: 'white',
     fontSize: 14,
     fontWeight: 'bold',
   },
   phoneContainer: {
     flexDirection: 'row',
     alignItems: 'center',
     flex: 1,
   },
   phoneText: {
     color: '#4CAF50',
     textDecorationLine: 'underline',
   },
   callIcon: {
     marginLeft: 8,
   },
   mapsContainer: {
     flexDirection: 'row',
     alignItems: 'center',
     flex: 1,
   },
   mapsText: {
     color: '#2196F3',
     textDecorationLine: 'underline',
   },
   mapsIcon: {
     marginLeft: 8,
   },
});

export default OrderListScreen;
