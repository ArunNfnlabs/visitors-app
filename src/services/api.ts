import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

export interface Visitor {
    id: string;
    name: string;
    email: string;
    phone: string;
    location: string;
    lastSeenTime: string;
    chatbotName: string;
    avatar_url: string;
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

export interface LineChartData {
    dailyCounts: {
        label: string;
        count: number;
    }[];
    currentPeriodTotalChats: number;
    percentageChangeInTotalChats: string;
    currentPeriodAverageChats: string;
    percentageChangeInAverageChats: string;
}

export interface HeatMapData {
    interval: string;
    time_slot: string;
    count: number;
}

export interface UsageData {
    charactersPercentage: number;
    creditPercentage: number;
    charactersUsed: number;
    creditsUsed: number;
    totalCharactersAvailable: number;
    totalCreditsAvailable: number;
    totalCharacters: number;
    totalCredits: number;
    addOnCharacters: number;
    addOnCredits: number;
    rolloverCharacters: number;
    rolloverCredits: number | null;
    currentPlanDetails: {
        name: string;
        price: number;
        credits: number;
        is_Active: boolean;
        query_limit: number;
        pdfs_allowed: number;
        pdf_size_limit: number;
        character_limit: number;
        remove_branding: boolean;
        priority_support: boolean;
        webpages_allowed: number;
        ai_powered_chatbot: boolean;
        custom_knowledge_base: boolean;
        knowledgebase_sources: number;
        rollover_unused_queries: boolean;
        customization_of_chatbot: string;
        future_addons_integrations: boolean;
        is_active: boolean;
    };
    planExpiryDate: string;
    planStartDate: string;
    cancelledStatus: boolean;
    cancelledAt: string | null;
    gracePeriod: string | null;
    planUpdatedTo: string | null;
    waitlistUser: any | null;
}

export interface ChatbotDetails {
    is_active: boolean;
    websiteLink: string;
    chatbot_name: string;
    updated_at: string;
    visitors_count: number;
    chatbotLogo: string;
}

const API_BASE_URL = 'https://api-uat.websitechat.in';

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
                let chatbotName = '';
                let avatar_url = '';
                
                // Try to fetch the first message for this visitor
                try {
                    const chatResponse = await axios.get(`${API_BASE_URL}/v1/visitors/get-visitors-chat`, {
                        params: { sessionId: v.sessionId },
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    });
                    
                    const chats = chatResponse.data?.data?.chats || [];
                    chatbotName = chatResponse.data?.data?.chatbotConfig?.chatbot_name || 'N/A';
                    avatar_url = chatResponse.data?.data?.chatbotConfig?.avatar_url || 'N/A';
                    if (chats.length > 0) {
                        firstMessage = chats[0].question || '';
                    }
                } catch (error) {
                    console.log(`Could not fetch first message for visitor ${v.sessionId}:`, error);
                }

