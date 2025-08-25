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
  const [activeTab, setActiveTab] = useState('delivery'); // 'delivery' hoặc 'receive'

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

  // useEffect riêng để theo dõi thay đổi tab
  useEffect(() => {
    if (isCheckedIn && !checkInLoading) {
      console.log('🔄 useEffect: Tab thay đổi, gọi fetchOrdersByArea với tab:', activeTab);
      fetchOrdersByArea();
    }
  }, [activeTab]);

  const fetchOrdersByArea = async () => {
    try {
      console.log('🔄 fetchOrdersByArea: Bắt đầu fetch orders...');
      console.log('🔄 fetchOrdersByArea: Tab hiện tại:', activeTab);
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
      
      // Lọc đơn hàng theo tab hiện tại
      let filteredOrders;
      if (activeTab === 'delivery') {
        // Tab "Đơn giao": trạng thái 4, 6, 7, 9
        console.log('🔄 fetchOrdersByArea: Đang lọc cho tab "Đơn giao" (status: 4,6,7,9)');
        filteredOrders = ordersArray.filter(order => {
          const status = parseInt(order.status);
          const isValidStatus = status === 4 || status === 6 || status === 7 || status === 9;
          console.log(`🔄 Order ${order._id}: status=${status}, isValid=${isValidStatus}`);
          return isValidStatus;
        });
      } else {
        // Tab "Đơn nhận": trạng thái 14, 15
        console.log('🔄 fetchOrdersByArea: Đang lọc cho tab "Đơn nhận" (status: 14,15)');
        filteredOrders = ordersArray.filter(order => {
          const status = parseInt(order.status);
          const isValidStatus = status === 14 || status === 15;
          console.log(`🔄 Order ${order._id}: status=${status}, isValid=${isValidStatus}`);
          return isValidStatus;
        });
      }
      
      console.log('🔄 fetchOrdersByArea: Orders trước khi filter:', ordersArray.length);
      console.log('🔄 fetchOrdersByArea: Orders sau khi filter:', filteredOrders.length);
      console.log('🔄 fetchOrdersByArea: Filtered orders:', filteredOrders);
      
      setOrders(filteredOrders);
      
      console.log('Orders fetched:', ordersArray.length, 'Filtered orders:', filteredOrders.length);
      console.log('Filtered orders:', filteredOrders);
    } catch (error) {
      console.error('Error fetching orders by area:', error);
      setError('Không thể tải danh sách đơn hàng');
    } finally {
      setLoading(false);
      console.log('🔄 fetchOrdersByArea: Kết thúc fetch orders');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchOrdersByArea();
    setRefreshing(false);
  };

  // Hàm chuyển tab
  const handleTabChange = (tab) => {
    console.log('🔄 handleTabChange: Chuyển từ tab', activeTab, 'sang tab', tab);
    setActiveTab(tab);
    // Không cần gọi fetchOrdersByArea ở đây nữa, useEffect sẽ tự động gọi
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
      7: 'Giao thành công',
      9: 'Đơn hàng mới',
      14: 'Hoàn hàng',
      15: 'Đơn hàng đã nhận'
    };
    return statusMap[status] || `Trạng thái ${status}`;
  };

  const getStatusColor = (status) => {
    const colorMap = {
      2: '#FF9800', // Orange - Đã xác nhận
      3: '#2196F3', // Blue - Rời kho
      4: '#4CAF50', // Green - Tới bưu cục
      5: '#FF5722', // Deep Orange - Shipper nhận hàng
      6: '#4CAF50', // Green - Đang giao
      7: '#00BCD4', // Cyan - Giao thành công
      9: '#FF9800', // Orange - Đơn hàng mới
      14: '#9C27B0', // Purple - Hoàn hàng
      15: '#4CAF50'  // Green - Đơn hàng đã nhận
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

  const handleReceiveOrder = async (orderId) => {
    try {
      console.log('📦 OrderListScreen: Bắt đầu nhận đơn hàng:', orderId);
      console.log('📦 OrderListScreen: User ID:', user.id);
      console.log('📦 OrderListScreen: User object:', user);
      setProcessingOrder(orderId);
      
      // Gọi API cập nhật trạng thái đơn hàng thông qua orderService
      console.log('📦 OrderListScreen: Gọi orderService.receiveOrder...');
      const result = await orderService.receiveOrder(orderId, user.id);
      
      console.log('📦 OrderListScreen: Kết quả từ orderService:', result);
      console.log('📦 OrderListScreen: Result success:', result.success);
      console.log('📦 OrderListScreen: Result data:', result.data);
      console.log('📦 OrderListScreen: Result message:', result.message);
      
      if (result.success) {
        console.log('✅ Đơn hàng đã được nhận thành công:', result.data);
        console.log('✅ Sẽ refresh danh sách đơn hàng...');
        
        Alert.alert(
          'Thành công',
          'Đơn hàng đã được nhận thành công!',
          [
            {
              text: 'OK',
              onPress: () => {
                console.log('✅ User click OK, bắt đầu refresh danh sách...');
                // Refresh danh sách đơn hàng
                fetchOrdersByArea();
              }
            }
          ]
        );
      } else {
        console.error('❌ Lỗi khi nhận đơn hàng:', result.message);
        console.error('❌ Error details:', result.error);
        console.error('❌ Status code:', result.status);
        
        Alert.alert('Lỗi', `Không thể nhận đơn hàng: ${result.message}`);
      }
    } catch (error) {
      console.error('❌ Lỗi không mong muốn khi nhận đơn hàng:', error);
      console.error('❌ Error stack:', error.stack);
      Alert.alert('Lỗi', 'Có lỗi xảy ra khi nhận đơn hàng');
    } finally {
      console.log('📦 OrderListScreen: Kết thúc xử lý, set processingOrder = null');
      setProcessingOrder(null);
    }
  };

  const handleCancelOrder = (orderId) => {
    Alert.alert(
      'Xác nhận hủy',
      'Bạn có chắc chắn muốn hủy đơn hàng này?',
      [
        {
          text: 'Không',
          style: 'cancel',
        },
        {
          text: 'Có',
          onPress: () => {
            console.log('Hủy đơn hàng:', orderId);
            // TODO: Implement cancel order functionality
            Alert.alert('Thông báo', 'Chức năng hủy đơn hàng sẽ được cập nhật sau');
          },
        },
      ]
    );
  };

  const handleAddNote = (orderId) => {
    console.log('Thêm ghi chú cho đơn hàng:', orderId);
    // TODO: Implement add note functionality
    Alert.alert('Thông báo', 'Chức năng thêm ghi chú sẽ được cập nhật sau');
  };

  // Hàm nhận tất cả đơn hàng trạng thái 4
  const handleReceiveAllOrders = async () => {
    try {
      // Lọc ra tất cả đơn hàng trạng thái 4
      const status4Orders = orders.filter(order => parseInt(order.status) === 4);
      
      if (status4Orders.length === 0) {
        Alert.alert('Thông báo', 'Không có đơn hàng nào để nhận');
        return;
      }

      console.log('📦 handleReceiveAllOrders: Bắt đầu nhận tất cả đơn hàng trạng thái 4');
      console.log('📦 Số lượng đơn hàng cần nhận:', status4Orders.length);
      console.log('📦 Danh sách ID đơn hàng:', status4Orders.map(o => o._id));
      
      // Hiển thị xác nhận
      Alert.alert(
        'Xác nhận nhận đơn',
        `Bạn có chắc chắn muốn nhận ${status4Orders.length} đơn hàng?`,
        [
          {
            text: 'Hủy',
            style: 'cancel',
          },
          {
            text: 'Nhận tất cả',
            onPress: async () => {
              try {
                setProcessingOrder('all'); // Đánh dấu đang xử lý
                
                // Gọi API nhận tất cả đơn hàng thông qua orderService
                const result = await orderService.receiveAllOrders(
                  user.id, 
                  status4Orders.map(order => order._id)
                );
                
                console.log('📦 OrderListScreen: Kết quả từ orderService:', result);
                
                if (result.success) {
                  console.log('✅ Nhận tất cả đơn hàng thành công:', result.data);
                  
                  Alert.alert(
                    'Thành công',
                    `Đã nhận thành công ${status4Orders.length} đơn hàng!`,
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
                  console.error('❌ Lỗi khi nhận tất cả đơn hàng:', result.message);
                  console.error('❌ Error details:', result.error);
                  console.error('❌ Status code:', result.status);
                  
                  Alert.alert('Lỗi', `Không thể nhận tất cả đơn hàng: ${result.message}`);
                }
              } catch (error) {
                console.error('❌ Lỗi khi nhận tất cả đơn hàng:', error);
                Alert.alert('Lỗi', 'Có lỗi xảy ra khi nhận tất cả đơn hàng');
              } finally {
                setProcessingOrder(null);
              }
            },
          },
        ]
      );
    } catch (error) {
      console.error('❌ Lỗi không mong muốn:', error);
      Alert.alert('Lỗi', 'Có lỗi xảy ra');
    }
  };

  const renderOrderItem = ({item}) => {
    const orderStatus = parseInt(item.status);
    const isStatus4 = orderStatus === 4;
    const isStatus6 = orderStatus === 6;
    const isStatus14 = orderStatus === 14;
    
    return (
    <TouchableOpacity
      style={[
        styles.orderItem,
        isStatus4 && styles.status4OrderItem,
        isStatus6 && styles.status6OrderItem,
        isStatus14 && styles.status14OrderItem
      ]}
      onPress={() => {
        // Cho phép click vào đơn hàng trạng thái 6 và 14
        if (isStatus6 || isStatus14) {
          navigation.navigate('OrderDetail', {orderId: item._id});
        }
      }}
      disabled={isStatus4}>
      <View style={styles.orderHeader}>
        <View style={styles.orderInfo}>
          <Text style={styles.customerName}>
            {item.id_address?.fullName || 'Không có tên'}
          </Text>
          <Text style={[styles.orderStatus, {color: getStatusColor(item.status)}]}>
            {getStatusText(item.status)}
          </Text>
        </View>
        {(isStatus6 || isStatus14) && <Text style={styles.chevronIcon}>→</Text>}
      </View>

      <View style={styles.orderDetails}>
        <View style={styles.detailRow}>
          <Text style={styles.iconText}>📍</Text>
          <TouchableOpacity
            onPress={() => handleOpenMaps(item.id_address)}
            style={styles.addressContainer}>
            <Text style={[styles.detailText, styles.addressText]} numberOfLines={2}>
              {item.id_address?.addressDetail || 'Không có địa chỉ'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.iconText}>📞</Text>
          {(isStatus6 || isStatus14) ? (
            <TouchableOpacity
              onPress={() => handleCallPhone(item.id_address?.phone_number)}
              style={styles.phoneContainer}>
              <Text style={[styles.detailText, styles.phoneText]}>
                {item.id_address?.phone_number || 'Không có số điện thoại'}
              </Text>
            </TouchableOpacity>
          ) : (
            <Text style={styles.detailText}>
              {item.id_address?.phone_number || 'Không có số điện thoại'}
            </Text>
          )}
        </View>

        {/* Chỉ hiển thị thu hộ cho trạng thái 4, 6, 7, không hiển thị cho trạng thái 14 */}
        {(isStatus4 || isStatus6 || orderStatus === 7) && (
          <View style={styles.detailRow}>
            <Text style={styles.iconText}>💰</Text>
            <Text style={styles.amountText}>
              Thu hộ: {formatCurrency(item.payment_method === "COD" ? item.total_amount : 0)}
            </Text>
          </View>
        )}

        {/* Ghi chú từ user - luôn hiển thị */}
        <View style={styles.detailRow}>
          <Text style={styles.iconText}>📝</Text>
          <Text style={styles.detailText} numberOfLines={3}>
            Ghi chú: {item.user_note || 'Không có ghi chú'}
          </Text>
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
        
        {/* Button cho đơn hàng trạng thái 4 */}
        {isStatus4 && (
          <TouchableOpacity 
            style={[styles.receiveButton, processingOrder === item._id && styles.receiveButtonDisabled]}
            onPress={() => handleReceiveOrder(item._id)}
            disabled={processingOrder === item._id}
          >
            {processingOrder === item._id ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text style={styles.receiveButtonText}>📦</Text>
            )}
            <Text style={styles.receiveButtonText}>
              {processingOrder === item._id ? 'Đang xử lý...' : 'Nhận đơn'}
            </Text>
          </TouchableOpacity>
        )}

        {/* Buttons cho đơn hàng trạng thái 6 */}
        {isStatus6 && (
          <View style={styles.status6Buttons}>
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={() => handleCancelOrder(item._id)}
            >
              <Text style={styles.cancelButtonText}>❌</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.noteButton}
              onPress={() => handleAddNote(item._id)}
            >
              <Text style={styles.noteButtonText}>📝</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.completeButton, processingOrder === item._id && styles.completeButtonDisabled]}
              onPress={() => handleCompleteOrder(item._id, `#${item._id.slice(-8).toUpperCase()}`)}
              disabled={processingOrder === item._id}
            >
              {processingOrder === item._id ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text style={styles.checkIcon}>✅</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Button "Nhận hàng" cho đơn hàng trạng thái 14 */}
        {isStatus14 && (
          <TouchableOpacity 
            style={styles.receiveItemButton}
            onPress={() => {
              console.log('Nhận hàng cho đơn hàng:', item._id);
              // TODO: Implement receive item functionality
              Alert.alert('Thông báo', 'Chức năng nhận hàng sẽ được cập nhật sau');
            }}
          >
            <Text style={styles.receiveItemButtonText}>📦</Text>
            <Text style={styles.receiveItemButtonText}>Nhận hàng</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateIcon}>🚚</Text>
      <Text style={styles.emptyStateTitle}>Không có đơn hàng</Text>
      <Text style={styles.emptyStateSubtitle}>
        Hiện tại không có đơn hàng nào đang hoạt động trong khu vực của bạn
      </Text>
    </View>
  );

  const renderErrorState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateIcon}>❌</Text>
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
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Quản lý đơn hàng</Text>
          <View style={styles.headerRight}>
            <Text style={styles.areaText}>{user?.address_shipping}</Text>
          </View>
        </View>
        
        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'delivery' && styles.activeTabButton]}
            onPress={() => handleTabChange('delivery')}>
            <Text style={[styles.tabText, activeTab === 'delivery' && styles.activeTabText]}>
              Đơn giao
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'receive' && styles.activeTabButton]}
            onPress={() => handleTabChange('receive')}>
            <Text style={[styles.tabText, activeTab === 'receive' && styles.activeTabText]}>
              Đơn nhận
            </Text>
          </TouchableOpacity>
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
                 {activeTab === 'delivery' 
                   ? `Tổng cộng: ${orders.length} đơn hàng giao` 
                   : `Tổng cộng: ${orders.length} đơn hàng nhận`
                 }
               </Text>
             </View>
           }
        />
      )}

      {/* FAB Nhận tất cả - chỉ hiển thị ở tab Đơn giao và có đơn hàng trạng thái 4 */}
      {activeTab === 'delivery' && orders.some(order => parseInt(order.status) === 4) && (
        <TouchableOpacity
          style={[styles.fab, processingOrder === 'all' && styles.fabDisabled]}
          onPress={handleReceiveAllOrders}
          disabled={processingOrder === 'all'}>
          {processingOrder === 'all' ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <>
              <Text style={styles.fabIcon}>📦</Text>
              <Text style={styles.fabText}>Nhận tất cả đơn hàng</Text>
            </>
          )}
        </TouchableOpacity>
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
  backButtonText: {
    fontSize: 24,
    color: 'white',
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
    backgroundColor: '#E8F5E8',
    borderLeftWidth: 4,
    borderLeftColor: '#00BCD4',
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
  chevronIcon: {
    fontSize: 24,
    color: '#666',
    fontWeight: 'bold',
  },
  orderDetails: {
    marginBottom: 10,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  iconText: {
    fontSize: 14,
    marginRight: 8,
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
    backgroundColor: '#C8E6C9', // Light green background
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 18,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    width: 50,
    height: 35,
  },
  checkIcon: {
    fontSize: 16,
    marginRight: 8,
    color: '#2E7D32', // Darker green text
  },
  completeButtonText: {
    color: '#2E7D32', // Darker green text
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
  emptyStateIcon: {
    fontSize: 50,
    marginBottom: 15,
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
   addressContainer: {
     flex: 1,
   },
   addressText: {
     color: '#2196F3',
     textDecorationLine: 'underline',
   },
   receiveButton: {
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
   receiveButtonText: {
     color: 'white',
     fontSize: 12,
     fontWeight: 'bold',
     marginLeft: 4,
   },
   receiveButtonDisabled: {
     backgroundColor: '#ccc',
     opacity: 0.7,
   },
   status6Buttons: {
     flexDirection: 'row',
     justifyContent: 'space-between',
     marginTop: 10,
     paddingHorizontal: 10,
     gap: 15,
   },
   cancelButton: {
     backgroundColor: '#FFCDD2', // Light red background
     alignItems: 'center',
     justifyContent: 'center',
     width: 55,
     height: 38,
     borderRadius: 19,
     shadowColor: '#000',
     shadowOffset: {
       width: 0,
       height: 2,
     },
     shadowOpacity: 0.1,
     shadowRadius: 3,
     elevation: 2,
   },
   cancelButtonText: {
     fontSize: 16,
     color: '#D32F2F', // Darker red text
     fontWeight: 'bold',
   },
   noteButton: {
     backgroundColor: '#E3F2FD', // Light blue background
     alignItems: 'center',
     justifyContent: 'center',
     width: 55,
     height: 38,
     borderRadius: 19,
     shadowColor: '#000',
     shadowOffset: {
       width: 0,
       height: 2,
     },
     shadowOpacity: 0.1,
     shadowRadius: 3,
     elevation: 2,
   },
   noteButtonText: {
     fontSize: 16,
     color: '#1976D2', // Darker blue text
     fontWeight: 'bold',
   },
   completeButton: {
     backgroundColor: '#C8E6C9', // Light green background
     flexDirection: 'row',
     alignItems: 'center',
     justifyContent: 'center',
     paddingHorizontal: 16,
     paddingVertical: 8,
     borderRadius: 19,
     shadowColor: '#000',
     shadowOffset: {
       width: 0,
       height: 2,
     },
     shadowOpacity: 0.1,
     shadowRadius: 3,
     elevation: 2,
     width: 55,
     height: 38,
   },
   status4OrderItem: {
     backgroundColor: '#E8F5E8', // Light green for status 4
     borderLeftWidth: 4,
     borderLeftColor: '#4CAF50',
   },
   status6OrderItem: {
     backgroundColor: '#F0F8FF', // Light blue for status 6
     borderLeftWidth: 4,
     borderLeftColor: '#2196F3',
   },
   status14OrderItem: {
     backgroundColor: '#F0F8FF', // Light blue for status 14
     borderLeftWidth: 4,
     borderLeftColor: '#2196F3',
   },
   status14Info: {
     marginTop: 10,
     alignItems: 'center',
   },
   status14Text: {
     fontSize: 14,
     color: '#2196F3',
     fontWeight: 'bold',
   },
   tabContainer: {
     flexDirection: 'row',
     justifyContent: 'space-around',
     backgroundColor: 'rgba(255,255,255,0.2)',
     borderRadius: 20,
     marginTop: 10,
     paddingVertical: 5,
     paddingHorizontal: 10,
   },
   tabButton: {
     paddingVertical: 8,
     paddingHorizontal: 15,
     borderRadius: 15,
   },
   activeTabButton: {
     backgroundColor: 'white',
     shadowColor: '#000',
     shadowOffset: { width: 0, height: 2 },
     shadowOpacity: 0.2,
     shadowRadius: 4,
     elevation: 3,
   },
   tabText: {
     fontSize: 14,
     fontWeight: 'bold',
     color: 'white',
   },
   activeTabText: {
     color: '#FF6B35',
   },
   fab: {
     position: 'absolute',
     bottom: 20,
     left: 20,
     right: 20,
     backgroundColor: '#FF6B35',
     borderRadius: 25,
     height: 50,
     justifyContent: 'center',
     alignItems: 'center',
     flexDirection: 'row',
     shadowColor: '#000',
     shadowOffset: { width: 0, height: 2 },
     shadowOpacity: 0.2,
     shadowRadius: 4,
     elevation: 5,
   },
   fabDisabled: {
     backgroundColor: '#ccc',
     opacity: 0.7,
   },
   fabIcon: {
     fontSize: 20,
     color: 'white',
     marginRight: 10,
   },
   fabText: {
     fontSize: 16,
     color: 'white',
     fontWeight: 'bold',
   },
   receiveItemButton: {
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
     marginTop: 10,
   },
   receiveItemButtonText: {
     color: 'white',
     fontSize: 12,
     fontWeight: 'bold',
     marginLeft: 4,
   },
});

export default OrderListScreen;
