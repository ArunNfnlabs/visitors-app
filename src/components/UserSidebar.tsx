import React from 'react';
import {
    Animated,
    Dimensions,
    Image,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { User } from '../services/api';

const { width } = Dimensions.get('window');

interface UserSidebarProps {
    visible: boolean;
    onClose: () => void;
    user: User | null;
    onLogout: () => void;
}

export default function UserSidebar({ visible, onClose, user, onLogout }: UserSidebarProps) {
    const slideAnim = React.useRef(new Animated.Value(width)).current;

    React.useEffect(() => {
        if (visible) {
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }).start();
        } else {
            Animated.timing(slideAnim, {
                toValue: width,
                duration: 300,
                useNativeDriver: true,
            }).start();
        }
    }, [visible, slideAnim]);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };


    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="none"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <TouchableOpacity style={styles.backdrop} onPress={onClose} />
                <Animated.View 
                    style={[
                        styles.sidebar,
                        {
                            transform: [{ translateX: slideAnim }]
                        }
                    ]}
                >
                    <View style={styles.header}>
                        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                            <Icon name="close" size={24} color="#666" />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>Profile</Text>
                    </View>

                    <View style={styles.userInfo}>
                        <View style={styles.avatarContainer}>
                            {user?.profilePic ? (
                                <Image source={{ uri: user.profilePic }} style={styles.avatar} />
                            ) : (
                                <View style={styles.avatarPlaceholder}>
                                    <Icon name="person" size={40} color="#fff" />
                                </View>
                            )}
                        </View>
                        
                        <Text style={styles.userName}>{user?.name || 'User'}</Text>
                        <Text style={styles.userEmail}>{user?.email || 'No email'}</Text>
                        
                        {/* {user?.phone && (
                            <View style={styles.infoRow}>
                                <Icon name="phone" size={16} color="#666" />
                                <Text style={styles.infoText}>{user.phone}</Text>
                            </View>
                        )}
                        
                        {user?.location && (
                            <View style={styles.infoRow}>
                                <Icon name="location-on" size={16} color="#666" />
                                <Text style={styles.infoText}>{user.location}</Text>
                            </View>
                        )} */}
                        
                        {user?.createdAt && (
                            <View style={styles.infoRow}>
                                <Icon name="calendar-today" size={16} color="#666" />
                                <Text style={styles.infoText}>Joined {formatDate(user.createdAt)}</Text>
                            </View>
                        )}

                        {user?.updatedAt && (
                            <View style={styles.infoRow}>
                                <Icon name="update" size={16} color="#666" />
                                <Text style={styles.infoText}>Last updated {formatDate(user.updatedAt)}</Text>
                            </View>
                        )}

                        {/* {user?.lastLoginAt && (
                            <View style={styles.infoRow}>
                                <Icon name="access-time" size={16} color="#666" />
                                <Text style={styles.infoText}>Last login {formatDate(user.lastLoginAt)} at {formatTime(user.lastLoginAt)}</Text>
                            </View>
                        )}

                        {user?.status && (
                            <View style={styles.infoRow}>
                                <Icon name="circle" size={16} color={user.status === 'active' ? '#4CAF50' : '#FF9800'} />
                                <Text style={styles.infoText}>Status: {user.status}</Text>
                            </View>
                        )}

                        {user?.role && (
                            <View style={styles.infoRow}>
                                <Icon name="admin-panel-settings" size={16} color="#666" />
                                <Text style={styles.infoText}>Role: {user.role}</Text>
                            </View>
                        )}

                        {user?.company && (
                            <View style={styles.infoRow}>
                                <Icon name="business" size={16} color="#666" />
                                <Text style={styles.infoText}>{user.company}</Text>
                            </View>
                        )}

                        {user?.department && (
                            <View style={styles.infoRow}>
                                <Icon name="account-tree" size={16} color="#666" />
                                <Text style={styles.infoText}>Department: {user.department}</Text>
                            </View>
                        )} */}
                    </View>

                    <View style={styles.divider} />

                    {/* <View style={styles.statsSection}>
                        <Text style={styles.statsTitle}>Account Statistics</Text>
                        
                        <View style={styles.statsRow}>
                            <View style={styles.statItem}>
                                <Icon name="group" size={20} color="#007AFF" />
                                <Text style={styles.statValue}>{user?.totalVisitors || 0}</Text>
                                <Text style={styles.statLabel}>Total Visitors</Text>
                            </View>
                            
                            <View style={styles.statItem}>
                                <Icon name="chat" size={20} color="#007AFF" />
                                <Text style={styles.statValue}>{user?.totalChats || 0}</Text>
                                <Text style={styles.statLabel}>Total Chats</Text>
                            </View>
                        </View>

                        <View style={styles.statsRow}>
                            <View style={styles.statItem}>
                                <Icon name="schedule" size={20} color="#007AFF" />
                                <Text style={styles.statValue}>{user?.avgResponseTime || '0m'}</Text>
                                <Text style={styles.statLabel}>Avg Response</Text>
                            </View>
                            
                            <View style={styles.statItem}>
                                <Icon name="star" size={20} color="#007AFF" />
                                <Text style={styles.statValue}>{user?.satisfactionRate || '0%'}</Text>
                                <Text style={styles.statLabel}>Satisfaction</Text>
                            </View>
                        </View>
                    </View> */}

                    <View style={styles.logoutSection}>
                        <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
                            <Icon name="logout" size={20} color="#fff" />
                            <Text style={styles.logoutText}>Logout</Text>
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    backdrop: {
        flex: 1,
    },
    sidebar: {
        position: 'absolute',
        right: 0,
        top: 0,
        bottom: 0,
        width: width * 0.8,
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: -2, height: 0 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 8,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        paddingTop: 60,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    closeButton: {
        padding: 8,
        marginRight: 16,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#333',
    },
    userInfo: {
        padding: 20,
        alignItems: 'center',
    },
    avatarContainer: {
        marginBottom: 16,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
    },
    avatarPlaceholder: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#007AFF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    userName: {
        fontSize: 24,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    userEmail: {
        fontSize: 16,
        color: '#666',
        marginBottom: 20,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        alignSelf: 'stretch',
    },
    infoText: {
        fontSize: 14,
        color: '#666',
        marginLeft: 12,
        flex: 1,
    },
    divider: {
        height: 1,
        backgroundColor: '#f0f0f0',
        marginVertical: 20,
    },
    statsSection: {
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    statsTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginBottom: 15,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 15,
    },
    statItem: {
        alignItems: 'center',
    },
    statValue: {
        fontSize: 20,
        fontWeight: '700',
        color: '#007AFF',
        marginTop: 5,
    },
    statLabel: {
        fontSize: 12,
        color: '#666',
    },
    logoutSection: {
        padding: 20,
        marginTop: 'auto',
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#ff4757',
        paddingVertical: 16,
        borderRadius: 12,
    },
    logoutText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
        marginLeft: 8,
    },
}); 