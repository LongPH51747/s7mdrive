import AsyncStorage from '@react-native-async-storage/async-storage';

// Lưu thông tin user vào AsyncStorage
export const saveUserData = async (userData) => {
  try {
    const dataToSave = {
      ...userData,
      savedAt: new Date().toISOString(),
    };
    await AsyncStorage.setItem('userData', JSON.stringify(dataToSave));
    console.log('Đã lưu thông tin user:', dataToSave);
    return true;
  } catch (error) {
    console.error('Lỗi khi lưu user data:', error);
    return false;
  }
};

// Đọc thông tin user từ AsyncStorage
export const getUserData = async () => {
  try {
    const userDataString = await AsyncStorage.getItem('userData');
    if (userDataString) {
      const userData = JSON.parse(userDataString);
      console.log('Đã đọc thông tin user:', userData);
      return userData;
    }
    return null;
  } catch (error) {
    console.error('Lỗi khi đọc user data:', error);
    return null;
  }
};

// Xóa thông tin user khỏi AsyncStorage
export const removeUserData = async () => {
  try {
    await AsyncStorage.removeItem('userData');
    console.log('Đã xóa thông tin user');
    return true;
  } catch (error) {
    console.error('Lỗi khi xóa user data:', error);
    return false;
  }
};

// Kiểm tra xem có user data đã lưu không
export const hasUserData = async () => {
  try {
    const userData = await getUserData();
    return userData !== null;
  } catch (error) {
    console.error('Lỗi khi kiểm tra user data:', error);
    return false;
  }
};

// Cập nhật thông tin user
export const updateUserData = async (newData) => {
  try {
    const currentData = await getUserData();
    if (currentData) {
      const updatedData = {
        ...currentData,
        ...newData,
        updatedAt: new Date().toISOString(),
      };
      await AsyncStorage.setItem('userData', JSON.stringify(updatedData));
      console.log('Đã cập nhật thông tin user:', updatedData);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Lỗi khi cập nhật user data:', error);
    return false;
  }
}; 