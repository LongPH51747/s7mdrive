import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Alert,
  ActivityIndicator,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useAuth} from '../../hooks/useAuth';
import {useNavigation} from '@react-navigation/native';
import {checkDistanceToPostOffice, getPostOfficeInfo} from '../../services/locationService';

const CheckInScreen = () => {
  const {user} = useAuth();
  const navigation = useNavigation();
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkInTime, setCheckInTime] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());



  useEffect(() => {
    console.log('📱 === CHECK-IN SCREEN MOUNTED ===');
    console.log('📱 Thời gian mount:', new Date().toLocaleString('vi-VN'));
    console.log('📱 Thông tin user:', {
      id: user?.id,
      name: user?.name,
      role: user?.role,
      area: user?.area,
      id_post_office: user?.id_post_office
    });
    console.log('📱 Trạng thái ban đầu:', {
      isCheckedIn,
      checkInTime: checkInTime?.toLocaleString('vi-VN') || 'Chưa check-in'
    });
    
    // Cập nhật thời gian hiện tại mỗi giây
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => {
      console.log('📱 === CHECK-IN SCREEN UNMOUNTED ===');
      clearInterval(timer);
    };
  }, []);



  const formatTime = (date) => {
    return date.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleCheckIn = async () => {
    console.log('🚀 === BẮT ĐẦU QUÁ TRÌNH CHECK-IN ===');
    console.log('🚀 Thời gian bắt đầu:', new Date().toLocaleString('vi-VN'));
    console.log('🚀 Thông tin user:', {
      id: user?.id,
      name: user?.name,
      id_post_office: user?.id_post_office
    });
    
    setLoading(true);
    try {
      // Kiểm tra khoảng cách đến bưu cục
      console.log('🚀 Đang kiểm tra khoảng cách...');
      const locationResult = await checkDistanceToPostOffice(user?.id_post_office);
      console.log('🚀 Kết quả kiểm tra khoảng cách:', locationResult);
      
      if (!locationResult.success) {
        console.log('❌ Kiểm tra khoảng cách thất bại:', locationResult.error);
        Alert.alert(
          'Lỗi vị trí',
          locationResult.error === 'Không có quyền truy cập vị trí' 
            ? 'Ứng dụng cần quyền truy cập vị trí để check-in. Vui lòng cấp quyền trong cài đặt.'
            : locationResult.error,
          [{text: 'OK'}]
        );
        setLoading(false);
        return;
      }

      // Kiểm tra khoảng cách (100m)
      console.log('🚀 Kiểm tra phạm vi cho phép...');
      console.log('🚀 Khoảng cách hiện tại:', locationResult.distance.toFixed(2), 'm');
      console.log('🚀 Phạm vi cho phép:', '100m');
      console.log('🚀 Có trong phạm vi không:', locationResult.isWithinRange ? '✅ CÓ' : '❌ KHÔNG');
      
      if (!locationResult.isWithinRange) {
        console.log('❌ Khoảng cách quá xa, không thể check-in');
        Alert.alert(
          'Khoảng cách quá xa',
          `Bạn đang cách bưu cục ${locationResult.distance.toFixed(0)}m. Vui lòng đến gần bưu cục hơn để check-in (trong phạm vi 100m).`,
          [{text: 'OK'}]
        );
        setLoading(false);
        return;
      }

      // Giả lập API call
      console.log('🚀 Khoảng cách hợp lệ, đang gửi yêu cầu check-in...');
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const checkInTime = new Date();
      console.log('🚀 Thời gian check-in:', checkInTime.toLocaleString('vi-VN'));
      
      setIsCheckedIn(true);
      setCheckInTime(checkInTime);
      
      console.log('✅ Check-in thành công!');
      console.log('✅ Thông tin check-in:');
      console.log('   - Thời gian:', checkInTime.toLocaleString('vi-VN'));
      console.log('   - Địa điểm:', locationResult.postOffice.address);
      console.log('   - Khoảng cách:', locationResult.distance.toFixed(2), 'm');
      console.log('   - Vị trí GPS:', locationResult.currentLocation);
      
      Alert.alert(
        'Check-in thành công!',
        `Bạn đã check-in thành công tại ${locationResult.postOffice.address}. Chúc bạn một ngày làm việc hiệu quả!`,
        [{text: 'OK'}]
      );
    } catch (error) {
      console.error('❌ Lỗi khi check-in:', error);
      console.error('❌ Stack trace:', error.stack);
      Alert.alert('Lỗi', 'Không thể check-in. Vui lòng thử lại.');
    } finally {
      setLoading(false);
      console.log('🚀 === KẾT THÚC QUÁ TRÌNH CHECK-IN ===\n');
    }
  };

  const handleCheckOut = async () => {
    console.log('🚪 === BẮT ĐẦU QUÁ TRÌNH CHECK-OUT ===');
    console.log('🚪 Thời gian bắt đầu:', new Date().toLocaleString('vi-VN'));
    console.log('🚪 Thời gian check-in trước đó:', checkInTime?.toLocaleString('vi-VN'));
    
    Alert.alert(
      'Xác nhận Check-out',
      'Bạn có chắc muốn check-out?',
      [
        {text: 'Hủy', style: 'cancel'},
        {
          text: 'Check-out',
          style: 'destructive',
          onPress: async () => {
            console.log('🚪 User xác nhận check-out');
            setLoading(true);
            try {
              console.log('🚪 Đang gửi yêu cầu check-out...');
              await new Promise(resolve => setTimeout(resolve, 1000));
              
              const checkOutTime = new Date();
              const workDuration = checkInTime ? checkOutTime - checkInTime : 0;
              const workHours = Math.floor(workDuration / (1000 * 60 * 60));
              const workMinutes = Math.floor((workDuration % (1000 * 60 * 60)) / (1000 * 60));
              
              console.log('🚪 Thời gian check-out:', checkOutTime.toLocaleString('vi-VN'));
              console.log('🚪 Thời gian làm việc:', `${workHours}h ${workMinutes}m`);
              
              setIsCheckedIn(false);
              setCheckInTime(null);
              
              console.log('✅ Check-out thành công!');
              console.log('✅ Thông tin check-out:');
              console.log('   - Thời gian check-out:', checkOutTime.toLocaleString('vi-VN'));
              console.log('   - Thời gian làm việc:', `${workHours}h ${workMinutes}m`);
              console.log('   - Tổng thời gian (ms):', workDuration);
              
              Alert.alert('Thành công', 'Đã check-out thành công!');
            } catch (error) {
              console.error('❌ Lỗi khi check-out:', error);
              Alert.alert('Lỗi', 'Không thể check-out. Vui lòng thử lại.');
            } finally {
              setLoading(false);
              console.log('🚪 === KẾT THÚC QUÁ TRÌNH CHECK-OUT ===\n');
            }
          },
        },
      ]
    );
  };

  const calculateWorkTime = () => {
    if (!checkInTime) return '00:00:00';
    
    const now = new Date();
    const diff = now - checkInTime;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const generateCalendarDays = () => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const currentDay = today.getDate();
    
    // Lấy ngày đầu tiên của tháng
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    // Lấy ngày cuối cùng của tháng
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
    
    // Ngày trong tuần của ngày đầu tiên (0 = Chủ nhật, 1 = Thứ 2, ...)
    const firstDayWeekday = firstDayOfMonth.getDay();
    const totalDays = lastDayOfMonth.getDate();
    
    const days = [];
    
    // Thêm các ngày trống cho tuần đầu tiên
    for (let i = 0; i < firstDayWeekday; i++) {
      days.push(<View key={`empty-${i}`} style={styles.calendarDay} />);
    }
    
    // Thêm các ngày trong tháng
    for (let day = 1; day <= totalDays; day++) {
      const isToday = day === currentDay;
      const isCheckedInDay = isCheckedIn && day === currentDay;
      
      days.push(
        <View key={day} style={[
          styles.calendarDay,
          isToday && styles.today,
          isCheckedInDay && styles.checkedInDay
        ]}>
          <Text style={[
            styles.dayText,
            isToday && styles.todayText,
            isCheckedInDay && styles.checkedInDayText
          ]}>
            {day}
          </Text>
          {isCheckedInDay && (
            <View style={styles.checkInDot} />
          )}
        </View>
      );
    }
    
    return days;
  };

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
          <Text style={styles.headerTitle}>Check In/Out</Text>
          <View style={styles.placeholder} />
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Thông tin shipper */}
        <View style={styles.userCard}>
          <View style={styles.userInfo}>
            <View style={styles.avatarContainer}>
              <Icon name="person" size={40} color="#FF6B35" />
            </View>
            <View style={styles.userDetails}>
              <Text style={styles.userName}>{user?.name}</Text>
              <Text style={styles.userRole}>{user?.role}</Text>
              <Text style={styles.userArea}>{user?.area}</Text>
            </View>
          </View>
        </View>

        {/* Thời gian hiện tại */}
        <View style={styles.timeCard}>
          <Text style={styles.timeLabel}>Thời gian hiện tại</Text>
          <Text style={styles.currentTime}>{formatTime(currentTime)}</Text>
          <Text style={styles.currentDate}>{formatDate(currentTime)}</Text>
        </View>

        {/* Lịch */}
        <View style={styles.calendarCard}>
          <Text style={styles.calendarTitle}>Lịch làm việc</Text>
          <View style={styles.calendarContainer}>
            <View style={styles.calendarHeader}>
              <Text style={styles.calendarMonth}>
                {currentTime.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' })}
              </Text>
            </View>
            
            {/* Days of week */}
            <View style={styles.daysOfWeek}>
              {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map((day, index) => (
                <Text key={index} style={styles.dayOfWeek}>{day}</Text>
              ))}
            </View>
            
            {/* Calendar grid */}
            <View style={styles.calendarGrid}>
              {generateCalendarDays()}
            </View>
          </View>
        </View>

        {/* Thông tin check-in */}
        {isCheckedIn && checkInTime && (
          <View style={styles.checkInCard}>
            <View style={styles.checkInHeader}>
              <Icon name="check-circle" size={24} color="#4CAF50" />
              <Text style={[styles.checkInStatus, {color: '#4CAF50'}]}>
                Đã Check-in
              </Text>
            </View>
            <View style={styles.checkInInfo}>
              <Text style={styles.checkInLabel}>Thời gian check-in:</Text>
              <Text style={styles.checkInTime}>{formatTime(checkInTime)}</Text>
              <Text style={styles.checkInDate}>{formatDate(checkInTime)}</Text>
            </View>
          </View>
        )}

        {/* Thời gian làm việc */}
        {isCheckedIn && (
          <View style={styles.workTimeCard}>
            <Text style={styles.workTimeLabel}>Thời gian làm việc</Text>
            <Text style={styles.workTime}>{calculateWorkTime()}</Text>
          </View>
        )}

        {/* Nút Check In/Out */}
        <TouchableOpacity
          style={[
            styles.checkInButton,
            isCheckedIn && styles.checkOutButton,
            loading && styles.buttonDisabled,
          ]}
          onPress={isCheckedIn ? handleCheckOut : handleCheckIn}
          disabled={loading}>
          <LinearGradient
            colors={isCheckedIn ? ['#FF3D71', '#FF6B9D'] : ['#4CAF50', '#66BB6A']}
            style={styles.buttonGradient}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 0}}>
            {loading ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <>
                <Icon
                  name={isCheckedIn ? 'logout' : 'login'}
                  size={24}
                  color="white"
                />
                <Text style={styles.buttonText}>
                  {isCheckedIn ? 'CHECK OUT' : 'CHECK IN'}
                </Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>

        {/* Thông tin bổ sung */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Thông tin bổ sung</Text>
          <View style={styles.infoRow}>
            <Icon name="location-on" size={16} color="#666" />
            <Text style={styles.infoText}>Khu vực: {user?.area}</Text>
          </View>
          <View style={styles.infoRow}>
            <Icon name="directions-car" size={16} color="#666" />
            <Text style={styles.infoText}>Phương tiện: {user?.vehicle}</Text>
          </View>
          <View style={styles.infoRow}>
            <Icon name="confirmation-number" size={16} color="#666" />
            <Text style={styles.infoText}>Biển số: {user?.license_plate}</Text>
          </View>
          <View style={styles.infoRow}>
            <Icon name="business" size={16} color="#666" />
            <Text style={styles.infoText}>
              Bưu cục: {getPostOfficeInfo(user?.id_post_office)?.address || 'Không xác định'}
            </Text>
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
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  userCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  userRole: {
    fontSize: 14,
    color: '#FF6B35',
    fontWeight: '500',
    marginBottom: 2,
  },
  userArea: {
    fontSize: 12,
    color: '#666',
  },
  timeCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  timeLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  currentTime: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  currentDate: {
    fontSize: 14,
    color: '#666',
  },
  calendarCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  calendarTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  calendarContainer: {
    alignItems: 'center',
  },
  calendarHeader: {
    marginBottom: 15,
  },
  calendarMonth: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textTransform: 'capitalize',
  },
  daysOfWeek: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  dayOfWeek: {
    width: 40,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: 'bold',
    color: '#666',
    marginHorizontal: 2,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  calendarDay: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 2,
    borderRadius: 20,
    position: 'relative',
  },
  dayText: {
    fontSize: 14,
    color: '#333',
  },
  today: {
    backgroundColor: '#FF6B35',
  },
  todayText: {
    color: 'white',
    fontWeight: 'bold',
  },
  checkedInDay: {
    backgroundColor: '#4CAF50',
  },
  checkedInDayText: {
    color: 'white',
    fontWeight: 'bold',
  },
  checkInDot: {
    position: 'absolute',
    bottom: 2,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'white',
  },
  checkInCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  checkInHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  checkInStatus: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  checkInInfo: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 15,
  },
  checkInLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  checkInTime: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  checkInDate: {
    fontSize: 12,
    color: '#666',
  },
  workTimeCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  workTimeLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  workTime: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  checkInButton: {
    borderRadius: 15,
    overflow: 'hidden',
    marginBottom: 16,
  },
  checkOutButton: {
    // Styles for check-out state
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonGradient: {
    paddingVertical: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  infoCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 10,
  },
});

export default CheckInScreen; 