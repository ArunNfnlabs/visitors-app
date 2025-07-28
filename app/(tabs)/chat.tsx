import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import ChatMetricsChart from '../../src/components/ChatMetricsChart';
import HeatMapChart from '../../src/components/HeatMapChart';

export default function ChatScreen() {
    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Chat Analytics</Text>
                <Text style={styles.subtitle}>Monitor your chat performance and busy periods</Text>
            </View>
            
            <View style={styles.placeholderContainer}>
                <ChatMetricsChart />
                <HeatMapChart />
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    header: {
        padding: 20,
        paddingTop: 40,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        lineHeight: 22,
    },
    placeholderContainer: {
        padding: 16,
    },
}); 