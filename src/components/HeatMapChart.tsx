import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { getHeatMap, HeatMapData } from '../services/api';

const { width } = Dimensions.get('window');

interface HeatMapChartProps {
    days?: string;
}

export default function HeatMapChart({ days = '7d' }: HeatMapChartProps) {
    const [heatMapData, setHeatMapData] = useState<HeatMapData[] | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [selectedDays, setSelectedDays] = useState<string>(days);

    useEffect(() => {
        fetchHeatMapData();
    }, [selectedDays]);

    const fetchHeatMapData = async () => {
        setLoading(true);
        try {
            console.log('Fetching heat map data for days:', selectedDays);
            const data = await getHeatMap(selectedDays);
            console.log('Heat map data received:', data);
            setHeatMapData(data);
        } catch (error) {
            console.error('Error fetching heat map data:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            day: 'numeric',
            month: 'short'
        });
    };

    const getDailyActivity = () => {
        if (!heatMapData) return [];
        
        const dailyTotals = new Map<string, number>();
        heatMapData.forEach(item => {
            const current = dailyTotals.get(item.interval) || 0;
            dailyTotals.set(item.interval, current + item.count);
        });
        
        return Array.from(dailyTotals.entries())
            .map(([date, total]) => ({ date, total }))
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    };

    const renderLineChart = () => {
        if (!heatMapData) return null;

        const dailyActivity = getDailyActivity();
        const totalActivity = dailyActivity.reduce((sum, day) => sum + day.total, 0);
        
        if (totalActivity === 0) {
            return (
                <View style={styles.noDataContainer}>
                    <Text style={styles.noDataText}>No activity data available</Text>
                </View>
            );
        }

        const chartConfig = {
            backgroundColor: '#F8FAFC',
            backgroundGradientFrom: '#F8FAFC',
            backgroundGradientTo: '#F8FAFC',
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(99, 102, 241, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(71, 85, 105, ${opacity})`,
            style: {
                borderRadius: 12,
            },
            propsForDots: {
                r: '4',
                strokeWidth: '2',
                stroke: '#6366F1',
            },
            propsForLabels: {
                fontSize: 10,
                fontWeight: '500',
            },
        };

        const data = {
            labels: dailyActivity.map(day => formatDate(day.date)),
            datasets: [
                {
                    data: dailyActivity.map(day => day.total),
                    color: (opacity = 1) => `rgba(99, 102, 241, ${opacity})`,
                    strokeWidth: 3,
                },
            ],
        };

        return (
            <View style={styles.chartContainer}>
                <View style={styles.chartHeader}>
                    <View style={styles.chartTitleContainer}>
                        <Icon name="show-chart" size={18} color="#6366F1" />
                        <Text style={styles.chartTitle}>Activity Distribution</Text>
                    </View>
                    <Text style={styles.timeRangeText}>Last 7 Days</Text>
                </View>

                <View style={styles.chartContent}>
                    <LineChart
                        data={data}
                        width={width - 48}
                        height={180}
                        chartConfig={chartConfig}
                        bezier
                        style={styles.chart}
                        withDots={true}
                        withShadow={false}
                        withInnerLines={true}
                        withOuterLines={true}
                        withVerticalLines={false}
                        withHorizontalLines={true}
                        fromZero={true}
                    />
                    
                    {/* <View style={styles.summaryContainer}>
                        <Text style={styles.summaryTitle}>Total Activity</Text>
                        <Text style={styles.summaryValue}>{totalActivity}</Text>
                    </View> */}
                </View>
            </View>
        );
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#6366F1" />
            </View>
        );
    }

    if (!heatMapData) {
        return (
            <View style={styles.container}>
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>No activity data available</Text>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {renderLineChart()}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        marginBottom: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    loadingContainer: {
        padding: 32,
        alignItems: 'center',
    },
    errorContainer: {
        padding: 32,
        alignItems: 'center',
    },
    errorText: {
        fontSize: 14,
        color: '#64748B',
        textAlign: 'center',
    },
    noDataContainer: {
        padding: 32,
        alignItems: 'center',
    },
    noDataText: {
        fontSize: 14,
        color: '#64748B',
        textAlign: 'center',
    },
    chartContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
    },
    chartHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    chartTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    chartTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1E293B',
        marginLeft: 6,
    },
    timeRangeText: {
        fontSize: 12,
        color: '#64748B',
        fontWeight: '500',
    },
    chartContent: {
        alignItems: 'center',
    },
    chart: {
        marginVertical: 4,
        borderRadius: 12,
    },
    summaryContainer: {
        marginTop: 12,
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 16,
        backgroundColor: '#F8FAFC',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    summaryTitle: {
        fontSize: 12,
        color: '#64748B',
        fontWeight: '500',
        marginBottom: 2,
    },
    summaryValue: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1E293B',
    },
}); 