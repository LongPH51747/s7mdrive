import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
  RefreshControl,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useNavigation} from '@react-navigation/native';
import {useAuth} from '../../hooks/useAuth';
import {orderService} from '../../services';

const OrderListScreen = () => {
  const navigation = useNavigation();
  const {user} = useAuth();
  const [orders, setOrders] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      let orders = [];

      if (user?.role === 'shipper') {
        // Lấy đơn hàng của shipper và đơn hàng chờ xử lý
        const shipperOrders = await orderService.getOrdersByShipper(user.id);
        const pendingOrders = await orderService.getPendingOrders();

        // Gộp và loại bỏ duplicate
        const allOrders = [...shipperOrders, ...pendingOrders];
        orders = allOrders.filter(
          (order, index, self) =>
            index === self.findIndex(o => o.id === order.id),
        );
      } else {
        // Admin xem tất cả đơn hàng
        orders = await orderService.getOrders();
      }

      setOrders(orders);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchOrders();
    setRefreshing(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return '#FF9800';
      case 'confirmed':
        return '#2196F3';
      case 'delivering':
        return '#FF5722';
      case 'completed':
        return '#4CAF50';
      case 'cancelled':
        return '#F44336';
      default:
        return '#999';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending':
        return 'Chờ xử lý';
      case 'confirmed':
        return 'Đã xác nhận';
      case 'delivering':
        return 'Đang giao';
      case 'completed':
        return 'Hoàn thành';
      case 'cancelled':
        return 'Đã hủy';
      default:
        return status;
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true;
    return order.status === filter;
  });

  const FilterButton = ({title, value, active}) => (
    <TouchableOpacity
      style={[styles.filterButton, active && styles.filterButtonActive]}
      onPress={() => setFilter(value)}>
      <Text
        style={[
          styles.filterButtonText,
          active && styles.filterButtonTextActive,
        ]}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  const OrderCard = ({item}) => (
    <TouchableOpacity
      style={styles.orderCard}
      onPress={() => navigation.navigate('OrderDetail', {orderId: item.id})}>
      <View style={styles.orderHeader}>
        <Text style={styles.orderCode}>{item.order_code}</Text>
        <View
          style={[
            styles.statusBadge,
            {backgroundColor: getStatusColor(item.status)},
          ]}>
          <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
        </View>
      </View>

      <View style={styles.orderInfo}>
        <View style={styles.orderInfoRow}>
          <Icon name="person" size={16} color="#666" />
          <Text style={styles.orderInfoText}>{item.customer_name}</Text>
        </View>
        <View style={styles.orderInfoRow}>
          <Icon name="phone" size={16} color="#666" />
          <Text style={styles.orderInfoText}>{item.customer_phone}</Text>
        </View>
      </View>

      <View style={styles.addressContainer}>
        <View style={styles.addressRow}>
          <Icon name="my-location" size={16} color="#FF6B35" />
          <Text style={styles.addressText} numberOfLines={1}>
            {item.pickup_address}
          </Text>
        </View>
        <View style={styles.addressDivider}>
          <View style={styles.dottedLine} />
        </View>
        <View style={styles.addressRow}>
          <Icon name="location-on" size={16} color="#4CAF50" />
          <Text style={styles.addressText} numberOfLines={1}>
            {item.delivery_address}
          </Text>
        </View>
      </View>

      <View style={styles.orderFooter}>
        <View style={styles.orderFooterLeft}>
          <Text style={styles.orderValue}>
            {formatCurrency(item.total_value)}
          </Text>
          <Text style={styles.orderDate}>{formatDate(item.created_at)}</Text>
        </View>
        <View style={styles.orderFooterRight}>
          <Text style={styles.estimatedTime}>~{item.estimated_time} phút</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#FF6B35" />

      {/* Header */}
      <LinearGradient colors={['#FF6B35', '#FF8E53']} style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Danh sách đơn hàng</Text>
          {user?.role === 'admin' && (
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => navigation.navigate('CreateOrder')}>
              <Icon name="add" size={24} color="white" />
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>

      {/* Filter buttons */}
      <View style={styles.filterContainer}>
        <FilterButton title="Tất cả" value="all" active={filter === 'all'} />
        <FilterButton
          title="Chờ xử lý"
          value="pending"
          active={filter === 'pending'}
        />
        <FilterButton
          title="Đang giao"
          value="delivering"
          active={filter === 'delivering'}
        />
        <FilterButton
          title="Hoàn thành"
          value="completed"
          active={filter === 'completed'}
        />
      </View>

      {/* Orders list */}
      <FlatList
        data={filteredOrders}
        keyExtractor={item => item.id.toString()}
        renderItem={OrderCard}
        style={styles.ordersList}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="assignment" size={64} color="#ccc" />
            <Text style={styles.emptyText}>Không có đơn hàng nào</Text>
          </View>
        }
      />
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
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    marginHorizontal: 15,
    marginTop: -10,
    marginBottom: 10,
    borderRadius: 15,
    padding: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: '#FF6B35',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: 'white',
    fontWeight: 'bold',
  },
  ordersList: {
    flex: 1,
    paddingHorizontal: 15,
  },
  orderCard: {
    backgroundColor: 'white',
    borderRadius: 15,
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
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  orderCode: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  orderInfo: {
    marginBottom: 15,
  },
  orderInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  orderInfoText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
  addressContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    padding: 12,
    marginBottom: 15,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addressText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  addressDivider: {
    alignItems: 'center',
    marginVertical: 8,
  },
  dottedLine: {
    width: 2,
    height: 20,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#ccc',
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderFooterLeft: {
    flex: 1,
  },
  orderValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 2,
  },
  orderDate: {
    fontSize: 12,
    color: '#999',
  },
  orderFooterRight: {
    alignItems: 'flex-end',
  },
  estimatedTime: {
    fontSize: 14,
    color: '#FF6B35',
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 15,
  },
});

export default OrderListScreen;
