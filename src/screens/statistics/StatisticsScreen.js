import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import {BarChart} from 'react-native-chart-kit';
import {Dimensions} from 'react-native';
import {useAuth} from '../../hooks/useAuth';
import {statisticsService} from '../../services';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const screenWidth = Dimensions.get('window').width;

const StatisticsScreen = () => {
  const {user} = useAuth();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [codOrders, setCodOrders] = useState([]);
  const [totalCOD, setTotalCOD] = useState(0);

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      if (!user?._id) return;

      const stats = await statisticsService.getTodayStatisticsByShipper(
        user._id,
      );

      if (stats?.todayOrders) {
        setOrders(stats.todayOrders);

        const cod = stats.todayOrders.filter(
          o => String(o.payment_method).toUpperCase() === 'COD',
        );
        setCodOrders(cod);

        const totalCodAmount = cod.reduce(
          (sum, o) => sum + (Number(o.total_amount) || 0),
          0,
        );
        setTotalCOD(totalCodAmount);
      }
    } catch (error) {
      console.error('❌ Error fetch statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  const chartData = {
    labels: codOrders.map((o, i) => `Đơn ${i + 1}`),
    datasets: [
      {
        data: codOrders.map(o => Number(o.total_amount) || 0),
      },
    ],
  };

  return (
    <ScrollView style={styles.container}>
      {loading ? (
        <ActivityIndicator
          size="large"
          color="#FF6B35"
          style={{marginTop: 30}}
        />
      ) : (
        <View style={styles.content}>
          {/* Header gradient */}
          <LinearGradient
            colors={['#FF9800', '#FF6B35']}
            style={styles.headerBox}>
            <Text style={styles.headerTitle}>📊 Thống kê hôm nay</Text>
            <Text style={styles.headerSubtitle}>
              Xin chào, {user?.name || 'Shipper'} 👋
            </Text>
          </LinearGradient>

          {/* Thống kê tổng quan */}
          <View style={styles.summaryRow}>
            <View style={styles.statCard}>
              <Icon name="truck-delivery" size={28} color="#FF9800" />
              <Text style={styles.statNumber}>{orders.length}</Text>
              <Text style={styles.statLabel}>Đơn giao thành công</Text>
            </View>

            <View style={styles.statCard}>
              <Icon name="cash-multiple" size={28} color="#4CAF50" />
              <Text style={styles.statNumber}>{codOrders.length}</Text>
              <Text style={styles.statLabel}>Đơn COD</Text>
            </View>

            <View style={styles.statCard}>
              <Icon name="currency-usd" size={28} color="#2196F3" />
              <Text style={styles.statNumber}>
                {new Intl.NumberFormat('vi-VN', {
                  style: 'currency',
                  currency: 'VND',
                  maximumFractionDigits: 0,
                }).format(totalCOD)}
              </Text>
              <Text style={styles.statLabel}>Tổng COD</Text>
            </View>
          </View>

          {/* Biểu đồ COD */}
          {codOrders.length > 0 ? (
            <View style={styles.chartBox}>
              <Text style={styles.chartTitle}>📈 Sơ đồ số tiền COD</Text>
              <BarChart
                data={{
                  labels: ['Đơn 1'],
                  datasets: [
                    {
                      data: [450000],
                    },
                  ],
                }}
                width={Dimensions.get('window').width - 40} // chiều rộng
                height={220}
                yAxisLabel=""
                yAxisSuffix="đ"
                fromZero={true}
                chartConfig={{
                  backgroundColor: '#ffffff',
                  backgroundGradientFrom: '#ffffff',
                  backgroundGradientTo: '#ffffff',
                  decimalPlaces: 0,
                  color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`, // màu cột, chữ đen
                  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`, // màu nhãn
                  style: {
                    borderRadius: 16,
                  },
                  propsForBackgroundLines: {
                    strokeWidth: 1,
                    stroke: '#e3e3e3',
                    strokeDasharray: '0',
                  },
                }}
                style={{
                  marginVertical: 8,
                  borderRadius: 16,
                }}
              />
            </View>
          ) : (
            <Text style={styles.noData}>🙁 Hôm nay chưa có đơn COD nào</Text>
          )}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#f5f7fa'},
  content: {padding: 20},

  headerBox: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    elevation: 5,
  },
  headerTitle: {fontSize: 20, fontWeight: 'bold', color: '#fff'},
  headerSubtitle: {fontSize: 14, color: '#fff', marginTop: 5},

  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    alignItems: 'center',
    marginHorizontal: 5,
    elevation: 3,
  },
  statNumber: {fontSize: 16, fontWeight: 'bold', marginTop: 5, color: '#333'},
  statLabel: {fontSize: 12, color: '#666', textAlign: 'center', marginTop: 3},

  chartBox: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 15,
    elevation: 3,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },

  noData: {textAlign: 'center', marginTop: 20, color: '#999', fontSize: 14},
});

export default StatisticsScreen;
