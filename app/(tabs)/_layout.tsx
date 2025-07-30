import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Tabs } from 'expo-router';
import React, { useEffect, useState } from 'react';

export default function TabLayout() {
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('USER_TOKEN');
        setToken(storedToken);
      } catch (error) {
        console.error('Error fetching token:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchToken();
  }, []);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#6366F1',
        tabBarInactiveTintColor: '#9CA3AF',
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          marginTop: 2,
        },
        tabBarBackground: TabBarBackground,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E5E5EA',
          height: 80,
          paddingBottom: 12,
          paddingTop: 8,
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: -2,
          },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 8,
          // Hide tab bar when no token
          display: (isLoading || !token) ? 'none' : 'flex',
        },
        tabBarItemStyle: {
          paddingVertical: 4,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          tabBarShowLabel: false,
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol
              size={24}
              name="person.2.fill"
              color={focused ? '#6366F1' : '#9CA3AF'}
            />
          ),
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="dashboard"
        options={{
          tabBarShowLabel: false,
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol
              size={24}
              name="chart.bar.fill"
              color={focused ? '#6366F1' : '#9CA3AF'}
            />
          ),
          headerShown: false,
        }}
      />
    </Tabs>
  );
}
