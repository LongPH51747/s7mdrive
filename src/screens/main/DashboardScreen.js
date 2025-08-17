import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  RefreshControl,
  Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useAuth} from '../../hooks/useAuth';
import {useCheckIn} from '../../hooks/useCheckIn';
import {useNavigation} from '@react-navigation/native';
import {statisticsService, orderService} from '../../services';

const DashboardScreen = () => {
  const {user} = useAuth();
  const {isCheckedIn, refreshCheckInStatus} = useCheckIn();
  const navigation = useNavigation();
  const [statistics, setStatistics] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [orderCount, setOrderCount] = useState(0);

  useEffect(() => {
    fetchStatistics();
    if (isCheckedIn) {
      fetchOrderCount();
    }
  }, [isCheckedIn]);

  const fetchStatistics = async () => {
    try {
      const data = await statisticsService.getStatistics();
      if (data) {
        setStatistics(data);
      } else {
        // Fallback: tính toán từ đơn hàng nếu API không có data
        // Lấy thông tin khu vực từ user
        const province = user?.post_office_name || 'Hà Nội';
        const ward = user?.address_shipping?.split(',')[0] || 'Xuân Phương';
        
        const calculatedStats =
          await statisticsService.calculateStatisticsFromOrders(province, ward);
        if (calculatedStats) {
          setStatistics(calculatedStats);
        }
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  const fetchOrderCount = async () => {
    try {
      // Lấy thông tin khu vực từ user
      const province = user?.post_office_name || 'Hà Nội';
      const ward = user?.address_shipping?.split(',')[0] || 'Xuân Phương';
      
      console.log('📊 Fetching order count for area:', {ward, province});
      
      const data = await orderService.getOrdersByArea(province, ward);
      
      // Đảm bảo data là array
      const ordersArray = Array.isArray(data) ? data : [];
      
      // Lọc chỉ những đơn hàng có trạng thái số: 2, 3, 4, 5, 6
      const activeOrders = ordersArray.filter(order => {
        const status = parseInt(order.status);
        return [2, 3, 4, 5, 6].includes(status);
      });
      
      setOrderCount(activeOrders.length);
      console.log('📊 Order count updated:', activeOrders.length);
    } catch (error) {
      console.error('Error fetching order count:', error);
      setOrderCount(0);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      fetchStatistics(),
      refreshCheckInStatus(),
      isCheckedIn ? fetchOrderCount() : Promise.resolve()
    ]);
    setRefreshing(false);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Chào buổi sáng';
    if (hour < 18) return 'Chào buổi chiều';
    return 'Chào buổi tối';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const handleOrderListPress = () => {
    if (!isCheckedIn) {
      Alert.alert(
        'Yêu cầu Check-in',
        'Bạn cần check in để tiếp tục làm việc',
        [
          {
            text: 'Hủy',
            style: 'cancel',
          },
          {
            text: 'Check-in ngay',
            onPress: () => navigation.navigate('CheckIn'),
          },
        ]
      );
      return;
    }
    navigation.navigate('OrderList');
  };

  const handleOrdersPress = () => {
    if (!isCheckedIn) {
      Alert.alert(
        'Yêu cầu Check-in',
        'Bạn cần check in để tiếp tục làm việc',
        [
          {
            text: 'Hủy',
            style: 'cancel',
          },
          {
            text: 'Check-in ngay',
            onPress: () => navigation.navigate('CheckIn'),
          },
        ]
      );
      return;
    }
    navigation.navigate('Orders');
  };

  const QuickActionButton = ({title, onPress, color}) => (
    <TouchableOpacity
      style={[styles.quickActionButton, {backgroundColor: color}]}
      onPress={onPress}>
      <Text style={styles.quickActionText}>{title}</Text>
    </TouchableOpacity>
  );

  const StatCard = ({title, value, subtitle, color}) => (
    <View style={[styles.statCard, {borderLeftColor: color}]}>
      <View style={styles.statCardContent}>
        <View style={styles.statCardLeft}>
          <Text style={styles.statCardTitle}>{title}</Text>
          <Text style={[styles.statCardValue, {color}]}>{value}</Text>
          <Text style={styles.statCardSubtitle}>{subtitle}</Text>
        </View>
      </View>
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
          <View style={styles.headerLeft}>
            <Text style={styles.greeting}>{getGreeting()}</Text>
            <Text style={styles.userName}>{user?.name}</Text>
            <Text style={styles.userInfo}>
              {user?.post_office_name} • {user?.address_shipping}
            </Text>
          </View>
          <TouchableOpacity style={styles.notificationButton}>
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationBadgeText}>3</Text>
            </View>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        {/* Thống kê tổng quan */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Thống kê hôm nay</Text>
            <View style={[styles.checkInIndicator, {backgroundColor: isCheckedIn ? '#4CAF50' : '#FF5722'}]}>
              <Icon name={isCheckedIn ? 'check-circle' : 'schedule'} size={16} color="white" />
              <Text style={styles.checkInText}>{isCheckedIn ? 'Đã check-in' : 'Chưa check-in'}</Text>
            </View>
          </View>
          <View style={styles.statsGrid}>
            <TouchableOpacity
              onPress={handleOrderListPress}
              style={{flex: 1}}>
              <StatCard
                title="Chuyến đi"
                value={orderCount}
                subtitle="đơn"
                color="#4CAF50"
              />
            </TouchableOpacity>
            <View style={{flex: 1}}>
              <StatCard
                title="Năng suất"
                value={statistics?.today.completed || 0}
                subtitle="%"
                color="#2196F3"
              />
            </View>
            <View style={{flex: 1}}>
              <StatCard
                title="Thu nhập"
                value={statistics?.today.revenue || 0}
                subtitle="VND"
                color="#FF9800"
              />
            </View>
          </View>
        </View>

        {/* Menu nhanh giống GHN */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Menu chức năng</Text>
          <View style={styles.quickActionsGrid}>
            <QuickActionButton
              title="Bán hàng"
              color="#FF5722"
              onPress={handleOrdersPress}
            />
            <QuickActionButton
              title="Hỗ trợ khách hàng"
              color="#00BCD4"
              onPress={() => {}}
            />
            <QuickActionButton
              title="Quản lý địa điểm"
              color="#3F51B5"
              onPress={() => navigation.navigate('Map')}
            />
          </View>

          <View style={styles.quickActionsGrid}>
            <QuickActionButton
              title="Thêm đơn lẻ"
              color="#9C27B0"
              onPress={handleOrdersPress}
            />
            <QuickActionButton
              title="In vận đơn"
              color="#FF9800"
              onPress={() => {}}
            />
            <QuickActionButton
              title="Lịch sử nộp tiền"
              color="#607D8B"
              onPress={() => navigation.navigate('History')}
            />
          </View>

          <View style={styles.quickActionsGrid}>
            <QuickActionButton
              title="Thông báo"
              color="#F44336"
              onPress={() => {}}
            />
            <TouchableOpacity
              style={[styles.quickActionButton, styles.checkInButton]}
              onPress={() => navigation.navigate('CheckIn')}>
              <LinearGradient
                colors={['#4CAF50', '#66BB6A']}
                style={styles.checkInGradient}>
                <Text style={styles.quickActionText}>Check in</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        {/* Thống kê chi tiết */}
        {statistics && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Thống kê chi tiết</Text>
            <View style={styles.detailStatsContainer}>
              <View style={styles.detailStatRow}>
                <Text style={styles.detailStatLabel}>Đơn hàng tuần này:</Text>
                <Text style={styles.detailStatValue}>
                  {statistics.this_week.total_orders}
                </Text>
              </View>
              <View style={styles.detailStatRow}>
                <Text style={styles.detailStatLabel}>Đơn hàng tháng này:</Text>
                <Text style={styles.detailStatValue}>
                  {statistics.this_month.total_orders}
                </Text>
              </View>
              <View style={styles.detailStatRow}>
                <Text style={styles.detailStatLabel}>Doanh thu tháng:</Text>
                <Text style={[styles.detailStatValue, {color: '#4CAF50'}]}>
                  {formatCurrency(statistics.this_month.revenue)}
                </Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
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
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flex: 1,
  },
  greeting: {
    fontSize: 16,
    color: 'white',
    opacity: 0.9,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 5,
  },
  userInfo: {
    fontSize: 12,
    color: 'white',
    opacity: 0.8,
    marginTop: 3,
  },
  notificationButton: {
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#FF3D71',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    marginTop: -20,
  },
  section: {
    backgroundColor: 'white',
    marginHorizontal: 15,
    marginVertical: 10,
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  checkInIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  checkInText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 5,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fafafa',
    borderRadius: 12,
    padding: 15,
    marginHorizontal: 5,
    borderLeftWidth: 4,
  },
  statCardContent: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statCardLeft: {
    flex: 1,
    alignItems: 'center',
  },
  statCardTitle: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  statCardValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  statCardSubtitle: {
    fontSize: 10,
    color: '#999',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  quickActionButton: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
  },
  checkInButton: {
    overflow: 'hidden',
  },
  checkInGradient: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 15,
  },
  quickActionText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
    marginTop: 8,
    textAlign: 'center',
  },
  detailStatsContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    padding: 15,
  },
  detailStatRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  detailStatLabel: {
    fontSize: 14,
    color: '#666',
  },
  detailStatValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
});

export default DashboardScreen;
