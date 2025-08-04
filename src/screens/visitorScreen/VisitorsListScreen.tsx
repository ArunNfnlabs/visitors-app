
import { useAuth } from '@/src/context/AuthContext';
import { getUser, getVisitors, User } from '@/src/services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
    Alert,
    Clipboard,
    FlatList,
    Image,
    ListRenderItemInfo,
    Pressable,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import UserSidebar from '../../components/UserSidebar';
import LoginScreen from '../auth/LoginScreen';

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
    firstMessage?: string;
};

const PAGE_SIZE = 30;

// --- SKELETON LOADER COMPONENTS ---
const Skeleton = ({ width, height, borderRadius = 4, style = {} }: { width: number | string, height: number, borderRadius?: number, style?: any }) => (
    <View
        style={[
            {
                width,
                height,
                borderRadius,
                backgroundColor: '#e0e0e0',
                marginBottom: 6,
                overflow: 'hidden',
            },
            style,
        ]}
    />
);

const SkeletonVisitorCard = () => (
    <View style={styles.visitorCardWrapper}>
        <View style={styles.visitorCardHome}>
            <View style={styles.visitorCard}>
                <Skeleton width={40} height={40} borderRadius={20} style={{ marginRight: 10 }} />
                <View style={{ flex: 1 }}>
                    <Skeleton width="60%" height={16} borderRadius={6} />
                    <Skeleton width="80%" height={12} borderRadius={6} />
                </View>
                <View style={{ marginLeft: 10, alignItems: 'flex-end', justifyContent: 'center' }}>
                    <Skeleton width={60} height={14} borderRadius={6} />
                </View>
            </View>
            <View style={{ paddingHorizontal: 16, paddingBottom: 16, width: '100%' }}>
                <Skeleton width="90%" height={12} borderRadius={6} />
                <Skeleton width="60%" height={12} borderRadius={6} />
                <Skeleton width="40%" height={12} borderRadius={6} />
            </View>
        </View>
    </View>
);

const SkeletonList = ({ count = 6 }: { count?: number }) => (
    <View>
        {Array.from({ length: count }).map((_, idx) => (
            <SkeletonVisitorCard key={idx} />
        ))}
    </View>
);

