import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

export interface Visitor {
    id: string;
    name: string;
    email: string;
    phone: string;
    location: string;
    lastSeenTime: string;
}

export interface User {
    id: string;
    name: string;
    email: string;
    accountType: string;
    trialEndsAt: string | null;
    trialStatus: string | null;
    isActive: boolean;
    isVerified: boolean;
    profilePic: string | null;
    createdAt: string;
    updatedAt: string;
}

const API_BASE_URL = 'https://api-dev.websitechat.in';

// Get stored auth token
const getAuthToken = async (): Promise<string | null> => {
    try {
        return await AsyncStorage.getItem('USER_TOKEN');
    } catch (error) {
        console.error('Error getting auth token:', error);
        return null;
    }
};

// Store auth token
const storeAuthToken = async (token: string): Promise<void> => {
    try {
        await AsyncStorage.setItem('USER_TOKEN', token);
    } catch (error) {
        console.error('Error storing auth token:', error);
    }
};

// Get visitors with authentication
export const getVisitors = async ({
    page = 1,
    limit = 30,
    search = '',
    filter = '12m',
    sortOrder = 'DESC',
}: {
    page?: number;
    limit?: number;
    search?: string;
    filter?: string;
    sortOrder?: 'DESC' | 'ASC';
}): Promise<Visitor[]> => {
    try {
        const token: string | null = await getAuthToken();
        const response = await axios.get(`${API_BASE_URL}/v1/visitors/get-visitors`, {
            params: {
                search,
                page,
                limit,
                filter,
                sortOrder,
            },
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        const visitors: any[] = response.data?.data?.userDetails ?? [];

        // Process visitors and fetch first message for each
        const processedVisitors = await Promise.all(
            visitors.map(async (v: any) => {
                let firstMessage = '';
                
                // Try to fetch the first message for this visitor
                try {
                    const chatResponse = await axios.get(`${API_BASE_URL}/v1/visitors/get-visitors-chat`, {
                        params: { sessionId: v.sessionId },
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    });
                    
                    const chats = chatResponse.data?.data?.chats || [];
                    if (chats.length > 0) {
                        firstMessage = chats[0].question || '';
                    }
                } catch (error) {
                    console.log(`Could not fetch first message for visitor ${v.sessionId}:`, error);
                }

                return {
                    id: v.sessionId?.toString() ?? '',
                    name: v.userDetails?.name?.trim() || 'Visitor',
                    email: v.userDetails?.email || 'not available',
                    phone: v.userDetails?.phone || 'not available',
                    location: v.userDetails?.location || 'not available',
                    lastSeenTime: formatLastSeen(v.startedAt),
                    firstMessage: firstMessage,
                };
            })
        );

        return processedVisitors;
    } catch (err) {
        console.error('Failed to fetch visitors:', err);
        return [];
    }
};

export const getUser = async (): Promise<User | null> => {
    try {
        const token: string | null = await getAuthToken();
        console.log('getUser - Token:', token ? 'Token exists' : 'No token found');
        
        if (!token) {
            console.log('getUser - No token available, returning null');
            return null;
        }
        
        console.log('getUser - Making API request to:', `${API_BASE_URL}/users/get-user`);
        const response = await axios.get(`${API_BASE_URL}/users/get-user`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        console.log('getUser - Response status:', response.status);
        console.log('getUser - Full response:', response.data);
        
        const userData: any = response.data?.data;
        console.log('getUser - userData:', userData);
        
        if (!userData) {
            console.log('getUser - No user data found in response');
            return null;
        }

        const user: User = {
            id: userData.id?.toString() ?? '',
            name: userData.name?.trim() || 'User',
            email: userData.email || 'Unknown',
            accountType: userData.account_type || 'Unknown',
            trialEndsAt: userData.trial_ends_at ?? null,
            trialStatus: userData.trial_status ?? null,
            isActive: Boolean(userData.is_active),
            isVerified: Boolean(userData.is_verified),
            profilePic: userData.profile_pic ?? null,
            createdAt: userData.createdAt ?? '',
            updatedAt: userData.updatedAt ?? '',
        };
        
        console.log('getUser - Processed user object:', user);
        return user;
    } catch (err) {
        console.error('getUser - Failed to fetch user:', err);
        if (axios.isAxiosError(err)) {
            console.error('getUser - Axios error details:', {
                status: err.response?.status,
                statusText: err.response?.statusText,
                data: err.response?.data,
                message: err.message
            });
        }
        return null;
    }
};

// Get visitor chat with authentication
export const getVisitorChat = async (sessionId: string): Promise<any> => {
    try {
        const token: string | null = await getAuthToken();
        const response = await axios.get(`${API_BASE_URL}/v1/visitors/get-visitors-chat`, {
            params: { sessionId },
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (err) {
        console.error('Failed to fetch visitor chat:', err);
        throw err;
    }
};

// Login function with token storage
export const loginUser = async (email: string, password: string): Promise<any> => {
    try {
        const response = await axios.post(`${API_BASE_URL}/users/login`, {
            user_details: {
                email,
                password,
            },
        });

        if (response.data.data && response.data.data.token) {
            await storeAuthToken(response.data.data.token);
        }

        return response.data;
    } catch (error) {
        console.error('Login error:', error);
        throw error;
    }
};

// Logout function
export const logoutUser = async (): Promise<void> => {
    try {
        // Clear stored tokens
        await AsyncStorage.removeItem('USER_TOKEN');
        await AsyncStorage.removeItem('user_data');
    } catch (error) {
        console.error('Logout error:', error);
    }
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

const formatLastSeen = (isoTime: string): string => {
    const date: Date = new Date(isoTime);
    const now: Date = new Date();
    const diffMs: number = now.getTime() - date.getTime();
    const diffMins: number = Math.floor(diffMs / (1000 * 60));
    const diffHours: number = Math.floor(diffMins / 60);
    const diffDays: number = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return '1d ago';
    return `${diffDays}d ago`;
}; 