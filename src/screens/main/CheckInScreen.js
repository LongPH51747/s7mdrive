import React, {useState, useEffect, useCallback} from 'react';
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
// import Icon from 'react-native-vector-icons/MaterialIcons';
import {useAuth} from '../../hooks/useAuth';
import {useCheckIn} from '../../hooks/useCheckIn';
import {useNavigation} from '@react-navigation/native';
import {checkDistanceToPostOfficeWithUserData} from '../../services/locationService';
import {hasCheckedInToday, getCheckedInDaysInMonth, createWorkRecord} from '../../services/workService';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CheckInScreen = () => {
  const {user} = useAuth();
  const {refreshCheckInStatus} = useCheckIn();
  const navigation = useNavigation();
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [checkedInDays, setCheckedInDays] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date());



  useEffect(() => {
    console.log('📱 === CHECK-IN SCREEN MOUNTED ===');
    console.log('📱 Thời gian mount:', new Date().toLocaleString('vi-VN'));
    console.log('📱 Thông tin user:', {
      id: user?.id,
      name: user?.name,
      role: user?.role,
      post_office_name: user?.post_office_name,
      post_office_address: user?.post_office_address,
      address_shipping: user?.address_shipping
    });
    console.log('📱 Trạng thái ban đầu:', {
      isCheckedIn
    });
    
    // Kiểm tra trạng thái check-in hôm nay
    const checkTodayStatus = async () => {
      if (user?.id) {
        console.log('🔍 Kiểm tra trạng thái check-in hôm nay...');
        const hasCheckedIn = await hasCheckedInToday(user.id);
        setIsCheckedIn(hasCheckedIn);
        
        if (hasCheckedIn) {
          console.log('✅ Shipper đã check-in hôm nay');
        }
      }
    };
    
    checkTodayStatus();
    loadCheckedInDays();
    
    // Kiểm tra và reset trạng thái check-in khi sang ngày mới
    const checkAndResetStatus = async () => {
      try {
        const lastCheckInDate = await AsyncStorage.getItem('lastCheckInDate');
        const todayStr = new Date().toISOString().split('T')[0];
        
        if (lastCheckInDate && lastCheckInDate !== todayStr) {
          console.log('📅 Sang ngày mới, reset trạng thái check-in');
          setIsCheckedIn(false);
        }
      } catch (error) {
        console.error('❌ Lỗi khi kiểm tra reset status:', error);
      }
    };
    
    checkAndResetStatus();
    
    // Cập nhật thời gian hiện tại mỗi giây
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => {
      console.log('📱 === CHECK-IN SCREEN UNMOUNTED ===');
      clearInterval(timer);
    };
  }, [user?.id, selectedMonth]);

  // Lấy danh sách ngày đã check-in trong tháng
  const loadCheckedInDays = useCallback(async () => {
    if (user?.id) {
      const checkedDays = await getCheckedInDaysInMonth(
        user.id, 
        selectedMonth.getFullYear(), 
        selectedMonth.getMonth()
      );
      setCheckedInDays(checkedDays);
      console.log('📅 Ngày đã check-in trong tháng:', checkedDays);
    }
  }, [user?.id, selectedMonth]);

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

  // Hàm chuyển tháng trước
  const goToPreviousMonth = () => {
    const newMonth = new Date(selectedMonth);
    newMonth.setMonth(newMonth.getMonth() - 1);
    setSelectedMonth(newMonth);
    console.log('📅 Chuyển đến tháng trước:', newMonth.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' }));
  };

  // Hàm chuyển tháng sau
  const goToNextMonth = () => {
    const newMonth = new Date(selectedMonth);
    newMonth.setMonth(newMonth.getMonth() + 1);
    setSelectedMonth(newMonth);
    console.log('📅 Chuyển đến tháng sau:', newMonth.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' }));
  };

  // Hàm về tháng hiện tại
  const goToCurrentMonth = () => {
    setSelectedMonth(new Date());
    console.log('📅 Về tháng hiện tại');
  };

  // Hàm xử lý check-in
  const handleCheckIn = async () => {
    try {
      console.log('🚀 Bắt đầu quá trình check-in...');
      setLoading(true);
      
      // Kiểm tra xem đã check-in hôm nay chưa
      if (isCheckedIn) {
        Alert.alert('Thông báo', 'Bạn đã check-in hôm nay rồi!');
        setLoading(false);
        return;
      }

      // Kiểm tra vị trí GPS trước khi cho phép check-in
      console.log('📍 Bắt đầu kiểm tra vị trí GPS...');
      const locationResult = await checkDistanceToPostOfficeWithUserData(user);
      
      if (!locationResult.success) {
        console.error('❌ Lỗi khi kiểm tra vị trí:', locationResult.error);
        Alert.alert(
          'Lỗi vị trí', 
          `Không thể xác định vị trí: ${locationResult.error}\n\nVui lòng kiểm tra:\n- Quyền truy cập vị trí\n- GPS đã bật\n- Kết nối mạng`,
          [{text: 'OK'}]
        );
        setLoading(false);
        return;
      }

      if (!locationResult.isWithinRange) {
        console.log('❌ Shipper không trong phạm vi bưu cục');
        const distance = Math.round(locationResult.distance);
        Alert.alert(
          'Không trong phạm vi',
          `Bạn đang cách bưu cục ${distance}m.\n\nVui lòng di chuyển đến gần bưu cục (trong vòng 100m) để có thể check-in.`,
          [
            {
              text: 'Xem vị trí',
              onPress: () => {
                const mapsUrl = `https://www.google.com/maps?q=${locationResult.postOffice.latitude},${locationResult.postOffice.longitude}`;
                console.log('🗺️ Link Google Maps bưu cục:', mapsUrl);
                // Có thể mở Google Maps ở đây nếu cần
              }
            },
            {text: 'OK'}
          ]
        );
        setLoading(false);
        return;
      }

      console.log('✅ Shipper trong phạm vi bưu cục, cho phép check-in');
      const distance = Math.round(locationResult.distance);

      // Hiển thị xác nhận check-in với thông tin vị trí
      Alert.alert(
        'Xác nhận Check-in',
        `Bạn đang ở vị trí cách bưu cục ${distance}m.\n\nBạn có chắc chắn muốn check-in hôm nay?`,
        [
          {
            text: 'Hủy',
            style: 'cancel',
            onPress: () => {
              console.log('❌ User hủy check-in');
              setLoading(false);
            }
          },
          {
            text: 'Check-in',
            onPress: async () => {
              try {
                console.log('✅ User xác nhận check-in');
                
                // Gọi API tạo work record
                console.log('📝 Gọi API tạo work record...');
                const result = await createWorkRecord(user.id);
                
                if (result.success) {
                  console.log('✅ Tạo work record thành công:', result.data);
                  
                  // Cập nhật trạng thái local
                  setIsCheckedIn(true);
                  
                  // Lưu ngày check-in vào AsyncStorage
                  const todayStr = new Date().toISOString().split('T')[0];
                  await AsyncStorage.setItem('lastCheckInDate', todayStr);
                  
                  // Refresh trạng thái check-in
                  await refreshCheckInStatus();
                  
                  // Hiển thị thông báo thành công với thông tin vị trí
                  Alert.alert(
                    'Check-in thành công!',
                    `Bạn đã check-in thành công tại ${user?.post_office_name || 'bưu cục'}.\n\nVị trí: Cách bưu cục ${distance}m\nĐịa chỉ: ${user?.post_office_address || 'địa chỉ bưu cục'}\n\nChúc bạn một ngày làm việc hiệu quả!`,
                    [{text: 'OK'}]
                  );
                  
                  console.log('✅ Check-in hoàn tất thành công!');
                } else {
                  console.error('❌ Lỗi khi tạo work record:', result.message);
                  Alert.alert('Lỗi', `Không thể check-in: ${result.message}`);
                }
              } catch (error) {
                console.error('❌ Lỗi không mong muốn khi check-in:', error);
                Alert.alert('Lỗi', 'Có lỗi xảy ra khi check-in. Vui lòng thử lại.');
              } finally {
                setLoading(false);
              }
            }
          }
        ]
      );
      
    } catch (error) {
      console.error('❌ Lỗi trong handleCheckIn:', error);
      Alert.alert('Lỗi', 'Có lỗi xảy ra khi xử lý check-in');
      setLoading(false);
    }
  };





  const generateCalendarDays = () => {
    const today = new Date();
    const selectedMonthYear = selectedMonth.getFullYear();
    const selectedMonthMonth = selectedMonth.getMonth();
    const currentDay = today.getDate();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    // Lấy ngày đầu tiên của tháng được chọn
    const firstDayOfMonth = new Date(selectedMonthYear, selectedMonthMonth, 1);
    // Lấy ngày cuối cùng của tháng được chọn
    const lastDayOfMonth = new Date(selectedMonthYear, selectedMonthMonth + 1, 0);
    
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
      const isToday = day === currentDay && 
                     selectedMonthMonth === currentMonth && 
                     selectedMonthYear === currentYear;
      const isCheckedInDay = checkedInDays.includes(day);
      const isTodayCheckedIn = isToday && isCheckedIn;
      
      days.push(
        <View key={day} style={[
          styles.calendarDay,
          isToday && styles.today,
          isCheckedInDay && styles.checkedInDay,
          isTodayCheckedIn && styles.todayCheckedIn
        ]}>
          <Text style={[
            styles.dayText,
            isToday && styles.todayText,
            isCheckedInDay && styles.checkedInDayText,
            isTodayCheckedIn && styles.todayCheckedInText
          ]}>
            {day}
          </Text>
          {(isCheckedInDay || isTodayCheckedIn) && (
            <View style={styles.checkInDot} />
          )}
        </View>
      );
    }
    
    // Thêm các ngày trống cho tuần cuối cùng để đảm bảo lịch đẹp
    const totalCells = firstDayWeekday + totalDays;
    const remainingCells = 7 - (totalCells % 7);
    if (remainingCells < 7) {
      for (let i = 0; i < remainingCells; i++) {
        days.push(<View key={`empty-end-${i}`} style={styles.calendarDay} />);
      }
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
            <Text style={styles.backIcon}>←</Text>
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
              <Text style={styles.avatarIcon}>👤</Text>
            </View>
            <View style={styles.userDetails}>
              <Text style={styles.userName}>{user?.name}</Text>
              <Text style={styles.userRole}>Shipper</Text>
              <Text style={styles.userArea}>{user?.post_office_name}</Text>
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
              <View style={styles.calendarNavigation}>
                <TouchableOpacity 
                  style={styles.navButton} 
                  onPress={goToPreviousMonth}>
                  <Text style={styles.navIcon}>‹</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.monthButton} 
                  onPress={goToCurrentMonth}>
                  <Text style={styles.calendarMonth}>
                    {selectedMonth.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' })}
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.navButton} 
                  onPress={goToNextMonth}>
                  <Text style={styles.navIcon}>›</Text>
                </TouchableOpacity>
              </View>
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
        {isCheckedIn && (
          <View style={styles.checkInCard}>
            <View style={styles.checkInHeader}>
              <Text style={styles.checkInIcon}>✓</Text>
              <Text style={[styles.checkInStatus, {color: '#4CAF50'}]}>
                Đã Check-in hôm nay
              </Text>
            </View>
            <View style={styles.checkInInfo}>
              <Text style={styles.checkInLabel}>Trạng thái:</Text>
              <Text style={styles.checkInTime}>Hoàn thành check-in</Text>
              <Text style={styles.checkInDate}>Bạn có thể check-in lại vào ngày mai</Text>
            </View>
          </View>
        )}

        {/* Nút Check In */}
        <TouchableOpacity
          style={[
            styles.checkInButton,
            isCheckedIn && styles.buttonDisabled,
            loading && styles.buttonDisabled,
          ]}
          onPress={handleCheckIn}
          disabled={loading || isCheckedIn}>
          <LinearGradient
            colors={isCheckedIn ? ['#CCCCCC', '#DDDDDD'] : ['#4CAF50', '#66BB6A']}
            style={styles.buttonGradient}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 0}}>
            {loading ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <>
                <Text style={[styles.buttonIcon, isCheckedIn && {color: '#999'}]}>
                  {isCheckedIn ? '✓' : '→'}
                </Text>
                <Text style={[styles.buttonText, isCheckedIn && {color: '#999'}]}>
                  {isCheckedIn ? 'ĐÃ CHECK IN' : 'CHECK IN'}
                </Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>

        {/* Thông tin bổ sung */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Thông tin bổ sung</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>📍</Text>
            <Text style={styles.infoText}>Khu vực giao hàng: {user?.address_shipping}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>🏢</Text>
            <Text style={styles.infoText}>Bưu cục: {user?.post_office_name}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>📍</Text>
            <Text style={styles.infoText}>Địa chỉ: {user?.post_office_address}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>📋</Text>
            <Text style={styles.infoText}>Đơn hàng đã làm: {user?.work?.length || 0}</Text>
          </View>
        </View>

        {/* Thông báo về kiểm tra vị trí GPS */}
        <View style={styles.locationCheckCard}>
          <Text style={styles.locationCheckTitle}>📍 Kiểm tra vị trí GPS</Text>
          <Text style={styles.locationCheckText}>
            Để check-in, bạn cần ở trong phạm vi 100m từ bưu cục. 
            Ứng dụng sẽ tự động kiểm tra vị trí GPS của bạn khi nhấn nút Check-in.
          </Text>
          <View style={styles.locationRequirements}>
            <Text style={styles.requirementText}>• Bật GPS và cho phép truy cập vị trí</Text>
            <Text style={styles.requirementText}>• Đứng trong phạm vi 100m từ bưu cục</Text>
            <Text style={styles.requirementText}>• Có kết nối mạng ổn định</Text>
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
  backIcon: {
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold',
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
  avatarIcon: {
    fontSize: 30,
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
    width: '100%',
  },
  calendarHeader: {
    marginBottom: 15,
    alignItems: 'center',
  },
  calendarNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  navButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  navIcon: {
    fontSize: 24,
    color: '#FF6B35',
    fontWeight: 'bold',
  },
  monthButton: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 20,
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
    justifyContent: 'space-between',
    width: '100%',
  },
  dayOfWeek: {
    width: 40,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: 'bold',
    color: '#666',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    width: '100%',
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
  todayCheckedIn: {
    backgroundColor: '#2E7D32', // Xanh lá đậm hơn cho hôm nay đã check-in
  },
  todayCheckedInText: {
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
  checkInIcon: {
    fontSize: 24,
    color: '#4CAF50',
    fontWeight: 'bold',
    marginRight: 10,
  },
  checkInStatus: {
    fontSize: 16,
    fontWeight: 'bold',
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
  buttonIcon: {
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold',
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
  infoIcon: {
    fontSize: 16,
    marginRight: 5,
  },
  locationCheckCard: {
    backgroundColor: '#E8F5E8',
    borderRadius: 15,
    padding: 16,
    marginTop: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  locationCheckTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 8,
  },
  locationCheckText: {
    fontSize: 14,
    color: '#424242',
    lineHeight: 20,
    marginBottom: 12,
  },
  locationRequirements: {
    marginTop: 8,
  },
  requirementText: {
    fontSize: 13,
    color: '#2E7D32',
    marginBottom: 4,
    fontWeight: '500',
  },
});

export default CheckInScreen; 