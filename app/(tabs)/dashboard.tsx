import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import ChatMetricsChart from '../../src/components/ChatMetricsChart';
import Header from '../../src/components/Header';
import HeatMapChart from '../../src/components/HeatMapChart';
import { getUsageData, getUser, getVisitors, logoutUser, UsageData, User, Visitor } from '../../src/services/api';
import LoginScreen from '../signin';

import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ChatScreen() {
    const router = useRouter();
    const [recentVisitors, setRecentVisitors] = useState<Visitor[]>([]);
    const [loading, setLoading] = useState(true);
    const [usageData, setUsageData] = useState<UsageData | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [showSidebar, setShowSidebar] = useState(false);
    const [search, setSearch] = useState('');
    const [sortOrder, setSortOrder] = useState<'recent' | 'oldest'>('recent');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [visitors, usage, userData] = await Promise.all([
                getVisitors({ limit: 3 }),
                getUsageData(),
                getUser()
            ]);
            setRecentVisitors(visitors);
            setUsageData(usage);
            setUser(userData);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatLastSeen = (lastSeenTime: string) => {
        const now = new Date();
        const lastSeen = new Date(lastSeenTime);
        const diffMs = now.getTime() - lastSeen.getTime();
        const diffMins = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays === 1) return 'Yesterday';
        
        return lastSeen.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    };

    const handleSeeAllChats = () => {
        router.push('/');
    };

    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

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
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#6366F1" />
            </View>
        );
    }

    return (
        token ?
            <View style={styles.container}>
                <Header
                    user={user as any}
                    showSidebar={showSidebar}
                    setShowSidebar={setShowSidebar}
                    search={search}
                    setSearch={setSearch}
                    sortOrder={sortOrder}
                    setSortOrder={setSortOrder}
                    handleLogout={async () => {
                        await logoutUser();
                        router.replace('/signin');
                    }}
                    router={router}
                />
                <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                    {/* AI Assistant Card */}
                    <View style={styles.assistantCard}>
                        <View style={styles.assistantHeader}>
                            <View style={styles.assistantInfo}>
                                <View style={styles.assistantIcon}>
                                    <Icon name="smart-toy" size={24} color="#FFFFFF" />
                                </View>
                                <View style={styles.assistantStatus}>
                                    <View style={styles.statusIndicator} />
                                    <Text style={styles.statusText}>Active</Text>
                                </View>
                            </View>
                            <View style={styles.creditsWidget}>
                                <Icon name="monetization-on" size={20} color="#F59E0B" />
                                <Text style={styles.creditsText}>
                                    {usageData ? `${usageData.totalCreditsAvailable} Credits available` : 'Loading...'}
                                </Text>
                            </View>
                        </View>
                        
                        <Text style={styles.assistantName}>AI Help Desk</Text>
                        <Text style={styles.lastUpdate}>Last update : 22 Jul, 2025</Text>
                        
                        <View style={styles.assistantDetails}>
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>Website</Text>
                                <Text style={styles.detailValue}>websitechat.in</Text>
                            </View>
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>Number of Visitors</Text>
                                <Text style={styles.detailValue}>47</Text>
                            </View>
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>Subscription</Text>
                                <View style={styles.subscriptionInfo}>
                                    <View style={styles.subscriptionDot} />
                                    <Text style={styles.detailValue}>
                                        {usageData?.currentPlanDetails?.name || 'Loading...'}
                                    </Text>
                                </View>
                            </View>
                            {usageData && (
                                <>
                                    <View style={styles.detailRow}>
                                        <Text style={styles.detailLabel}>Characters Used</Text>
                                        <Text style={styles.detailValue}>
                                            {usageData.charactersUsed.toLocaleString()} / {usageData.totalCharacters.toLocaleString()}
                                        </Text>
                                    </View>
                                    <View style={styles.detailRow}>
                                        <Text style={styles.detailLabel}>Plan Expiry</Text>
                                        <Text style={styles.detailValue}>{usageData.planExpiryDate}</Text>
                                    </View>
                                </>
                            )}
                        </View>
                    </View>

                    {/* Charts */}
                    <ChatMetricsChart />
                    <HeatMapChart />

                    {/* Recent Visitors */}
                    <View style={styles.recentVisitorsContainer}>
                        <Text style={styles.recentVisitorsTitle}>RECENT VISITORS</Text>
                        
                        {loading ? (
                            <View style={styles.loadingContainer}>
                                <Text style={styles.loadingText}>Loading visitors...</Text>
                            </View>
                        ) : recentVisitors.length > 0 ? (
                            <>
                                {recentVisitors.map((visitor, index) => (
                                    <View key={visitor.id} style={styles.visitorItem}>
                                        <View style={styles.visitorAvatar}>
                                            <Text style={styles.visitorInitial}>V</Text>
                                        </View>
                                        <View style={styles.visitorInfo}>
                                            <Text style={styles.visitorName}>{visitor.name}</Text>
                                            <Text style={styles.visitorTime}>{formatLastSeen(visitor.lastSeenTime)}</Text>
                                        </View>
                                    </View>
                                ))}
                                
                                <TouchableOpacity style={styles.seeAllButton} onPress={handleSeeAllChats}>
                                    <Icon name="chat-bubble-outline" size={16} color="#475569" />
                                    <Text style={styles.seeAllText}>See all chats</Text>
                                </TouchableOpacity>
                            </>
                        ) : (
                            <View style={styles.noVisitorsContainer}>
                                <Text style={styles.noVisitorsText}>No recent visitors</Text>
                            </View>
                        )}
                    </View>
                </ScrollView>
            </View>
            : <LoginScreen />
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    scrollView: {
        flex: 1,
        paddingHorizontal: 12,
        paddingTop: 8,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    assistantCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 20,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
        position: 'relative',
        overflow: 'hidden',
    },
    assistantHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    assistantInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    assistantIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#FF6B35',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    assistantStatus: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statusIndicator: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#10B981',
        marginRight: 6,
    },
    statusText: {
        fontSize: 12,
        color: '#10B981',
        fontWeight: '600',
    },
    creditsWidget: {
        borderRadius: 12,
        padding: 6,
        paddingHorizontal: 12,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 1,
    },
    creditsText: {
        fontSize: 10,
        fontWeight: '700',
        color: '#1E293B',
        marginLeft: 8,
    },
    assistantName: {
        fontSize: 24,
        fontWeight: '700',
        color: '#1E293B',
        marginBottom: 4,
    },
    lastUpdate: {
        fontSize: 13,
        color: '#64748B',
        marginBottom: 20,
    },
    assistantDetails: {
        gap: 12,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    detailLabel: {
        fontSize: 14,
        color: '#64748B',
        fontWeight: '500',
    },
    detailValue: {
        fontSize: 14,
        color: '#1E293B',
        fontWeight: '600',
    },
    subscriptionInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    subscriptionDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#FF6B35',
        marginRight: 6,
    },
    recentVisitorsContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    recentVisitorsTitle: {
        fontSize: 12,
        fontWeight: '600',
        color: '#64748B',
        marginBottom: 16,
        letterSpacing: 0.5,
    },
    visitorItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    visitorAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#DBEAFE',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    visitorInitial: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1E40AF',
    },
    visitorInfo: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    visitorName: {
        fontSize: 14,
        fontWeight: '500',
        color: '#1E293B',
    },
    visitorTime: {
        fontSize: 12,
        color: '#64748B',
    },
    seeAllButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 8,
        backgroundColor: '#FFFFFF',
        marginTop: 8,
    },
    seeAllText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#475569',
        marginLeft: 8,
    },
    loadingText: {
        fontSize: 14,
        color: '#64748B',
    },
    noVisitorsContainer: {
        padding: 20,
        alignItems: 'center',
    },
    noVisitorsText: {
        fontSize: 14,
        color: '#64748B',
    },
});