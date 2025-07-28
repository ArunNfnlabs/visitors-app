
import { useAuth } from '@/src/context/AuthContext';
import { getUser, getVisitors } from '@/src/services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Image,
    ListRenderItemInfo,
    Modal,
    Pressable,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LoginScreen from '../auth/LoginScreen';
import { User } from '../services/api';

// --- Color utilities for random avatar background and text color ---
const AVATAR_COLORS = [
    { bg: '#6c7ae0', color: '#fff' },
    { bg: '#ff6b35', color: '#fff' },
    { bg: '#00b894', color: '#fff' },
    { bg: '#fdcb6e', color: '#333' },
    { bg: '#0984e3', color: '#fff' },
    { bg: '#e17055', color: '#fff' },
    { bg: '#00bcd4', color: '#fff' },
    { bg: '#636e72', color: '#fff' },
    { bg: '#b2bec3', color: '#333' },
    { bg: '#fab1a0', color: '#333' },
    { bg: '#a29bfe', color: '#fff' },
    { bg: '#fd79a8', color: '#fff' },
    { bg: '#55efc4', color: '#333' },
    { bg: '#ffeaa7', color: '#333' },
    { bg: '#dfe6e9', color: '#333' },
];

function getAvatarColor(key: string | undefined): { bg: string; color: string } {
    if (!key) return AVATAR_COLORS[0];
    // Simple hash function to pick a color based on the name/id
    let hash = 0;
    for (let i = 0; i < key.length; i++) {
        hash = key.charCodeAt(i) + ((hash << 5) - hash);
    }
    const idx = Math.abs(hash) % AVATAR_COLORS.length;
    return AVATAR_COLORS[idx];
}

type Visitor = {
    id: string;
    name?: string;
    email?: string;
    phone?: string;
    location?: string;
    lastSeenTime?: string;
    profilePicUrl?: string;
};

const PAGE_SIZE = 30;

// Removed SORT_OPTIONS and TIME_RANGE_OPTIONS

