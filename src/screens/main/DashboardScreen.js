import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  RefreshControl,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useAuth} from '../../hooks/useAuth';
import {useNavigation} from '@react-navigation/native';
import {statisticsService} from '../../services';

const DashboardScreen = () => {
  const {user} = useAuth();
  const navigation = useNavigation();
  const [statistics, setStatistics] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      const data = await statisticsService.getStatistics();
      if (data) {
        setStatistics(data);
      } else {
        // Fallback: tính toán từ đơn hàng nếu API không có data
        const calculatedStats =
          await statisticsService.calculateStatisticsFromOrders();
        if (calculatedStats) {
          setStatistics(calculatedStats);
        }
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchStatistics();
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

  const QuickActionButton = ({icon, title, onPress, color}) => (
    <TouchableOpacity
      style={[styles.quickActionButton, {backgroundColor: color}]}
      onPress={onPress}>
      <Icon name={icon} size={24} color="white" />
      <Text style={styles.quickActionText}>{title}</Text>
    </TouchableOpacity>
  );

  const StatCard = ({title, value, subtitle, icon, color}) => (
    <View style={[styles.statCard, {borderLeftColor: color}]}>
      <View style={styles.statCardContent}>
        <View style={styles.statCardLeft}>
          <Text style={styles.statCardTitle}>{title}</Text>
          <Text style={[styles.statCardValue, {color}]}>{value}</Text>
          <Text style={styles.statCardSubtitle}>{subtitle}</Text>
        </View>
        <View style={[styles.statCardIcon, {backgroundColor: color + '20'}]}>
          <Icon name={icon} size={24} color={color} />
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
          </View>
          <TouchableOpacity style={styles.notificationButton}>
            <Icon name="notifications" size={24} color="white" />
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
          <Text style={styles.sectionTitle}>Thống kê hôm nay</Text>
          <View style={styles.statsGrid}>
            <TouchableOpacity
              onPress={() => navigation.navigate('OrderList')}
              style={{flex: 1}}>
              <StatCard
                title="Chuyến đi"
                value={statistics?.today.total_orders || 0}
                subtitle="đơn"
                icon="local-shipping"
                color="#4CAF50"
              />
            </TouchableOpacity>
            <StatCard
              title="Năng suất"
              value={statistics?.today.completed || 0}
              subtitle="%"
              icon="trending-up"
              color="#2196F3"
            />
            <StatCard
              title="Thu nhập"
              value={statistics?.today.revenue || 0}
              subtitle="VND"
              icon="account-balance-wallet"
              color="#FF9800"
            />
          </View>
        </View>

        {/* Menu nhanh giống GHN */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Menu chức năng</Text>
          <View style={styles.quickActionsGrid}>
            <QuickActionButton
              icon="assignment"
              title="Bán hàng"
              color="#FF5722"
              onPress={() => navigation.navigate('Orders')}
            />
            <QuickActionButton
              icon="mic"
              title="Hỗ trợ khách hàng"
              color="#00BCD4"
              onPress={() => {}}
            />
            <QuickActionButton
              icon="location-on"
              title="Quản lý địa điểm"
              color="#3F51B5"
              onPress={() => navigation.navigate('Map')}
            />
          </View>

          <View style={styles.quickActionsGrid}>
            <QuickActionButton
              icon="note-add"
              title="Thêm đơn lẻ"
              color="#9C27B0"
              onPress={() => navigation.navigate('Orders')}
            />
            <QuickActionButton
              icon="print"
              title="In vận đơn"
              color="#FF9800"
              onPress={() => {}}
            />
            <QuickActionButton
              icon="history"
              title="Lịch sử nộp tiền"
              color="#607D8B"
              onPress={() => navigation.navigate('History')}
            />
          </View>

          <View style={styles.quickActionsGrid}>
            <QuickActionButton
              icon="notifications"
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
                <Icon name="location-on" size={24} color="white" />
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
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
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statCardLeft: {
    flex: 1,
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
  statCardIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
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
