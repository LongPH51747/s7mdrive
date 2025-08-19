import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import {useAuth} from '../../hooks/useAuth';
import {statisticsService} from '../../services';

const HistoryScreen = () => {
  const {user} = useAuth();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [totalCOD, setTotalCOD] = useState(0);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      if (!user?._id) return;
      const stats = await statisticsService.getTodayStatisticsByShipper(user._id);

      const codOrders = (stats?.todayOrders || []).filter(
        o => Number(o.status) === 7 && String(o.payment_method).toUpperCase() === 'COD',
      );

      setOrders(codOrders);
      setTotalCOD(
        codOrders.reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0),
      );
    } catch (error) {
      console.error('❌ Error fetching history:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = amount =>
    new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount || 0);

  const renderItem = ({item}) => (
    <View style={styles.orderItem}>
      <View style={{flex: 1}}>
        <Text style={styles.orderId}>#{item._id.slice(-6)}</Text>
        <Text style={styles.orderDate}>
          {new Date(item.updatedAt || item.createdAt).toLocaleString('vi-VN')}
        </Text>
        <Text style={styles.orderPayment}>PTTT: {item.payment_method}</Text>
      </View>
      <Text style={styles.orderAmount}>{formatCurrency(item.total_amount)}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#FF6B35" />
      
      {/* Header với gradient */}
      <LinearGradient colors={['#FF6B35', '#FF8535']} style={styles.header}>
        <Icon name="history" size={26} color="#fff" />
        <Text style={styles.headerTitle}>Lịch sử nộp tiền (COD)</Text>
      </LinearGradient>

      {loading ? (
        <ActivityIndicator size="large" color="#FF6B35" style={{marginTop: 20}} />
      ) : (
        <>
          <FlatList
            data={orders}
            keyExtractor={item => item._id}
            renderItem={renderItem}
            ListEmptyComponent={
              <Text style={styles.emptyText}>Chưa có đơn COD nào giao thành công</Text>
            }
            contentContainerStyle={{padding: 15, paddingBottom: 120}}
          />

          {/* Footer nổi */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Tổng tiền cần nộp</Text>
            <Text style={styles.footerAmount}>{formatCurrency(totalCOD)}</Text>
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#f5f6fa'},
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    elevation: 4,
  },
  headerTitle: {color: '#fff', fontSize: 18, fontWeight: 'bold', marginLeft: 10},
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    marginVertical: 8,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: {width: 0, height: 2},
    elevation: 2,
  },
  orderId: {fontSize: 14, fontWeight: '600', color: '#333'},
  orderDate: {fontSize: 12, color: '#888', marginTop: 2},
  orderPayment: {fontSize: 12, color: '#FF6B35', marginTop: 4},
  orderAmount: {fontSize: 16, fontWeight: 'bold', color: '#FF6B35'},
  emptyText: {textAlign: 'center', marginTop: 30, fontSize: 14, color: '#777'},
  footer: {
    position: 'absolute',
    bottom: 15,
    left: 15,
    right: 15,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 16,
    elevation: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerText: {fontSize: 16, fontWeight: '600', color: '#444'},
  footerAmount: {fontSize: 18, fontWeight: 'bold', color: '#FF6B35'},
});

export default HistoryScreen;
