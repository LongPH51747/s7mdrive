import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Image,
  Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useAuth} from '../../hooks/useAuth';
import {useNavigation} from '@react-navigation/native';

const ProfileScreen = () => {
  const {user, logout} = useAuth();
  const navigation = useNavigation();

  const handleLogout = () => {
    Alert.alert('Đăng xuất', 'Bạn có chắc chắn muốn đăng xuất?', [
      {text: 'Hủy', style: 'cancel'},
      {text: 'Đăng xuất', onPress: logout, style: 'destructive'},
    ]);
  };

  const MenuButton = ({icon, title, onPress, showArrow = true}) => (
    <TouchableOpacity style={styles.menuButton} onPress={onPress}>
      <View style={styles.menuButtonLeft}>
        <Icon name={icon} size={24} color="#FF6B35" />
        <Text style={styles.menuButtonText}>{title}</Text>
      </View>
      {showArrow && <Icon name="chevron-right" size={24} color="#ccc" />}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#FF6B35" />

      {/* Header */}
      <LinearGradient colors={['#FF6B35', '#FF8E53']} style={styles.header}>
        <View style={styles.profileInfo}>
          <Image
            source={{uri: user?.avatar || 'https://i.pravatar.cc/300'}}
            style={styles.avatar}
          />
          <Text style={styles.userName}>{user?.name}</Text>
          <Text style={styles.userRole}>
            {user?.role === 'admin' ? 'Quản trị viên' : 'Shipper'}
          </Text>
          <Text style={styles.userInfo}>
            {user?.post_office_name}
          </Text>
          <Text style={styles.userInfo}>
            {user?.address_shipping}
          </Text>
        </View>
      </LinearGradient>

      {/* Menu */}
      <View style={styles.menuContainer}>
        <MenuButton
          icon="person"
          title="Thông tin cá nhân"
          onPress={() => navigation.navigate('ShipperInfo')}
        />
        <MenuButton icon="lock" title="Đổi mật khẩu" onPress={() => {}} />
        <MenuButton
          icon="notifications"
          title="Cài đặt thông báo"
          onPress={() => {}}
        />
        <MenuButton icon="help" title="Hỗ trợ" onPress={() => {}} />
        <MenuButton icon="info" title="Về ứng dụng" onPress={() => {}} />
        <MenuButton
          icon="logout"
          title="Đăng xuất"
          onPress={handleLogout}
          showArrow={false}
        />
      </View>
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
    alignItems: 'center',
  },
  profileInfo: {
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: 'white',
    marginBottom: 15,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  userRole: {
    fontSize: 14,
    color: 'white',
    opacity: 0.9,
    marginBottom: 3,
  },
  userInfo: {
    fontSize: 12,
    color: 'white',
    opacity: 0.8,
    marginBottom: 2,
  },
  menuContainer: {
    backgroundColor: 'white',
    marginHorizontal: 15,
    marginTop: -15,
    borderRadius: 15,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  menuButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuButtonLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuButtonText: {
    marginLeft: 15,
    fontSize: 16,
    color: '#333',
  },
});

export default ProfileScreen;
