import { NavigationContainer } from '@react-navigation/native';
import React from 'react';
import { useAuth } from '../context/AuthContext';
import AppStack from './AppStack';
import AuthStack from './AuthStack';

export default function RootNavigator() {
  const { user } = useAuth();
  return (
    <NavigationContainer>
      {user ? <AppStack /> : <AuthStack />}
    </NavigationContainer>
  );
}