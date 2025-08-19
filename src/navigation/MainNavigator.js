import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createStackNavigator} from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Screen imports
import DashboardScreen from '../screens/main/DashboardScreen';
import CheckInScreen from '../screens/main/CheckInScreen';
import OrderListScreen from '../screens/orders/OrderListScreen';
import OrderDetailScreen from '../screens/orders/OrderDetailScreen';
import CreateOrderScreen from '../screens/orders/CreateOrderScreen';
import MapTrackingScreen from '../screens/map/MapTrackingScreen';
import HistoryScreen from '../screens/history/HistoryScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import ShipperInfoScreen from '../screens/profile/ShipperInfoScreen';
import StatisticsScreen from '../screens/statistics/StatisticsScreen';


const Tab = createBottomTabNavigator();
const OrderStack = createStackNavigator();

const OrderNavigator = () => {
  return (
    <OrderStack.Navigator screenOptions={{headerShown: false}}>
      <OrderStack.Screen name="OrderList" component={OrderListScreen} />
      <OrderStack.Screen name="OrderDetail" component={OrderDetailScreen} />
      <OrderStack.Screen name="CreateOrder" component={CreateOrderScreen} />
    </OrderStack.Navigator>
  );
};

const DashboardNavigator = () => {
  return (
    <OrderStack.Navigator screenOptions={{headerShown: false}}>
      <OrderStack.Screen name="DashboardMain" component={DashboardScreen} />
      <OrderStack.Screen name="CheckIn" component={CheckInScreen} />
      <OrderStack.Screen name="OrderList" component={OrderListScreen} />
      <OrderStack.Screen name="ShipperInfo" component={ShipperInfoScreen} />
      <OrderStack.Screen name="Statistics" component={StatisticsScreen} />
    </OrderStack.Navigator>
  );
};

const ProfileNavigator = () => {
  return (
    <OrderStack.Navigator screenOptions={{headerShown: false}}>
      <OrderStack.Screen name="ProfileMain" component={ProfileScreen} />
      <OrderStack.Screen name="ShipperInfo" component={ShipperInfoScreen} />
    </OrderStack.Navigator>
  );
};

const MainNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        tabBarIcon: ({focused, color, size}) => {
          let iconName;

          switch (route.name) {
            case 'Dashboard':
              iconName = 'dashboard';
              break;
            case 'Orders':
              iconName = 'assignment';
              break;
            case 'Map':
              iconName = 'location-on';
              break;
            case 'History':
              iconName = 'history';
              break;
            case 'Profile':
              iconName = 'person';
              break;
            default:
              iconName = 'circle';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#FF6B35',
        tabBarInactiveTintColor: '#8E8E93',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#E5E5E7',
          paddingTop: 5,
          paddingBottom: 5,
          height: 60,
        },
        headerShown: false,
      })}>
      <Tab.Screen
        name="Dashboard"
        component={DashboardNavigator}
        options={{
          tabBarLabel: 'Trang chủ',
        }}
      />
      <Tab.Screen
        name="Orders"
        component={OrderNavigator}
        options={{
          tabBarLabel: 'Đơn hàng',
        }}
      />
      <Tab.Screen
        name="Map"
        component={MapTrackingScreen}
        options={{
          tabBarLabel: 'Bản đồ',
        }}
      />
      <Tab.Screen
        name="History"
        component={HistoryScreen}
        options={{
          tabBarLabel: 'Lịch sử',
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileNavigator}
        options={{
          tabBarLabel: 'Tài khoản',
        }}
      />
    </Tab.Navigator>
  );
};

export default MainNavigator;
