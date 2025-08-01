/**
 * S7M Drive - Delivery App
 * @format
 */

import React from 'react';
import {StatusBar} from 'react-native';
import {AuthProvider} from './src/hooks/useAuth';
import AppNavigator from './src/navigation/AppNavigator';

function App() {
  return (
    <AuthProvider>
      <StatusBar barStyle="light-content" backgroundColor="#FF6B35" />
      <AppNavigator />
    </AuthProvider>
  );
}

export default App;
