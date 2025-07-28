import { useAuth } from '@/src/context/AuthContext';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Image,
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
import Toast from 'react-native-root-toast';
import Icon from 'react-native-vector-icons/MaterialIcons';

const EMAIL_PLACEHOLDER = 'Email';
const PASSWORD_PLACEHOLDER = 'Password';
const PLACEHOLDER_COLOR = '#bdbdbd';

export default function LoginScreen() {
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const { login, user } = useAuth();
    const router = useRouter();

    const executeLogin = async (): Promise<void> => {
        if (!email.trim() || !password.trim()) {
            Toast.show('Please enter both email and password', {
                duration: Toast.durations.SHORT,
                position: Toast.positions.BOTTOM,
                backgroundColor: '#ff6b35',
                textColor: '#fff',
            });
            return;
        }
        setIsLoading(true);
        const result = await login(email.trim(), password.trim());
        setIsLoading(false);

        if (!result.success) {
            Toast.show(
                result.error ||
                    'Invalid credentials. Please try:\nEmail: admin@websitechat.com\nPassword: password123',
                {
                    duration: Toast.durations.LONG,
                    position: Toast.positions.BOTTOM,
                    backgroundColor: '#ff6b35',
                    textColor: '#fff',
                }
            );
        }
    };

    useEffect(() => {
        if (user) {
            // User is already authenticated, auth context will handle navigation
        }
    }, [user]);

    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <ActivityIndicator size="large" color="#ff6b35" />
            </View>
        );
    }

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
                        <View style={styles.logoImageWrapper}>
                            <Image
                                source={require('@/assets/images/logo.png')}
                                style={styles.logoImage}
                                resizeMode="contain"
                            />
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
                                placeholder={EMAIL_PLACEHOLDER}
                                placeholderTextColor={PLACEHOLDER_COLOR}
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
                                placeholder={PASSWORD_PLACEHOLDER}
                                placeholderTextColor={PLACEHOLDER_COLOR}
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry
                                autoCapitalize="none"
                                autoCorrect={false}
                            />
                        </View>
                        {/* Sign In Button */}
                        <TouchableOpacity
                            style={[styles.signInButton, isLoading && styles.signInButtonDisabled]}
                            onPress={executeLogin}
                            disabled={isLoading}
                        >
                            <Text style={styles.signInButtonText}>
                                {isLoading ? 'Signing in...' : 'Signin'}
                            </Text>
                        </TouchableOpacity>
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
    logoImageWrapper: {
        width: 40,
        height: 40,
        borderRadius: 30,
        backgroundColor: '#ff6b35',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
        overflow: 'hidden',
    },
    logoImage: {
        width: 40,
        height: 40,
    },
    logoText: {
        fontSize: 24,
        fontWeight: '600',
        color: '#ff6b35',
        textAlign: 'center',
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