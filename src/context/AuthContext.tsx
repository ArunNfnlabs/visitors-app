import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useState } from "react";

type User = {
    token: string;
    email: string;
    [key: string]: unknown;
} | null;

type AuthContextType = {
    user: User;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    logout: () => Promise<void>;
    checkAuthStatus: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

const TOKEN_KEY = 'USER_TOKEN';
const USER_KEY = 'user_data';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const saveToken = async (token: string, userData: any): Promise<void> => {
        try {
            await AsyncStorage.setItem(TOKEN_KEY, token);
            await AsyncStorage.setItem(USER_KEY, JSON.stringify(userData));
        } catch (error) {
            console.error('Error saving token:', error);
        }
    };

    const removeToken = async (): Promise<void> => {
        try {
            await AsyncStorage.removeItem(TOKEN_KEY);
            await AsyncStorage.removeItem(USER_KEY);
        } catch (error) {
            console.error('Error removing token:', error);
        }
    };

    const checkAuthStatus = async (): Promise<void> => {
        try {
            const token = await AsyncStorage.getItem(TOKEN_KEY);
            const userData = await AsyncStorage.getItem(USER_KEY);
            
            if (token && userData) {
                const parsedUserData = JSON.parse(userData);
                setUser({ ...parsedUserData, token });
            }
        } catch (error) {
            console.error('Error checking auth status:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
        try {
            setIsLoading(true);
            console.log('Login attempt for email:', email);
            
            // For demo purposes, use dummy credentials
            const DUMMY_EMAIL = 'admin@websitechat.com';
            const DUMMY_PASSWORD = 'password123';
            
            if (email === DUMMY_EMAIL && password === DUMMY_PASSWORD) {
                console.log('Using dummy credentials for demo');
                // Simulate API response
                const mockUserData = {
                    token: 'mock_token_' + Date.now(),
                    email: email,
                    id: 1,
                    name: 'Admin User'
                };
                
                await saveToken(mockUserData.token, mockUserData);
                setUser(mockUserData);
                
                return { success: true };
            } else {
                console.log('Making real API call to:', 'https://api-dev.websitechat.in/users/login');
                // Real API call with correct endpoint and format
                const requestBody = {
                    user_details: {
                        email: email,
                        password: password
                    }
                };
                console.log('Request body:', JSON.stringify(requestBody, null, 2));
                
                const response = await fetch("https://api-dev.websitechat.in/users/login", {
                    method: "POST",
                    headers: { 
                        "Content-Type": "application/json" 
                    },
                    body: JSON.stringify(requestBody),
                });
                
                console.log('Response status:', response.status);
                console.log('Response headers:', response.headers);
                
                const data = await response.json();
                console.log('Login API response:', JSON.stringify(data, null, 2));
                
                if (response.ok && data.data && data.data.token) {
                    console.log('Login successful, token received');
                    const userData = {
                        token: data.data.token,
                        email: email,
                        id: data.data.id || 1,
                        name: data.data.name || 'User',
                        ...data.data
                    };
                    
                    await saveToken(userData.token, userData);
                    setUser(userData);
                    return { success: true };
                } else {
                    console.log('Login failed:', data);
                    const errorMessage = data.message || data.error || 'Login failed';
                    return { success: false, error: errorMessage };
                }
            }
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, error: 'Network error. Please try again.' };
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async (): Promise<void> => {
        try {
            await removeToken();
            setUser(null);
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    useEffect(() => {
        checkAuthStatus();
    }, []);

    return (
        <AuthContext.Provider value={{ user, isLoading, login, logout, checkAuthStatus }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
