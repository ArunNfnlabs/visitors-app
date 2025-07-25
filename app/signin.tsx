import VisitorsListScreen from '@/src/screens/visitorScreen/VisitorsListScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
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

type LoginResponse = {
    token?: string;
    message?: string;
};


async function executeLoginRequest(email: string, password: string): Promise<LoginResponse> {
    try {
        const response = await fetch('https://api-dev.websitechat.in/users/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                user_details: {
                    email,
                    password,
                },
            }),
        });

        if (response.status === 200) {
            const data = await response.json();
            await AsyncStorage.setItem('USER_TOKEN', data.data.token);

            return { token: data.data.token };
        }

        if (response.status === 401) {
            return { message: 'Invalid credentials. Please check your email and password.' };
        }
        if (response.status === 404) {
            return { message: 'User not found. Please check your email.' };
        }
        return { message: 'An unexpected error occurred. Please try again.' };
    } catch (error) {
        return { message: 'Network error. Please try again.' };
    }
}

export default function LoginScreen() {
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const handleLogin = async (): Promise<void> => {
        if (!email.trim() || !password.trim()) {
            Alert.alert('Error', 'Please enter both email and password');
            return;
        }
        setIsLoading(true);
        const result = await executeLoginRequest(email.trim(), password.trim());
        setIsLoading(false);

        if (result.token) {
            // Store JWT token securely (e.g., AsyncStorage, SecureStore)
            // Navigate to the main app screen or update auth context
            // For demonstration, just show a success alert
            Alert.alert('Success', 'Successfully logged in!');
            // TODO: Implement navigation or context update here
        } else {
            Alert.alert('Login Failed', result.message || 'Invalid credentials. Please try:\nEmail: admin@websitechat.com\nPassword: password123');
        }
    };
    
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

    return (

        token ? <VisitorsListScreen /> :
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
                            <Text style={styles.logoText}>
                                {/* Replace with an Image or SVG component as needed */}
                                <Icon name="chat" size={40} color="#FE7624" style={{ marginRight: 8 }} />
                                WebsiteChat
                            </Text>
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
                            {/* Sign In Button */}
                            <TouchableOpacity
                                style={[styles.signInButton, isLoading && styles.signInButtonDisabled]}
                                onPress={handleLogin}
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
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
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