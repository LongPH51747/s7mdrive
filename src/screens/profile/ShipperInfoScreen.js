import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useAuth} from '../../hooks/useAuth';

const ShipperInfoScreen = ({navigation}) => {
  const {user} = useAuth();

  const InfoRow = ({icon, title, value, color = '#333'}) => (
    <View style={styles.infoRow}>
      <View style={styles.infoLeft}>
        <Icon name={icon} size={20} color="#FF6B35" style={styles.infoIcon} />
        <Text style={styles.infoTitle}>{title}</Text>
      </View>
      <Text style={[styles.infoValue, {color}]}>{value}</Text>
    </View>
  );

  const getStatusText = (status) => {
    return status ? 'Đang hoạt động' : 'Không hoạt động';
  };

  const getStatusColor = (status) => {
    return status ? '#4CAF50' : '#F44336';
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#FF6B35" />

      {/* Header */}
      <LinearGradient colors={['#FF6B35', '#FF8E53']} style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Thông tin Shipper</Text>
          <View style={styles.placeholder} />
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Thông tin cơ bản */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin cơ bản</Text>
          <View style={styles.sectionContent}>
            <InfoRow
              icon="person"
              title="Họ và tên"
              value={user?.name || 'Chưa cập nhật'}
            />
            <InfoRow
              icon="account-circle"
              title="Tên đăng nhập"
              value={user?.username || 'Chưa cập nhật'}
            />
            <InfoRow
              icon="phone"
              title="Số điện thoại"
              value={user?.phone || 'Chưa cập nhật'}
            />
            <InfoRow
              icon="work"
              title="Vai trò"
              value="Shipper"
              color="#FF6B35"
            />
            <InfoRow
              icon="circle"
              title="Trạng thái"
              value={getStatusText(user?.status)}
              color={getStatusColor(user?.status)}
            />
          </View>
        </View>

        {/* Thông tin bưu cục */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin bưu cục</Text>
          <View style={styles.sectionContent}>
            <InfoRow
              icon="business"
              title="Tên bưu cục"
              value={user?.post_office_name || 'Chưa cập nhật'}
            />
            <InfoRow
              icon="location-on"
              title="Địa chỉ bưu cục"
              value={user?.post_office_address || 'Chưa cập nhật'}
            />
            <InfoRow
              icon="my-location"
              title="Tọa độ"
              value={
                user?.post_office_latitude && user?.post_office_longitude
                  ? `${user.post_office_latitude}, ${user.post_office_longitude}`
                  : 'Chưa cập nhật'
              }
            />
          </View>
        </View>

        {/* Khu vực giao hàng */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Khu vực giao hàng</Text>
          <View style={styles.sectionContent}>
            <InfoRow
              icon="local-shipping"
              title="Khu vực phụ trách"
              value={user?.address_shipping || 'Chưa cập nhật'}
            />
          </View>
        </View>

        {/* Thống kê công việc */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thống kê công việc</Text>
          <View style={styles.sectionContent}>
            <InfoRow
              icon="assignment"
              title="Số đơn hàng đã làm"
              value={`${user?.work?.length || 0} đơn`}
              color="#2196F3"
            />
            <InfoRow
              icon="schedule"
              title="Ngày tham gia"
              value={
                user?.createdAt
                  ? new Date(user.createdAt).toLocaleDateString('vi-VN')
                  : 'Chưa cập nhật'
              }
            />
          </View>
        </View>

        {/* Thông tin hệ thống */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin hệ thống</Text>
          <View style={styles.sectionContent}>
            <InfoRow
              icon="info"
              title="ID Shipper"
              value={user?.id || 'Chưa cập nhật'}
            />
            <InfoRow
              icon="update"
              title="Cập nhật lần cuối"
              value={
                user?.updatedAt
                  ? new Date(user.updatedAt).toLocaleString('vi-VN')
                  : 'Chưa cập nhật'
              }
            />
          </View>
        </View>
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
  },
  placeholder: {
    width: 34,
  },
  content: {
    flex: 1,
    marginTop: -10,
  },
  section: {
    backgroundColor: 'white',
    marginHorizontal: 15,
    marginVertical: 8,
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
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  sectionContent: {
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    padding: 15,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  infoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  infoIcon: {
    marginRight: 10,
  },
  infoTitle: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'right',
    flex: 1,
  },
});

export default ShipperInfoScreen;