export default function VisitorsListScreen() {
    const [visitors, setVisitors] = useState<Visitor[]>([]);
    const [search, setSearch] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [hasMore, setHasMore] = useState<boolean>(true);
    const [page, setPage] = useState<number>(1);
    // Remove timeRange, custom date, etc.
    // const [timeRange, setTimeRange] = useState<string>('all');
    // const [showTimeRangeModal, setShowTimeRangeModal] = useState<boolean>(false);
    // const [showCustomDatePicker, setShowCustomDatePicker] = useState<boolean>(false);
    // const [customStartDate, setCustomStartDate] = useState<Date | null>(null);
    // const [customEndDate, setCustomEndDate] = useState<Date | null>(null);
    // const [datePickerMode, setDatePickerMode] = useState<'start' | 'end'>('start');
    const [sortOrder, setSortOrder] = useState<string>('recent');
    const [showSortModal, setShowSortModal] = useState<boolean>(false);
    const [selectedVisitors, setSelectedVisitors] = useState<{ [id: string]: boolean }>({});
    const [user, setUser] = useState<User | null>(null);
    const [showLogoutModal, setShowLogoutModal] = useState<boolean>(false);
    const router = useRouter();
    const { logout } = useAuth();
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

    // API integration: fetch visitors from API
    const fetchVisitors = async (pageNum: number = 1, append: boolean = false) => {
        setLoading(true);
        try {
            const params: any = {
                page: pageNum,
                limit: PAGE_SIZE,
                search: search || '',
                // Remove filter and timeRange
                // filter: timeRange === 'all' ? '12m' : timeRange,
                // sortOrder: sortOrder === 'recent' ? 'DESC' : 'ASC'
                sortOrder: sortOrder === 'recent' ? 'DESC' : 'ASC'
            };

            // Remove custom date logic
            // if (timeRange === 'custom' && customStartDate && customEndDate) {
            //     params.startDate = customStartDate.toISOString();
            //     params.endDate = customEndDate.toISOString();
            // }

            const data = await getVisitors(params);
            const visitorList: Visitor[] = data || [];
            if (append) {
                setVisitors(prev => [...prev, ...visitorList]);
            } else {
                setVisitors(visitorList);
            }
            setHasMore(visitorList.length === PAGE_SIZE);
            setPage(pageNum);
        } catch (error) {
            console.error('Error fetching visitors:', error);
            if (!append) setVisitors([]);
            setHasMore(false);
        } finally {
            setLoading(false);
        }
    };

    // Initial load
    useEffect(() => {
        fetchVisitors(1, false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        const fetchUser = async () => {
            const user = await getUser();
            setUser(user);
        };
        fetchUser();
    }, []);
    useEffect(() => {
        fetchVisitors(1, false);
    }, [search, sortOrder]);

    const executeLoadMoreVisitors = useCallback(async () => {
        if (loading || !hasMore) return;
        await fetchVisitors(page + 1, true);
    }, [loading, hasMore, page, search, sortOrder]);

    const getFilteredVisitors = (): Visitor[] => {
        return visitors;
    };

    const filteredVisitors = getFilteredVisitors();

    // Modified: Navigate to VisitorDetailScreen on card press
    const handleVisitorPress = (visitor: Visitor) => {
        // Use Expo Router to navigate to the visitor detail page
        router.push({
            pathname: '/visitor-detail',
            params: {
                visitorId: visitor.id,
                visitorName: visitor.name || 'Visitor',
                visitorEmail: visitor.email || '',
                visitorCheckinTime: visitor.lastSeenTime || ''
            }
        });
    };

    // Remove Alert-based logout, use modal instead
    const handleLogout = async () => {
        await logout();
    };


    // Render a single visitor card matching the image design
    const renderVisitorCard = ({ item }: ListRenderItemInfo<Visitor>) => {
        // Only for fallback avatar: assign random bg/text color based on name or id
        const avatarKey = item.name || item.id;
        const { bg, color } = getAvatarColor(avatarKey);

        return (
            <Pressable style={styles.visitorCardWrapper} onPress={() => handleVisitorPress(item)}>
                <View style={styles.visitorCard}>
                    {/* Profile Avatar */}
                    {item.profilePicUrl ? (
                        <Image
                            source={{ uri: item.profilePicUrl }}
                            style={styles.profilePicImage}
                            resizeMode="cover"
                        />
                    ) : (
                        <View style={[styles.profilePicFallback, { backgroundColor: bg }]}>
                            <Text style={[styles.profilePicFallbackText, { color }]}>
                                {item.name && item.name.length > 0
                                    ? item.name[0].toUpperCase()
                                    : 'V'}
                            </Text>
                        </View>
                    )}

                    {/* Visitor Info */}
                    <View style={styles.visitorInfo}>
                        <Text style={styles.visitorName}>{item?.name ?? 'Visitor'}</Text>

                        {/* Email with icon */}
                        <View style={styles.infoRow}>
                            <Icon name="email" size={14} color="#999" style={styles.infoIcon} />
                            <Text style={styles.infoText}>{item?.email ?? 'not available'}</Text>
                        </View>

                        {/* Phone with icon */}
                        <View style={styles.infoRow}>
                            <Icon name="phone" size={14} color="#999" style={styles.infoIcon} />
                            <Text style={styles.infoText}>{item?.phone ?? 'not available'}</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Icon name="location-on" size={14} color="#999" style={styles.infoIcon} />
                            <Text style={styles.infoText}>{item.location ?? 'not available'}</Text>
                        </View>

                        {/* Date with icon */}

                    </View>

                    {/* Last Seen Badge */}
                    <View style={styles.lastSeenBadge}>
                        <Icon name="access-time" size={14} color="#999" style={styles.infoIcon} />
                        <Text style={styles.lastSeenBadgeText}>
                            {item.lastSeenTime ?? ''}
                        </Text>
                    </View>
                </View>
            </Pressable>
        );
    };

    // Only sort modal remains, with minimal options
    const handleSelectSortOrder = (value: string) => {
        setSortOrder(value);
        setShowSortModal(false);
    };

    // Only show two sort options: Recent first, Oldest first
    const renderSortModal = () => (
        <Modal
            visible={showSortModal}
            transparent
            animationType="fade"
            onRequestClose={() => setShowSortModal(false)}
        >
            <Pressable style={styles.modalOverlay} onPress={() => setShowSortModal(false)}>
                <View style={styles.modalContent}>
                    <TouchableOpacity
                        style={styles.modalOption}
                        onPress={() => handleSelectSortOrder('recent')}
                    >
                        <Text style={[
                            styles.modalOptionText,
                            sortOrder === 'recent' && styles.modalOptionTextSelected
                        ]}>
                            Recent first
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.modalOption}
                        onPress={() => handleSelectSortOrder('oldest')}
                    >
                        <Text style={[
                            styles.modalOptionText,
                            sortOrder === 'oldest' && styles.modalOptionTextSelected
                        ]}>
                            Oldest first
                        </Text>
                    </TouchableOpacity>
                </View>
            </Pressable>
        </Modal>
    );

    // New: Logout confirmation modal
    const renderLogoutModal = () => (
        <Modal
            visible={showLogoutModal}
            transparent
            animationType="fade"
            onRequestClose={() => setShowLogoutModal(false)}
        >
            <Pressable style={styles.modalOverlay} onPress={() => setShowLogoutModal(false)}>
                <View style={styles.logoutModalContent}>
                    <Text style={styles.logoutModalTitle}>Logout</Text>
                    <Text style={styles.logoutModalMessage}>Are you sure you want to logout?</Text>
                    <View style={styles.logoutModalActions}>
                        <TouchableOpacity
                            style={[styles.logoutModalButton, styles.logoutModalCancel]}
                            onPress={() => setShowLogoutModal(false)}
                        >
                            <Text style={styles.logoutModalCancelText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.logoutModalButton, styles.logoutModalConfirm]}
                            onPress={async () => {
                                setShowLogoutModal(false);
                                router.replace('/signin');
                                await handleLogout();
                            }}
                        >
                            <Text style={styles.logoutModalConfirmText}>Logout</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Pressable>
        </Modal>
    );

    // Header: search bar with sort icon on right
    const renderHeader = () => (
        <View style={styles.headerContainer}>
            {/* Top section with welcome message and profile */}
            <View style={styles.welcomeSection}>
                <View style={styles.welcomeText}>
                    <Text style={styles.welcomeLabel}>Welcome</Text>
                    <Text style={styles.userName}>{user?.name}</Text>
                </View>
                <TouchableOpacity
                    style={styles.profileIconContainer}
                    onPress={() => setShowLogoutModal(true)}
                >
                    <View style={styles.profileIcon}>
                        {user?.profilePic ? (
                            <Image source={{ uri: user.profilePic }} style={styles.profileIconImage} />
                        ) : (
                            <Icon name="person" size={24} color="#333" />
                        )}
                        <Icon name="logout" size={24} color="#333" />
                    </View>
                </TouchableOpacity>
            </View>

            {/* Menu and Search section */}
            <View style={styles.menuSearchSection}>
                <View style={styles.searchContainer}>
                    <Icon name="search" size={20} color="#666" style={styles.searchIcon} />
                    <TextInput
                        placeholder="Search"
                        value={search}
                        placeholderTextColor="#666"
                        onChangeText={setSearch}
                        style={styles.searchInput}
                    />
                </View>
                <TouchableOpacity
                    style={styles.searchButton}
                    onPress={() => setShowSortModal(true)}
                >
                    <Icon name="sort" size={28} color="#007AFF" />
                </TouchableOpacity>
            </View>

            {/* All Visitors title */}
            <View style={styles.titleSection}>
                <Text style={styles.allVisitorsTitle}>All Visitors</Text>
            </View>
            {renderSortModal()}
            {renderLogoutModal()}
        </View>
    );

    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <ActivityIndicator size="large" color="#ff6b35" />
            </View>
        );
    }
    return (
        token ?
            <SafeAreaView style={styles.container}>
                {renderHeader()}

                <View style={styles.contentContainer}>
                    {filteredVisitors.length === 0 && (
                        <View style={styles.noVisitorsContainer}>
                            <Text style={styles.noVisitorsText}>No visitors found</Text>
                        </View>
                    )}
                    <FlatList
                        data={filteredVisitors}
                        renderItem={renderVisitorCard}
                        keyExtractor={(item) => item.id}
                        onEndReached={executeLoadMoreVisitors}
                        onEndReachedThreshold={0.2}
                        ListFooterComponent={
                            loading && hasMore ? (
                                <View style={styles.loadingContainer}>
                                    <ActivityIndicator size="large" color="#007AFF" />
                                    <Text style={styles.loadingText}>Loading more visitors...</Text>
                                </View>
                            ) : null
                        }
                        showsVerticalScrollIndicator={false}
                    />
                </View>
            </SafeAreaView>
            : <LoginScreen />
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    noVisitorsContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    noVisitorsText: {
        fontSize: 16,
        color: '#666',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 16,
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: '#666',
    },
    headerContainer: {
        backgroundColor: '#fff',
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    // New header styles
    welcomeSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    welcomeText: {
        flex: 1,
    },
    welcomeLabel: {
        fontSize: 16,
        color: '#666',
        marginBottom: 4,
    },
    userName: {
        fontSize: 20,
        fontWeight: '600',
        color: '#333',
    },
    profileIconContainer: {
        marginLeft: 16,
    },
    profileIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#f5f5f5',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#e0e0e0',
        flexDirection: 'row',
        overflow: 'hidden',
    },
    profileIconImage: {
        width: 32,
        height: 32,
        borderRadius: 16,
        marginRight: 4,
    },
    menuSearchSection: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    searchButton: {
        marginLeft: 12,
        padding: 4,
    },
    titleSection: {
        marginBottom: 8,
    },
    allVisitorsTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
    },
    searchContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        borderRadius: 8,
        paddingHorizontal: 12,
        height: 40,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: '#333',
    },
    filtersContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 8,
    },
    filterButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 12,
        backgroundColor: '#F8F9FA',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E5E5EA',
        minWidth: 120,
        justifyContent: 'space-between',
    },
    filterText: {
        fontSize: 14,
        color: '#333',
        fontWeight: '500',
    },
    contentContainer: {
        flex: 1,
        paddingHorizontal: 16,
        paddingTop: 16,
    },
    // Visitor Card Styles
    visitorCardWrapper: {
        marginBottom: 16,
    },
    visitorCard: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: '#fff',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#eee',
        paddingVertical: 16,
        paddingHorizontal: 16,
        width: '100%',
        shadowColor: '#000',
        // shadowOffset: { width: 0, height: 2 },
        // shadowOpacity: 0.1,
        // shadowRadius: 4,
        // elevation: 2,
    },
    lastSeenBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    lastSeenBadgeText: {
        fontSize: 14,
        color: '#666',
    },
    profilePicFallback: {
        width: 40,
        height: 40,
        borderRadius: 20,
        // backgroundColor: '#6c7ae0', // removed, now set dynamically
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    profilePicFallbackText: {
        // color: '#fff', // removed, now set dynamically
        fontSize: 18,
        fontWeight: 'bold',
    },
    profilePicImage: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 16,
        backgroundColor: '#e0e0e0',
    },
    visitorInfo: {
        flex: 1,
        justifyContent: 'center',
    },
    visitorName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    infoIcon: {
        marginRight: 8,
    },
    infoText: {
        fontSize: 14,
        color: '#666',
    },
    menuButton: {
        padding: 4,
        marginLeft: 8,
    },
    // Modal styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 16,
        minWidth: 220,
        elevation: 4,
    },
    modalOption: {
        paddingVertical: 12,
        paddingHorizontal: 8,
    },
    modalOptionText: {
        fontSize: 16,
        color: '#333',
    },
    modalOptionTextSelected: {
        color: '#007AFF',
        fontWeight: 'bold',
    },
    // Logout Modal Styles
    logoutModalContent: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 24,
        minWidth: 260,
        alignItems: 'center',
        elevation: 5,
    },
    logoutModalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },
    logoutModalMessage: {
        fontSize: 16,
        color: '#666',
        marginBottom: 24,
        textAlign: 'center',
    },
    logoutModalActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    logoutModalButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginHorizontal: 4,
    },
    logoutModalCancel: {
        backgroundColor: '#f0f0f0',
    },
    logoutModalConfirm: {
        backgroundColor: '#ff3b30',
    },
    logoutModalCancelText: {
        color: '#333',
        fontWeight: 'bold',
        fontSize: 16,
    },
    logoutModalConfirmText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
});