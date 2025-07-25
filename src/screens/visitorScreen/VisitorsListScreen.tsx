
import { useAuth } from '@/src/context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';
import { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Image,
    ListRenderItemInfo,
    Modal,
    Platform,
    Pressable,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { getVisitors } from '../services/api';

type Visitor = {
    id: string;
    name?: string;
    email?: string;
    lastSeenTime?: string;
    profilePicUrl?: string;
};

const PAGE_SIZE = 30;

const SORT_OPTIONS = [
    { label: 'Recent first', value: 'recent' },
    { label: 'Oldest first', value: 'oldest' },
    { label: 'Name (A-Z)', value: 'name_asc' },
    { label: 'Name (Z-A)', value: 'name_desc' },
];

const TIME_RANGE_OPTIONS = [
    { label: 'All time', value: 'all' },
    { label: 'Today', value: 'today' },
    { label: 'This week', value: 'week' },
    { label: 'Custom', value: 'custom' },
];

export default function VisitorsListScreen() {
    const [visitors, setVisitors] = useState<Visitor[]>([]);
    const [search, setSearch] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [hasMore, setHasMore] = useState<boolean>(true);
    const [page, setPage] = useState<number>(1);
    const [timeRange, setTimeRange] = useState<string>('all');
    const [sortOrder, setSortOrder] = useState<string>('recent');
    const [showSortModal, setShowSortModal] = useState<boolean>(false);
    const [showTimeRangeModal, setShowTimeRangeModal] = useState<boolean>(false);
    const [showCustomDatePicker, setShowCustomDatePicker] = useState<boolean>(false);
    const [customStartDate, setCustomStartDate] = useState<Date | null>(null);
    const [customEndDate, setCustomEndDate] = useState<Date | null>(null);
    const [datePickerMode, setDatePickerMode] = useState<'start' | 'end'>('start');
    const [selectedVisitors, setSelectedVisitors] = useState<{ [id: string]: boolean }>({});
    const navigation = useNavigation();
    const { logout } = useAuth();

    // API integration: fetch visitors from API
    const fetchVisitors = async (pageNum: number = 1, append: boolean = false) => {
        setLoading(true);
        try {
            const params: any = { page: pageNum, pageSize: PAGE_SIZE };
            if (search) params.search = search;
            if (sortOrder) params.sort = sortOrder;
            if (timeRange) params.timeRange = timeRange;
            if (timeRange === 'custom' && customStartDate && customEndDate) {
                params.startDate = customStartDate.toISOString();
                params.endDate = customEndDate.toISOString();
            }
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

    // Reload on search, sort, timeRange, or custom date change
    useEffect(() => {
        fetchVisitors(1, false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search, sortOrder, timeRange, customStartDate, customEndDate]);

    const executeLoadMoreVisitors = useCallback(async () => {
        if (loading || !hasMore) return;
        await fetchVisitors(page + 1, true);
    }, [loading, hasMore, page, search, sortOrder, timeRange, customStartDate, customEndDate]);

    const getFilteredVisitors = (): Visitor[] => {
        return visitors;
    };

    const filteredVisitors = getFilteredVisitors();

    // Modified: Navigate to VisitorDetailScreen on card press
    const handleVisitorPress = (visitor: Visitor) => {
        // @ts-ignore
        navigation.navigate('visitor-detail', { visitorId: visitor.id });
    };

    const handleDeleteVisitor = (visitor: Visitor) => {
        Alert.alert(
            'Delete Visitor',
            `Are you sure you want to delete ${visitor.name || 'this visitor'}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => {
                        setVisitors(prev => prev.filter(v => v.id !== visitor.id));
                        setSelectedVisitors(prev => {
                            const copy = { ...prev };
                            delete copy[visitor.id];
                            return copy;
                        });
                    }
                }
            ]
        );
    };

    const handleLogout = () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to logout?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Logout',
                    style: 'destructive',
                    onPress: async () => {
                        await logout();
                        await AsyncStorage.removeItem('USER_TOKEN');
                        navigation.navigate('signin' as never);
                    }
                }
            ]
        );
    };

    const handleToggleCheckbox = (visitorId: string) => {
        setSelectedVisitors(prev => ({
            ...prev,
            [visitorId]: !prev[visitorId]
        }));
    };

    // Render a single full-width visitor card
    const renderVisitorCard = ({ item }: ListRenderItemInfo<Visitor>) => (
        <View style={styles.visitorCardWrapper}>
            <View style={styles.visitorCard}>
                {/* Checkbox */}
                {/* <TouchableOpacity
                    style={styles.checkboxContainer}
                    onPress={() => handleToggleCheckbox(item.id)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <View style={[
                        styles.checkbox,
                        selectedVisitors[item.id] && styles.checkboxChecked
                    ]}>
                        {selectedVisitors[item.id] && (
                            <Icon name="check" size={16} color="#fff" />
                        )}
                    </View>
                </TouchableOpacity> */}
                {/* Profile Pic or V */}
                {item.profilePicUrl ? (
                    <Image
                        source={{ uri: item.profilePicUrl }}
                        style={styles.profilePic}
                    />
                ) : (
                    <View style={styles.profilePicFallback}>
                        <Text style={styles.profilePicFallbackText}>
                            {item.name && item.name.length > 0
                                ? item.name[0].toUpperCase()
                                : 'V'}
                        </Text>
                    </View>
                )}
                {/* Visitor Info */}
                <TouchableOpacity
                    style={styles.visitorInfo}
                    onPress={() => handleVisitorPress(item)}
                    activeOpacity={0.7}
                >
                    <Text style={styles.visitorName}>{item.name ?? 'Visitor'}</Text>
                    <Text style={styles.visitorEmail}>{item.email ?? 'Unknown'}</Text>
                    <Text style={styles.lastSeen}>Last seen: {item.lastSeenTime ?? 'Unknown'}</Text>
                </TouchableOpacity>
                {/* Delete Icon */}
                <TouchableOpacity
                    style={styles.deleteIconContainer}
                    onPress={() => handleDeleteVisitor(item)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <Icon name="delete" size={20} className='text-red-500' />
                </TouchableOpacity>
            </View>
        </View>
    );

    const handleSelectSortOrder = (value: string) => {
        setSortOrder(value);
        setShowSortModal(false);
    };

    const handleSelectTimeRange = (value: string) => {
        setTimeRange(value);
        setShowTimeRangeModal(false);
        if (value === 'custom') {
            setShowCustomDatePicker(true);
        }
    };

    const handleDateChange = (event: any, selectedDate?: Date) => {
        if (event.type === 'dismissed') {
            setShowCustomDatePicker(false);
            return;
        }
        if (datePickerMode === 'start') {
            setCustomStartDate(selectedDate || new Date());
            setDatePickerMode('end');
        } else {
            setCustomEndDate(selectedDate || new Date());
            setShowCustomDatePicker(false);
            setDatePickerMode('start');
        }
    };

    const renderSortModal = () => (
        <Modal
            visible={showSortModal}
            transparent
            animationType="fade"
            onRequestClose={() => setShowSortModal(false)}
        >
            <Pressable style={styles.modalOverlay} onPress={() => setShowSortModal(false)}>
                <View style={styles.modalContent}>
                    {SORT_OPTIONS.map(option => (
                        <TouchableOpacity
                            key={option.value}
                            style={styles.modalOption}
                            onPress={() => handleSelectSortOrder(option.value)}
                        >
                            <Text style={[
                                styles.modalOptionText,
                                sortOrder === option.value && styles.modalOptionTextSelected
                            ]}>
                                {option.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </Pressable>
        </Modal>
    );

    const renderTimeRangeModal = () => (
        <Modal
            visible={showTimeRangeModal}
            transparent
            animationType="fade"
            onRequestClose={() => setShowTimeRangeModal(false)}
        >
            <Pressable style={styles.modalOverlay} onPress={() => setShowTimeRangeModal(false)}>
                <View style={styles.modalContent}>
                    {TIME_RANGE_OPTIONS.map(option => (
                        <TouchableOpacity
                            key={option.value}
                            style={styles.modalOption}
                            onPress={() => handleSelectTimeRange(option.value)}
                        >
                            <Text style={[
                                styles.modalOptionText,
                                timeRange === option.value && styles.modalOptionTextSelected
                            ]}>
                                {option.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </Pressable>
        </Modal>
    );

    const renderCustomDatePicker = () => {
        if (!showCustomDatePicker) return null;
        const value = datePickerMode === 'start'
            ? (customStartDate || new Date())
            : (customEndDate || new Date());
        return (
            <DateTimePicker
                value={value}
                mode="date"
                display={Platform.OS === 'ios' ? 'inline' : 'default'}
                onChange={handleDateChange}
            />
        );
    };

    const renderHeader = () => (
        <View style={styles.headerContainer}>
            {/* Top section with welcome message and profile */}
            <View style={styles.welcomeSection}>
                <View style={styles.welcomeText}>
                    <Text style={styles.welcomeLabel}>Welcome</Text>
                    <Text style={styles.userName}>Arunkumar Dhayalan</Text>
                </View>
                <TouchableOpacity style={styles.profileIconContainer} onPress={handleLogout}>
                    <View style={styles.profileIcon}>
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
            </View>

            {/* All Visitors title */}
            <View style={styles.titleSection}>
                <Text style={styles.allVisitorsTitle}>All Visitors</Text>
            </View>

            {/* Original filters */}
            <View style={styles.filtersContainer}>
                <TouchableOpacity
                    style={styles.filterButton}
                    onPress={() => setShowTimeRangeModal(true)}
                >
                    <Text style={styles.filterText}>
                        {TIME_RANGE_OPTIONS.find(opt => opt.value === timeRange)?.label || 'Time range'}
                        {timeRange === 'custom' && customStartDate && customEndDate
                            ? `: ${customStartDate.toLocaleDateString()} - ${customEndDate.toLocaleDateString()}`
                            : ''}
                    </Text>
                    <Icon name="keyboard-arrow-down" size={20} color="#666" />
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.filterButton}
                    onPress={() => setShowSortModal(true)}
                >
                    <Text style={styles.filterText}>
                        {SORT_OPTIONS.find(opt => opt.value === sortOrder)?.label || 'Sorting order'}
                    </Text>
                    <Icon name="keyboard-arrow-down" size={20} color="#666" />
                </TouchableOpacity>
            </View>
            {renderSortModal()}
            {renderTimeRangeModal()}
            {renderCustomDatePicker()}
        </View>
    );
    return (
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
    },
    menuSearchSection: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    menuButton: {
        marginRight: 12,
        padding: 4,
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
    },
    filterButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 0,
    },
    filterText: {
        fontSize: 16,
        color: '#333',
        marginRight: 4,
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
        borderBottomWidth: 1,
        borderBottomColor: '#fe7624',
        // Box shadow for iOS
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
        // Elevation for Android
        elevation: 4,
        paddingVertical: 10,
        paddingHorizontal: 10,
        width: '100%',
    },
    checkboxContainer: {
        marginRight: 16,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: '#FE7624',
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkboxChecked: {
        backgroundColor: '#FE7624',
        borderColor: '#FE7624',
    },
    profilePic: {
        width: 30,
        height: 30,
        borderRadius: 15,
        marginRight: 16,
        backgroundColor: '#f5f5f5',
    },
    profilePicFallback: {
        width: 40,
        height: 40,
        borderRadius: 24,
        backgroundColor: '#FE7624',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 14,
    },
    profilePicFallbackText: {
        color: '#fff',
        fontSize: 22,
        fontWeight: 'bold',
    },
    visitorInfo: {
        flex: 1,
        justifyContent: 'center',
    },
    visitorName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    visitorEmail: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8,
    },
    lastSeen: {
        fontSize: 12,
        color: '#999',
    },
    deleteIconContainer: {
        marginLeft: 16,
        padding: 4,
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
});