import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'https://api.websitechat.in/v1';

// Get stored auth token
const getAuthToken = async (): Promise<string | null> => {
    try {
        return await AsyncStorage.getItem('auth_token');
    } catch (error) {
        console.error('Error getting auth token:', error);
        return null;
    }
};

// Store auth token
const storeAuthToken = async (token: string): Promise<void> => {
    try {
        await AsyncStorage.setItem('auth_token', token);
    } catch (error) {
        console.error('Error storing auth token:', error);
    }
};

// Create headers with auth token
const createHeaders = async (): Promise<HeadersInit> => {
    const token = await getAuthToken();
    return {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
    };
};

// Common API call function
const apiCall = async (endpoint: string, options: RequestInit = {}): Promise<any> => {
    try {
        const headers = await createHeaders();
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers: {
                ...headers,
                ...options.headers,
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('API call error:', error);
        throw error;
    }
};

// Common API call function with token storage (for login)
const apiCallWithTokenStorage = async (endpoint: string, options: RequestInit = {}): Promise<any> => {
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        // If login successful and token exists, store it
        if (data.token) {
            await storeAuthToken(data.token);
        }

        return data;
    } catch (error) {
        console.error('API call error:', error);
        throw error;
    }
};

// Get visitors with authentication
export const getVisitors = async (params: any = {}): Promise<any> => {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = `/visitors/get-visitors${queryString ? `?${queryString}` : ''}`;
    
    return apiCall(endpoint);
};

// Get visitor chat with authentication
export const getVisitorChat = async (sessionId: string): Promise<any> => {
    const endpoint = `/visitors/get-visitors-chat?sessionId=${sessionId}`;
    
    return apiCall(endpoint);
};

// Login function with token storage
export const loginUser = async (email: string, password: string): Promise<any> => {
    return apiCallWithTokenStorage('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
    });
};

// Logout function
export const logoutUser = async (): Promise<void> => {
    try {
        // Clear stored tokens
        await AsyncStorage.removeItem('auth_token');
        await AsyncStorage.removeItem('user_data');
    } catch (error) {
        console.error('Logout error:', error);
    }
};

// Generic authenticated API call
export const authenticatedApiCall = async (endpoint: string, options: RequestInit = {}): Promise<any> => {
    return apiCall(endpoint, options);
};

// Check if user is authenticated
export const isAuthenticated = async (): Promise<boolean> => {
    try {
        const token = await getAuthToken();
        return !!token;
    } catch (error) {
        return false;
    }
};

// Get current user data
export const getCurrentUser = async (): Promise<any> => {
    try {
        const userData = await AsyncStorage.getItem('user_data');
        return userData ? JSON.parse(userData) : null;
    } catch (error) {
        console.error('Error getting user data:', error);
        return null;
    }
}; 