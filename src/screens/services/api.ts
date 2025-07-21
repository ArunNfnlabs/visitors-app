// src/services/api.ts

import axios from 'axios';

export interface Visitor {
    id: string;
    name: string;
    email: string;
    lastSeenTime: string;
}

const API_BASE_URL = 'https://api.websitechat.in/v1';

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
        const token = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTksImVtYWlsIjoic3VwcG9ydEB3ZWJzaXRlY2hhdC5pbiIsImlhdCI6MTc1MjU4MzI3NSwiZXhwIjoxNzU1MTc1Mjc1fQ.Bl5w7ArWAct3mzlj1EzR2kT6vN1NFgjMG2oLgehkWdg'; // Replace with real token from auth context or storage

        const response = await axios.get(`${API_BASE_URL}/visitors/get-visitors`, {
            params: {
                search,
                page,
                limit,
                filter,
                sortOrder,
            },
            headers: {
                Authorization: token,
            },
        });

        const visitors = response.data?.data?.userDetails ?? [];

        return visitors.map((v: any) => ({
            id: v.sessionId.toString(),
            name: v.userDetails?.name?.trim() || 'Visitor',
            email: v.userDetails?.email || 'Unknown',
            lastSeenTime: formatLastSeen(v.startedAt),
        }));
    } catch (err) {
        console.error('Failed to fetch visitors:', err);
        return [];
    }
};

const formatLastSeen = (isoTime: string): string => {
    const date = new Date(isoTime);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();

    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return '1d ago';
    return `${diffDays}d ago`;
};
