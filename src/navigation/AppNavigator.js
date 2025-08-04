import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';
import {useAuth} from '../hooks/useAuth';
import { navigationRef } from './NavigationRef';
import ChatBot from '../components/ChatBot';

const Stack = createStackNavigator();

const AppNavigator = () => {
  const {isAuthenticated} = useAuth();

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator screenOptions={{headerShown: false}}>
        {isAuthenticated ? (
          <Stack.Screen name="Main" component={MainNavigator} />
        ) : (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        )}
      </Stack.Navigator>
      <ChatBot/>
    </NavigationContainer>
  );
};

export default AppNavigator;
