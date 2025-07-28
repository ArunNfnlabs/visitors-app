import { getVisitorChat } from '@/src/services/api';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Image,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Types updated to match API response (snake_case)
type VisitorChat = {
    id: number;
    asked_at: string;
    question: string;
    answer: string;
    answer_at: string;
};

type VisitorDetails = {
    name?: string;
    email?: string;
    phone?: string;
    location?: string;
};

type ChatbotConfig = {
    visitor_details?: VisitorDetails;
    chatbot_name?: string;
    welcome_message?: string;
    avatar_url?: string;
};

type VisitorChatApiResponse = {
    code: number;
    status: boolean;
    message: string;
    data?: {
        chats?: VisitorChat[];
        chatbotConfig?: ChatbotConfig; // for backward compatibility, but we will use chatbot_config
        chatbot_config?: ChatbotConfig;
    };
};

type Message = {
    id: string;
    type: 'bot' | 'visitor' | 'agent';
    sender: string;
    message: string;
    timestamp: string;
    isWelcome?: boolean;
    avatarUrl?: string;
};

export default function VisitorDetailScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const scrollViewRef = useRef<ScrollView>(null);

    // Get visitor data from URL parameters
    const visitorId = params.visitorId as string;
    const visitorName = params.visitorName as string;
    const visitorEmail = params.visitorEmail as string;
    const visitorCheckinTime = params.visitorCheckinTime as string;

    const [messages, setMessages] = useState<Message[]>([]);
    const [visitorInfo, setVisitorInfo] = useState<VisitorDetails>({
        name: visitorName || '',
        email: visitorEmail || '',
        phone: '',
        location: ''
    });
    const [chatbotName, setChatbotName] = useState<string>('AI Help Desk');
    const [chatbotAvatarUrl, setChatbotAvatarUrl] = useState<string>('');
    const [welcomeMessage, setWelcomeMessage] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        fetchVisitorChat();
    }, []);

    const fetchVisitorChat = async (): Promise<void> => {
        setIsLoading(true);
        try {
            // Use visitor ID from URL params instead of hardcoded SESSION_ID
            const json: VisitorChatApiResponse = await getVisitorChat(visitorId);

            if (json.status && json.data) {
                const chats = json.data.chats ?? [];
                // Support both chatbotConfig (camelCase) and chatbot_config (snake_case)
                const chatbotConfig: ChatbotConfig = json.data.chatbot_config
                    ? {
                        visitor_details: json.data.chatbot_config.visitor_details,
                        chatbot_name: json.data.chatbot_config.chatbot_name,
                        welcome_message: json.data.chatbot_config.welcome_message,
                        avatar_url: json.data.chatbot_config.avatar_url,
                    }
                    : json.data.chatbotConfig
                        ? {
                            visitor_details: json.data.chatbotConfig.visitor_details,
                            chatbot_name: json.data.chatbotConfig.chatbot_name,
                            welcome_message: json.data.chatbotConfig.welcome_message,
                            avatar_url: json.data.chatbotConfig.avatar_url,
                        }
                        : {};

                // Use visitor data from URL params as fallback
                setVisitorInfo({
                    name: chatbotConfig.visitor_details?.name || visitorName || '',
                    email: chatbotConfig.visitor_details?.email || visitorEmail || '',
                    phone: chatbotConfig.visitor_details?.phone || '',
                    location: chatbotConfig.visitor_details?.location || ''
                });
                setChatbotName(chatbotConfig.chatbot_name ?? 'AI Help Desk');
                setWelcomeMessage(chatbotConfig.welcome_message ?? '');
                setChatbotAvatarUrl(chatbotConfig.avatar_url ?? '');

                // Compose messages array for UI
                const chatMessages: Message[] = [];

                // Add welcome message from bot
                if (chatbotConfig.welcome_message) {
                    chatMessages.push({
                        id: 'welcome',
                        type: 'bot',
                        sender: chatbotConfig.chatbot_name || 'AI Help Desk',
                        message: chatbotConfig.welcome_message,
                        // If there are no chats, use current time for welcome message
                        timestamp: chats.length > 0 && chats[0].asked_at ? formatTime(chats[0].asked_at) : formatTime(new Date().toISOString()),
                        isWelcome: true,
                        avatarUrl: chatbotConfig.avatar_url
                    });
                }

                // Add chat history
                chats.forEach((chat) => {
                    // Visitor message
                    chatMessages.push({
                        id: `q-${chat.id}`,
                        type: 'visitor',
                        sender: (chatbotConfig.visitor_details && chatbotConfig.visitor_details.name) ? chatbotConfig.visitor_details.name : visitorName || 'Visitor',
                        message: chat.question,
                        timestamp: formatTime(chat.asked_at)
                    });
                    // Bot answer
                    if (chat.answer) {
                        chatMessages.push({
                            id: `a-${chat.id}`,
                            type: 'bot',
                            sender: chatbotConfig.chatbot_name || 'AI Help Desk',
                            message: chat.answer,
                            timestamp: formatTime(chat.answer_at),
                            avatarUrl: chatbotConfig.avatar_url
                        });
                    }
                });

                setMessages(chatMessages);
            }
        } catch (err) {
            // Optionally handle error
        } finally {
            setIsLoading(false);
        }
    };

    const formatTime = (isoString: string): string => {
        if (!isoString) return '';
        const date = new Date(isoString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const renderMessage = (item: Message) => {
        const isBot = item.type === 'bot';
        const isVisitor = item.type === 'visitor';
        const isAgent = item.type === 'agent';

        return (
            <View key={item.id} style={styles.messageContainer}>
                {(isBot || isAgent) && (
                    <View style={styles.botMessageContainer}>
                        {item.avatarUrl ? (
                            <Image
                                source={{ uri: item.avatarUrl }}
                                style={styles.botAvatarImage}
                                resizeMode="cover"
                            />
                        ) : (
                            <View style={styles.botAvatar}>
                                <Text style={styles.botAvatarText}>
                                    {isBot ? '🤖' : '👤'}
                                </Text>
                            </View>
                        )}
                        <View style={styles.botMessageContent}>
                            <View style={styles.botMessageHeader}>
                                <Text style={styles.senderName}>{item.sender}</Text>
                                <Text style={styles.timestamp}>• {item.timestamp}</Text>
                            </View>
                            <View style={[styles.messageBubble, styles.botMessageBubble]}>
                                <Text style={styles.botMessageText}>{item.message}</Text>
                            </View>
                        </View>
                    </View>
                )}
                {isVisitor && (
                    <View style={styles.visitorMessageContainer}>
                        <View style={styles.visitorMessageContent}>
                            <View style={styles.visitorMessageHeader}>
                                <Text style={styles.visitorTimestamp}>
                                    {(item.sender || 'Visitor')} • {item.timestamp}
                                </Text>
                            </View>
                            <View style={[styles.messageBubble, styles.visitorMessageBubble]}>
                                <Text style={styles.visitorMessageText}>{item.message}</Text>
                            </View>
                        </View>
                        <View style={styles.visitorAvatar}>
                            <Text style={styles.visitorAvatarText}>
                                {(visitorInfo && visitorInfo.name && visitorInfo.name[0]) || 'V'}
                            </Text>
                        </View>
                    </View>
                )}
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.back()}
                >
                    <Icon name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <View style={styles.headerContent}>
                    {chatbotAvatarUrl ? (
                        <Image
                            source={{ uri: chatbotAvatarUrl }}
                            style={styles.headerAvatarImage}
                            resizeMode="cover"
                        />
                    ) : (
                        <View style={styles.headerAvatar}>
                            <Text style={styles.headerAvatarText}>
                                {(visitorInfo && visitorInfo.name && visitorInfo.name[0]) || 'V'}
                            </Text>
                        </View>
                    )}
                    <View style={styles.headerInfo}>
                        <Text style={styles.headerName}>
                            {(visitorInfo && visitorInfo.name) || 'Visitor'}
                        </Text>
                        <Text style={styles.headerStatus}>
                            {/* No online status in API, so just show email or blank */}
                            {(visitorInfo && visitorInfo.email) ? visitorInfo.email : 'not available'}
                        </Text>
                    </View>
                </View>
            </View>
            
            {/* Chat Messages */}
            {isLoading ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color="#6c7ae0" />
                </View>
            ) : (
                <ScrollView
                    ref={scrollViewRef}
                    style={styles.chatContainer}
                    contentContainerStyle={styles.chatContent}
                    showsVerticalScrollIndicator={false}
                    onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
                >
                    {messages.map(renderMessage)}
                </ScrollView>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    backButton: {
        marginRight: 12,
        padding: 4,
    },
    headerContent: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#6c7ae0',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    headerAvatarText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    headerAvatarImage: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 12,
        backgroundColor: '#e0e0e0',
    },
    headerInfo: {
        flex: 1,
    },
    headerName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    headerStatus: {
        fontSize: 12,
        color: '#666',
        marginTop: 2,
    },
    moreButton: {
        padding: 4,
    },
    chatContainer: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    chatContent: {
        padding: 16,
    },
    messageContainer: {
        marginBottom: 16,
    },
    botMessageContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    botAvatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#ff6b35',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    botAvatarText: {
        fontSize: 16,
    },
    botAvatarImage: {
        width: 32,
        height: 32,
        borderRadius: 16,
        marginRight: 12,
        backgroundColor: '#e0e0e0',
    },
    botMessageContent: {
        flex: 1,
    },
    botMessageHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    senderName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
    },
    timestamp: {
        fontSize: 12,
        color: '#666',
        marginLeft: 4,
    },
    messageBubble: {
        borderRadius: 12,
        padding: 12,
        maxWidth: '85%',
    },
    botMessageBubble: {
        backgroundColor: '#e8e8e8',
        alignSelf: 'flex-start',
    },
    botMessageText: {
        fontSize: 14,
        color: '#333',
        lineHeight: 20,
    },
    visitorMessageContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'flex-end',
    },
    visitorMessageContent: {
        flex: 1,
        alignItems: 'flex-end',
    },
    visitorMessageHeader: {
        marginBottom: 4,
    },
    visitorTimestamp: {
        fontSize: 12,
        color: '#666',
        textAlign: 'right',
    },
    visitorMessageBubble: {
        backgroundColor: '#e3f2fd',
        alignSelf: 'flex-end',
    },
    visitorMessageText: {
        fontSize: 14,
        color: '#333',
        lineHeight: 20,
    },
    visitorAvatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#6c7ae0',
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 12,
    },
    visitorAvatarText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    inputContainer: {
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    messageInput: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 8,
        fontSize: 16,
        maxHeight: 100,
        marginRight: 12,
    },
    sendButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    sendButtonActive: {
        backgroundColor: '#007AFF',
    },
});