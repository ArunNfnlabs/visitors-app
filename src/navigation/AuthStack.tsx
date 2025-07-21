import { createNativeStackNavigator, NativeStackNavigationOptions } from '@react-navigation/native-stack';
// import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import { JSX } from 'react';
import LoginScreen from '../screens/auth/LoginScreen';
// import SignupScreen from '../screens/auth/SignupScreen';

export type AuthStackParamList = {
  Login: undefined;
  Signup: undefined;
  ForgotPassword: undefined;
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

export function AuthStack(): JSX.Element {
  return (
    <Stack.Navigator initialRouteName="Login">
        <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ title: 'Login' } as NativeStackNavigationOptions}
        />
    </Stack.Navigator>
  );
}

export default AuthStack;