                return {
                    id: v.sessionId?.toString() ?? '',
                    name: v.userDetails?.name?.trim() || 'Visitor',
                    email: v.userDetails?.email || 'N/A',
                    phone: v.userDetails?.phone || 'N/A',
                    location: v.userDetails?.location || 'N/A',
                    lastSeenTime: formatLastSeen(v.startedAt),
                    firstMessage: firstMessage,
                    chatbotName: chatbotName,
                    avatar_url: avatar_url,
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

// Get line chart data
export const getLineChart = async (timeRange: string = '7d'): Promise<LineChartData | null> => {
    try {
        const token: string | null = await getAuthToken();
        console.log('getLineChart - Token:', token ? 'Token exists' : 'No token found');
        console.log('getLineChart - Making API request to:', `${API_BASE_URL}/v1/metrics/get-line-chart`);
        console.log('getLineChart - TimeRange:', timeRange);
        
        const response = await axios.get(`${API_BASE_URL}/v1/metrics/get-line-chart`, {
            params: { timeRange },
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        console.log('getLineChart - Response status:', response.status);
        console.log('getLineChart - Full response:', JSON.stringify(response.data, null, 2));
        
        if (response.data.status && response.data.data) {
            console.log('getLineChart - Data extracted successfully');
            return response.data.data;
        } else {
            console.log('getLineChart - No data in response');
            return null;
        }
    } catch (err) {
        console.error('getLineChart - Failed to fetch line chart data:', err);
        if (axios.isAxiosError(err)) {
            console.error('getLineChart - Axios error details:', {
                status: err.response?.status,
                statusText: err.response?.statusText,
                data: err.response?.data,
                message: err.message
            });
        }
        return null;
    }
};

// Get heat map data
export const getHeatMap = async (days: string = '7d'): Promise<HeatMapData[] | null> => {
    try {
        const token: string | null = await getAuthToken();
        console.log('getHeatMap - Token:', token ? 'Token exists' : 'No token found');
        console.log('getHeatMap - Making API request to:', `${API_BASE_URL}/v1/metrics/get-heat-map`);
        console.log('getHeatMap - Days:', days);
        
        const response = await axios.get(`${API_BASE_URL}/v1/metrics/get-heat-map`, {
            params: { days },
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        console.log('getHeatMap - Response status:', response.status);
        console.log('getHeatMap - Full response:', JSON.stringify(response.data, null, 2));
        
        if (response.data.status && response.data.data) {
            console.log('getHeatMap - Data extracted successfully');
            return response.data.data;
        } else {
            console.log('getHeatMap - No data in response');
            return null;
        }
    } catch (err) {
        console.error('getHeatMap - Failed to fetch heat map data:', err);
        if (axios.isAxiosError(err)) {
            console.error('getHeatMap - Axios error details:', {
                status: err.response?.status,
                statusText: err.response?.statusText,
                data: err.response?.data,
                message: err.message
            });
        }
        return null;
    }
};

// Get usage data
export const getUsageData = async (): Promise<UsageData | null> => {
    try {
        const token: string | null = await getAuthToken();
        console.log('getUsageData - Token:', token ? 'Token exists' : 'No token found');
        console.log('getUsageData - Making API request to:', `${API_BASE_URL}/plans/v2/characters-usage-and-credit-usage`);
        
        const response = await axios.get(`${API_BASE_URL}/plans/v2/characters-usage-and-credit-usage`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        console.log('getUsageData - Response status:', response.status);
        console.log('getUsageData - Full response:', JSON.stringify(response.data, null, 2));
        
        if (response.data.status && response.data) {
            console.log('getUsageData - Data extracted successfully');
            return response.data;
        } else {
            console.log('getUsageData - No data in response');
            return null;
        }
    } catch (err) {
        console.error('getUsageData - Failed to fetch usage data:', err);
        if (axios.isAxiosError(err)) {
            console.error('getUsageData - Axios error details:', {
                status: err.response?.status,
                statusText: err.response?.statusText,
                data: err.response?.data,
                message: err.message
            });
        }
        return null;
    }
};

// Get chatbot details
export const getChatbotDetails = async (chatbotId: string): Promise<ChatbotDetails | null> => {
    try {
        const token: string | null = await getAuthToken();
        console.log('getChatbotDetails - Token:', token ? 'Token exists' : 'No token found');
        console.log('getChatbotDetails - Making API request to:', `${API_BASE_URL}/chatbot/v1/chatbot-details/${chatbotId}`);
        
        const response = await axios.get(`${API_BASE_URL}/chatbot/v1/chatbot-details/${chatbotId}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        console.log('getChatbotDetails - Response status:', response.status);
        console.log('getChatbotDetails - Full response:', JSON.stringify(response.data, null, 2));
        
        if (response.data.status && response.data.data) {
            console.log('getChatbotDetails - Data extracted successfully');
            return response.data.data;
        } else {
            console.log('getChatbotDetails - No data in response');
            return null;
        }
    } catch (err) {
        console.error('getChatbotDetails - Failed to fetch chatbot details:', err);
        if (axios.isAxiosError(err)) {
            console.error('getChatbotDetails - Axios error details:', {
                status: err.response?.status,
                statusText: err.response?.statusText,
                data: err.response?.data,
                message: err.message
            });
        }
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