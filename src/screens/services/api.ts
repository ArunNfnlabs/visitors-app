// src/services/api.ts

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

const API_BASE_URL = 'https://api-uat.websitechat.in/v1';

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
        const token: string | null = await AsyncStorage.getItem('USER_TOKEN');
        const response = await axios.get(`https://api-uat.websitechat.in/users/get-user`, {
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

        return visitors.map((v: any) => ({
            id: v.sessionId?.toString() ?? '',
            name: v.userDetails?.name?.trim() || 'Visitor',
            email: v.userDetails?.email || 'N/A',
            phone: v.userDetails?.phone || 'N/A',
            location: v.userDetails?.location || 'N/A',
            lastSeenTime: formatLastSeen(v.startedAt),
        }));
    } catch (err) {
        console.error('Failed to fetch visitors:', err);
        return [];
    }
};

export const getUser = async (): Promise<User | null> => {
    try {
        const token: string | null = await AsyncStorage.getItem('USER_TOKEN');
        const response = await axios.get(`${API_BASE_URL}/users/get-user`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        const userData: any = response.data?.data;
        console.log(userData, 'userData');
        if (!userData) {
            return null;
        }

        return {
            id: userData.id?.toString() ?? '',
            name: userData.name?.trim() || 'User',
            email: userData.email || 'N/A',
            accountType: userData.account_type || 'N/A',
            trialEndsAt: userData.trial_ends_at ?? null,
            trialStatus: userData.trial_status ?? null,
            isActive: Boolean(userData.is_active),
            isVerified: Boolean(userData.is_verified),
            profilePic: userData.profile_pic ?? null,
            createdAt: userData.createdAt ?? '',
            updatedAt: userData.updatedAt ?? '',
        };
    } catch (err) {
        console.error('Failed to fetch user:', err);
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
