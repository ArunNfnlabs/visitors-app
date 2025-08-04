import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import ChatMetricsChart from '../../src/components/ChatMetricsChart';
import HeatMapChart from '../../src/components/HeatMapChart';
import { ChatbotDetails, getChatbotDetails, getUsageData, getUser, getVisitors, UsageData, User, Visitor } from '../../src/services/api';
import LoginScreen from '../signin';

import AsyncStorage from '@react-native-async-storage/async-storage';

// Skeleton Loader Components
const SkeletonBox = ({ width, height, borderRadius = 4, style = {} }: { width: number | string, height: number, borderRadius?: number, style?: any }) => (
    <View
        style={[
            {
                width,
                height,
                borderRadius,
                backgroundColor: '#E5E7EB',
                marginVertical: 4,
                overflow: 'hidden',
            },
            style,
        ]}
    />
);

const AssistantCardSkeleton = () => (
    <View style={styles.assistantCard}>
        <View style={styles.assistantHeader}>
            <View style={styles.assistantInfo}>
                <SkeletonBox width={30} height={30} borderRadius={15} style={{ marginRight: 12 }} />
                <SkeletonBox width={60} height={20} borderRadius={10} />
            </View>
            <SkeletonBox width={100} height={24} borderRadius={12} />
        </View>
        <SkeletonBox width={120} height={28} borderRadius={6} style={{ marginBottom: 4 }} />
        <SkeletonBox width={160} height={16} borderRadius={6} style={{ marginBottom: 20 }} />
        <View style={styles.assistantDetails}>
            <View style={styles.detailRow}>
                <SkeletonBox width={80} height={16} />
                <SkeletonBox width={60} height={16} />
            </View>
            <View style={styles.detailRow}>
                <SkeletonBox width={120} height={16} />
                <SkeletonBox width={40} height={16} />
            </View>
            <View style={styles.detailRow}>
                <SkeletonBox width={100} height={16} />
                <SkeletonBox width={80} height={16} />
            </View>
            <View style={styles.detailRow}>
                <SkeletonBox width={120} height={16} />
                <SkeletonBox width={100} height={16} />
            </View>
            <View style={styles.detailRow}>
                <SkeletonBox width={100} height={16} />
                <SkeletonBox width={80} height={16} />
            </View>
        </View>
    </View>
);

const ChartSkeleton = () => (
    <View style={{ backgroundColor: '#fff', borderRadius: 16, marginBottom: 12, padding: 20 }}>
        <SkeletonBox width={'100%'} height={120} borderRadius={12} />
    </View>
);

const VisitorsSkeleton = () => (
    <View style={styles.recentVisitorsContainer}>
        <SkeletonBox width={120} height={16} style={{ marginBottom: 16 }} />
        {[1, 2, 3].map((_, idx) => (
            <View key={idx} style={styles.visitorItem}>
                <SkeletonBox width={40} height={40} borderRadius={20} style={{ marginRight: 12 }} />
                <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <SkeletonBox width={80} height={16} />
                    <SkeletonBox width={60} height={12} />
                </View>
            </View>
        ))}
        <SkeletonBox width={120} height={32} borderRadius={8} style={{ marginTop: 8, alignSelf: 'center' }} />
    </View>
);

export default function ChatScreen() {
    const router = useRouter();
    const [recentVisitors, setRecentVisitors] = useState<Visitor[]>([]);
    const [loading, setLoading] = useState(true);
    const [usageData, setUsageData] = useState<UsageData | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [chatbotDetails, setChatbotDetails] = useState<ChatbotDetails | null>(null);
    const [showSidebar, setShowSidebar] = useState(false);
    const [search, setSearch] = useState('');
    const [sortOrder, setSortOrder] = useState<'recent' | 'oldest'>('recent');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [visitors, usage, userData, chatbotData] = await Promise.all([
                getVisitors({ limit: 3 }),
                getUsageData(),
                getUser(),
                getChatbotDetails('108') // Using the chatbot ID from the API endpoint
            ]);
            setRecentVisitors(visitors);
            setUsageData(usage);
            setUser(userData);
            setChatbotDetails(chatbotData);
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

    // Show skeleton loader until all data is loaded
    if (loading) {
        return (
            <View style={styles.container}>
                <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                    <AssistantCardSkeleton />
                    <ChartSkeleton />
                    <ChartSkeleton />
                    <VisitorsSkeleton />
                </ScrollView>
            </View>
        );
    }

    return (
        token ?
            <View style={styles.container}>
                {/* <Header
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
                /> */}
                <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                    {/* AI Assistant Card */}
                    <View style={styles.assistantCard}>
                        <View style={styles.assistantHeader}>
                            <View style={styles.assistantInfo}>
                                <View style={styles.assistantIcon}>
                                    <Image
                                        source={{ uri: chatbotDetails?.chatbotLogo }}
                                        style={styles.logoImage}
                                        resizeMode="contain"
                                    />
                                </View>
                                <View style={[styles.assistantStatus, { borderColor: chatbotDetails?.is_active ? '#10B981' : '#EF4444' }]}>
                                    <View style={[styles.statusIndicator, { backgroundColor: chatbotDetails?.is_active ? '#10B981' : '#EF4444' }]} />
                                    <Text style={[styles.statusText, { color: chatbotDetails?.is_active ? '#10B981' : '#EF4444' }]}>
                                        {chatbotDetails?.is_active ? 'Active' : 'Inactive'}
                                    </Text>
                                </View>
                            </View>
                            <View style={styles.creditsWidget}>
                                <Icon name="credit-card" size={20} color="#F59E0B" />
                                <Text style={styles.creditsText}>
                                    {usageData ? `${usageData.totalCreditsAvailable} Credits available` : 'Loading...'}
                                </Text>
                            </View>
                        </View>

                        <Text style={styles.assistantName}>{chatbotDetails?.chatbot_name || 'AI Help Desk'}</Text>
                        <Text style={styles.lastUpdate}>Last update : {chatbotDetails?.updated_at ? new Date(chatbotDetails.updated_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                        }) : new Date().toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                        })}</Text>

                        <View style={styles.assistantDetails}>
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>Website</Text>
                                <Text style={styles.detailValue}>{chatbotDetails?.websiteLink || 'N/A'}</Text>
                            </View>
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>Number of Visitors</Text>
                                <Text style={styles.detailValue}>{chatbotDetails?.visitors_count || 0}</Text>
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

                        {recentVisitors.length > 0 ? (
                            <>
                                {recentVisitors.map((visitor, index) => (
                                    <View key={visitor.id} style={styles.visitorItem}>
                                        <View style={styles.visitorAvatar}>
                                            <Text style={styles.visitorInitial}>V</Text>
                                        </View>
                                        <View style={styles.visitorInfo}>
                                            <Text style={styles.visitorName}>{visitor.name}</Text>
                                            {/* <Text style={styles.visitorTime}>{formatLastSeen(visitor.lastSeenTime)}</Text> */}
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
        backgroundColor: '#EDEFF3',
        paddingTop: 46,
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
        // width: 40,
        // height: 40,
        // borderRadius: 20,
        // backgroundColor: '#FF6B35',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    assistantStatus: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#10B981',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 10,
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
        fontFamily: 'inter',
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
    logoImage: {
        width: 30,
        height: 30,
    },
});