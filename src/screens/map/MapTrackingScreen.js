import React from 'react';
import {View, Text, StyleSheet, StatusBar} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const MapTrackingScreen = () => {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#FF6B35" />

      <View style={styles.content}>
        <Icon name="map" size={80} color="#FF6B35" />
        <Text style={styles.title}>Bản đồ theo dõi</Text>
        <Text style={styles.comingSoonText}>
          Chức năng theo dõi vị trí trên bản đồ đang được phát triển...
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 10,
  },
  comingSoonText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

export default MapTrackingScreen;
