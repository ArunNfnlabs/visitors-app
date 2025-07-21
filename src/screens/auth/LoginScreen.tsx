import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

/**
 * NOTE:
 * The navigation route name 'VisitorList' must match exactly with the route defined in your navigator.
 * If you see a warning like:
 *   "The action 'NAVIGATE' with payload {"name":"VisitorList"} was not handled by any navigator."
 * it means that the route 'VisitorList' does not exist in your navigation configuration.
 * 
 * Please check your navigation setup and ensure that the route name is correct.
 * For example, if your navigator defines the route as 'VisitorsList', you must use that exact name.
 * 
 * Example:
 * navigation.navigate('VisitorsList');
 * 
 * Replace 'VISITOR_LIST_ROUTE' below with the correct route name as defined in your navigator.
 */
const VISITOR_LIST_ROUTE = 'Visitors'; // <-- Change this to match your actual route name

export default function LoginScreen() {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const navigation = useNavigation();

  // Dummy credentials
  const DUMMY_EMAIL = 'admin@websitechat.com';
  const DUMMY_PASSWORD = 'password123';

  const handleLogin = async (): Promise<void> => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      if (email.trim() === DUMMY_EMAIL && password.trim() === DUMMY_PASSWORD) {
        setLoading(false);
        // Navigate to visitor list page using the correct route name
        navigation.navigate(VISITOR_LIST_ROUTE as never);
      } else {
        setLoading(false);
        Alert.alert(
          'Login Failed',
          'Invalid credentials. Please try:\nEmail: admin@websitechat.com\nPassword: password123'
        );
      }
    }, 1000);
  };

  const handleDemoLogin = (): void => {
    setEmail(DUMMY_EMAIL);
    setPassword(DUMMY_PASSWORD);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Logo Section */}
          <View style={styles.logoContainer}>
            <View style={styles.logoIcon}>
              <Text style={styles.logoIconText}>✨</Text>
            </View>
            <Text style={styles.logoText}>WebsiteChat</Text>
          </View>

          {/* Welcome Section */}
          <View style={styles.welcomeContainer}>
            <Text style={styles.welcomeTitle}>Hey, Login now!</Text>
            <Text style={styles.welcomeSubtitle}>to see your latest visitors</Text>
          </View>

          {/* Form Section */}
          <View style={styles.formContainer}>
            {/* Email Input */}
            <View style={styles.inputContainer}>
              <Icon name="email" size={20} color="#ff6b35" style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            {/* Password Input */}
            <View style={styles.inputContainer}>
              <Icon name="lock" size={20} color="#ff6b35" style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            {/* Demo Credentials Helper */}
            <TouchableOpacity style={styles.demoButton} onPress={handleDemoLogin}>
              <Text style={styles.demoButtonText}>
                Use demo credentials
              </Text>
            </TouchableOpacity>

            {/* Sign In Button */}
            <TouchableOpacity
              style={[styles.signInButton, loading && styles.signInButtonDisabled]}
              onPress={handleLogin}
              disabled={loading}
            >
              <Text style={styles.signInButtonText}>
                {loading ? 'Signing in...' : 'Signin'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Demo Info */}
          <View style={styles.demoInfoContainer}>
            <Text style={styles.demoInfoTitle}>Demo Credentials:</Text>
            <Text style={styles.demoInfoText}>Email: admin@websitechat.com</Text>
            <Text style={styles.demoInfoText}>Password: password123</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  logoIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#ff6b35',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  logoIconText: {
    fontSize: 24,
    color: '#fff',
  },
  logoText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#ff6b35',
  },
  welcomeContainer: {
    marginBottom: 40,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#999',
    lineHeight: 24,
  },
  formContainer: {
    marginBottom: 40,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 4,
    marginBottom: 16,
    backgroundColor: '#fafafa',
  },
  inputIcon: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    paddingVertical: 12,
  },
  demoButton: {
    alignSelf: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  demoButtonText: {
    fontSize: 14,
    color: '#007AFF',
    textDecorationLine: 'underline',
  },
  signInButton: {
    backgroundColor: '#ff6b35',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#ff6b35',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  signInButtonDisabled: {
    backgroundColor: '#ffb499',
    shadowOpacity: 0.1,
    elevation: 2,
  },
  signInButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  demoInfoContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  demoInfoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#495057',
    marginBottom: 8,
  },
  demoInfoText: {
    fontSize: 13,
    color: '#6c757d',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    marginBottom: 2,
  },
});