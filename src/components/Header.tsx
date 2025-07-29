import React from 'react';
import {
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import UserSidebar from './UserSidebar';

interface User {
    name: string;
    profilePic?: string;
}

interface HeaderProps {
    user: User;
    showSidebar: boolean;
    setShowSidebar: (visible: boolean) => void;
    search: string;
    setSearch: (value: string) => void;
    sortOrder: 'recent' | 'oldest';
    setSortOrder: (order: 'recent' | 'oldest') => void;
    handleLogout: () => Promise<void>;
    router: any;
}

export default function Header({
    user,
    showSidebar,
    setShowSidebar,
    search,
    setSearch,
    sortOrder,
    setSortOrder,
    handleLogout,
    router,
}: HeaderProps) {
    return (
        <View style={styles.headerWrapper}>
            <View style={styles.headerContainer}>
                <View style={styles.welcomeSection}>
                    <View style={styles.welcomeText}>
                        <Text style={styles.welcomeLabel}>
                            Welcome <Text style={styles.emoji}>🫡</Text>
                        </Text>
                        <Text style={styles.userName}>{user?.name}</Text>
                    </View>
                    <TouchableOpacity
                        style={styles.profileIconContainer}
                        onPress={() => setShowSidebar(true)}
                    >
                        <View style={styles.profileIcon}>
                            {user?.profilePic ? (
                                <Image
                                    source={{ uri: user.profilePic }}
                                    style={styles.profileIconImage}
                                />
                            ) : (
                                <Icon name="person" size={24} color="#333" />
                            )}
                        </View>
                    </TouchableOpacity>
                </View>
            </View>
            <View style={styles.headerContainer2}>
               
                <UserSidebar
                    visible={showSidebar}
                    onClose={() => setShowSidebar(false)}
                    user={user as any}
                    onLogout={async () => {
                        setShowSidebar(false);
                        router.replace('/signin');
                        await handleLogout();
                    }}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    headerWrapper: {
        position: 'relative',
        backgroundColor: '#EDEFF3',
    },
    headerContainer: {
        backgroundColor: '#EDEFF3',
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 12,
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
    emoji: {
        fontSize: 18,
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
        justifyContent: 'center',
        alignItems: 'center',
    },
    profileIconImage: {
        width: 32,
        height: 32,
        borderRadius: 16,
    },
    headerContainer2: {
        backgroundColor: '#fff',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: 0,
        paddingBottom: 12,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    menuSearchSection: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F1F5F9',
        borderRadius: 8,
        paddingHorizontal: 8,
        flex: 1,
        marginRight: 8,
    },
    searchIcon: {
        marginRight: 4,
    },
    searchInput: {
        flex: 1,
        fontSize: 14,
        color: '#333',
        paddingVertical: 6,
        paddingHorizontal: 4,
    },
    searchButton: {
        backgroundColor: '#eee',
        borderRadius: 10,
        padding: 4,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 4,
    },
    sortIconWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    titleSection: {
        marginLeft: 16,
        flex: 0.7,
    },
    allVisitorsTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1E293B',
    },
});