export default function VisitorsListScreen() {
    const [visitors, setVisitors] = useState<Visitor[]>([]);
    const [search, setSearch] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [hasMore, setHasMore] = useState<boolean>(true);
    const [page, setPage] = useState<number>(1);
    const [sortOrder, setSortOrder] = useState<string>('recent');
    const [user, setUser] = useState<User | null>(null);
    const [showSidebar, setShowSidebar] = useState<boolean>(false);
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

    const fetchVisitors = async (pageNum: number = 1, append: boolean = false) => {
        setLoading(true);
        try {
            const params: any = {
                page: pageNum,
                limit: PAGE_SIZE,
                search: search || '',
                sortOrder: sortOrder === 'recent' ? 'DESC' : 'ASC',
                filter: '12m'
            };

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

    useEffect(() => {
        fetchVisitors(1, false);
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
    }, [search, sortOrder, page]);

    const executeLoadMoreVisitors = useCallback(async () => {
        if (loading || !hasMore) return;
        await fetchVisitors(page + 1, true);
    }, [loading, hasMore, page, search, sortOrder]);

    const filteredVisitors = visitors;

    const handleVisitorPress = (visitor: Visitor) => {
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

    const handleLogout = async () => {
        await logout();
    };

    const copyEmail = async (email: string) => {
        if (!email || email === 'N/A') {
            Alert.alert('No Email', 'No email address available to copy.');
            return;
        }

        try {
            await Clipboard.setString(email);
            Alert.alert('Copied!', 'Email address copied to clipboard.');
        } catch (error) {
            Alert.alert('Error', 'Failed to copy email address.');
        }
    };

    // Fix: Use a consistent key for the avatar color, even for fallback "V"
    const renderVisitorCard = ({ item }: ListRenderItemInfo<Visitor>) => {
        // If name is missing or empty, use id as key for color, so "V" fallback is colored per id
        const avatarKey = (item.name && item.name.length > 0) ? item.name : item.id;
        const { bg, color } = getAvatarColor(avatarKey);

        return (
            <Pressable style={styles.visitorCardWrapper} onPress={() => handleVisitorPress(item)}>
                <View style={styles.visitorCardHome}>
                    <View style={styles.visitorCard}>
                        <View style={[styles.profilePicFallback, { backgroundColor: bg, width: 40, height: 40 }]}>
                            <Text style={[styles.profilePicFallbackText, { color }]}>
                                {item.name && item.name.length > 0
                                    ? item.name[0].toUpperCase()
                                    : 'V'}
                            </Text>
                        </View>

                        <View style={styles.visitorInfo}>
                            <Text style={styles.visitorName}>{item?.name ?? 'Visitor'}</Text>
                            {item?.firstMessage && item?.firstMessage.length > 0 && item?.firstMessage !== 'N/A' ? (
                                <View style={styles.infoRow}>
                                    <Icon name="chat" size={14} color="#999" style={{ position: 'relative', top: 2, ...styles.infoIcon }} />
                                    <Text style={styles.infoText}>
                                        {item.firstMessage.length > 20
                                            ? `${item.firstMessage.substring(0, 20)}...`
                                            : item.firstMessage || 'N/A'}
                                    </Text>
                                </View>
                            ) : (
                                <View style={styles.infoRow}>
                                    <Text style={styles.infoText}>N/A</Text>
                                </View>
                            )}

                        </View>

                        <View style={styles.lastSeenBadge}>
                            <Icon name="access-time" size={14} color="#999" style={styles.infoIcon} />
                            <Text style={styles.lastSeenBadgeText}>
                                {item.lastSeenTime ?? ''}
                            </Text>
                        </View>
                    </View>

                    <View style={{ paddingHorizontal: 16, paddingBottom: 16 }}>
                        <View style={styles.infoRow}>
                            <Icon name="email" size={14} color="#999" style={styles.infoIcon} />
                            <Text style={styles.infoText}>{item?.email ?? 'N/A'}</Text>
                            {item?.email && item.email !== 'N/A' && (
                                <TouchableOpacity
                                    style={styles.copyButton}
                                    onPress={() => copyEmail(item.email!)}
                                >
                                    <Icon name="content-copy" size={16} color="#007AFF" />
                                </TouchableOpacity>
                            )}
                        </View>
                        <View style={styles.infoRow}>
                            <Icon name="phone" size={14} color="#999" style={styles.infoIcon} />
                            <Text style={styles.infoText}>{item?.phone ?? 'N/A'}</Text>
                        </View>

                        <View style={styles.infoRow}>
                            <Icon name="location-on" size={14} color="#999" style={styles.infoIcon} />
                            <Text style={styles.infoText}>{item.location ?? 'N/A'}</Text>
                        </View>
                    </View>
                </View>
            </Pressable>
        );
    };

    // Remove handleSelectSortOrder and renderSortModal, not needed anymore

    // --- Animated visitor icons in all directions, opacity 20% ---
    const renderHeader = () => (
        <View style={{ position: 'relative', }}>
            <View style={styles.headerContainer}>
                <View style={styles.welcomeSection}>
                    <View style={styles.welcomeText}>
                        <Text style={styles.welcomeLabel}>
                            Welcome <Text style={{ fontSize: 18 }}>🫡</Text>
                        </Text>
                        <Text style={styles.userName}>{user?.name}</Text>
                    </View>
                    <TouchableOpacity
                        style={styles.profileIconContainer}
                        onPress={() => setShowSidebar(true)}
                    >
                        <View style={styles.profileIcon}>
                            {user?.profilePic ? (
                                <Image source={{ uri: user?.profilePic }} style={styles?.profileIconImage} />
                            ) : (
                                <Icon name="person" size={24} color="#333" />
                            )}
                        </View>
                    </TouchableOpacity>
                </View>
            </View>
            <View style={styles.headerContainer2}>
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
                        onPress={() => setSortOrder(sortOrder === 'recent' ? 'oldest' : 'recent')}
                    >
                        <Text style={{
                            color: '#333',
                            fontSize: 12,
                            backgroundColor: '#eee',
                            borderRadius: 10,
                            padding: 4,
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}>
                            <Icon
                                name={sortOrder === 'recent' ? 'arrow-downward' : 'arrow-upward'}
                                size={24}
                                color="#333"
                            />
                            {/* {sortOrder === 'recent' ? (
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-down-narrow-wide-icon lucide-arrow-down-narrow-wide"><path d="m3 16 4 4 4-4" /><path d="M7 20V4" /><path d="M11 4h4" /><path d="M11 8h7" /><path d="M11 12h10" /></svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-up-narrow-wide-icon lucide-arrow-up-narrow-wide"><path d="m3 8 4-4 4 4" /><path d="M7 4v16" /><path d="M11 12h4" /><path d="M11 16h7" /><path d="M11 20h10" /></svg>
                            )} */}


                        </Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.titleSection}>
                    <Text style={styles.allVisitorsTitle}>All Visitors</Text>
                </View>
                <UserSidebar
                    visible={showSidebar}
                    onClose={() => setShowSidebar(false)}
                    user={user}
                    onLogout={async () => {
                        setShowSidebar(false);
                        router.replace('/signin');
                        await handleLogout();
                    }}
                />
            </View>
        </View>
    );

    if (isLoading) {
        // SKELETON LOADER for initial screen load
        return (
            <SafeAreaView style={styles.container}>
                <View style={{ flex: 1 }}>
                    <View style={styles.headerContainer}>
                        <View style={styles.welcomeSection}>
                            <View style={styles.welcomeText}>
                                <Skeleton width={80} height={16} borderRadius={6} style={{ marginBottom: 4 }} />
                                <Skeleton width={100} height={20} borderRadius={6} />
                            </View>
                            <Skeleton width={40} height={40} borderRadius={20} style={{ marginLeft: 16 }} />
                        </View>
                    </View>
                    <View style={styles.headerContainer2}>
                        <View style={styles.menuSearchSection}>
                            <Skeleton width="80%" height={40} borderRadius={8} />
                            <Skeleton width={40} height={32} borderRadius={10} style={{ marginLeft: 12 }} />
                        </View>
                        <View style={styles.titleSection}>
                            <Skeleton width={120} height={18} borderRadius={6} />
                        </View>
                    </View>
                    <View style={styles.contentContainer}>
                        <SkeletonList count={6} />
                    </View>
                </View>
            </SafeAreaView>
        );
    }
    return (
        token ?
            <SafeAreaView style={styles.container}>
                {renderHeader()}

                <View style={styles.contentContainer}>
                    {/* SKELETON LOADER for visitors list loading */}
                    {loading && filteredVisitors.length === 0 ? (
                        <SkeletonList count={6} />
                    ) : (
                        <>
                            {filteredVisitors.length === 0 && !loading && (
                                <View style={styles.noVisitorsContainer}>
                                    {/* Fallback: Use an Icon instead of missing image */}
                                    <View style={styles.noVisitorsImageFallback}>
                                        <Icon name="group" size={64} color="#e0e0e0" />
                                    </View>
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
                                    loading && hasMore && filteredVisitors.length > 0 ? (
                                        <View style={{ marginTop: 8 }}>
                                            <SkeletonList count={2} />
                                        </View>
                                    ) : null
                                }
                                showsVerticalScrollIndicator={false}
                            />
                        </>
                    )}
                </View>
            </SafeAreaView>
            : <LoginScreen />
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#EDEFF3',
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
        backgroundColor: '#EDEFF3',
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 12,
    },
    headerContainer2: {
        backgroundColor: '#fff',
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 12,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    welcomeSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
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
        flexDirection: 'row',
        overflow: 'hidden',
    },
    profileIconImage: {
        width: 40,
        height: 40,
        borderRadius: 12,
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
        flexDirection: 'row',
        alignItems: 'center',
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
    contentContainer: {
        flex: 1,
        paddingHorizontal: 16,
        paddingTop: 0,
        backgroundColor: '#fff',
    },
    visitorCardWrapper: {
        marginBottom: 12,
    },
    visitorCardHome: {
        flexDirection: 'column',
        alignItems: 'flex-start',
        backgroundColor: '#fff',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#eee',
        // paddingVertical: 16,
        // paddingHorizontal: 16,
        width: '100%',
        shadowColor: '#000',
    },
    visitorCard: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: '#fff',
        paddingVertical: 16,
        paddingHorizontal: 16,
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
        gap: 10,
        marginBottom: 10,
        borderBottomWidth: 1,
        paddingBottom: 10,
        borderBottomColor: '#eee',
        // borderWidth: 1,
        // borderColor: '#eee',
        // paddingVertical: 16,
        // paddingHorizontal: 16,
        width: '100%',
        shadowColor: '#000',
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
        alignItems: 'center',
        justifyContent: 'center',
    },
    profilePicFallbackText: {
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
        // marginLeft: 12,
    },
    visitorName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        marginBottom: 4,
    },
    infoIcon: {
        marginRight: 6,
        flexDirection: 'row',
        alignItems: 'center',
    },
    infoText: {
        fontSize: 14,
        color: '#666',
    },
    noVisitorsImage: {
        width: 100,
        height: 100,
        marginBottom: 16,
    },
    noVisitorsImageFallback: {
        width: 100,
        height: 100,
        marginBottom: 16,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f5f5f5',
        borderRadius: 50,
    },
    copyButton: {
        marginLeft: 8,
        padding: 4,
    },
});