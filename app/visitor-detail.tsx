import VisitorDetailScreen from '@/src/screens/visitorScreen/VisitorDetailScreen';
import { useEffect, useState } from 'react';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActivityIndicator, View } from 'react-native';

import LoginScreen from './signin';

export default function VisitorDetailPage() {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const fetchToken = async (): Promise<void> => {
      setIsLoading(true);
      const storedToken = await AsyncStorage.getItem('USER_TOKEN');
      setToken(storedToken);
      setIsLoading(false);
    };
    fetchToken();
  }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#ff6b35" />
      </View>
    );
  }
  return token ? <VisitorDetailScreen /> : <LoginScreen />;
} 