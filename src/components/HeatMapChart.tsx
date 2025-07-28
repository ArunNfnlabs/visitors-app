import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
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

    const renderBarChart = () => {
        if (!heatMapData) return null;

        const dailyActivity = getDailyActivity();
        const maxActivity = Math.max(...dailyActivity.map(d => d.total), 1);
        const chartHeight = 120;
        const barWidth = (width - 120) / dailyActivity.length - 8;

        return (
            <View style={styles.chartContainer}>
                <View style={styles.chartHeader}>
                    <View style={styles.chartTitleContainer}>
                        <Icon name="bar-chart" size={20} color="#007AFF" />
                        <Text style={styles.chartTitle}>Daily Activity</Text>
                    </View>
                    <TouchableOpacity style={styles.timeRangeButton}>
                        <Text style={styles.timeRangeText}>Last 7 Days</Text>
                        <Icon name="keyboard-arrow-down" size={20} color="#666" />
                    </TouchableOpacity>
                </View>

                <View style={styles.chartArea}>
                    {/* Y-axis labels */}
                    <View style={styles.yAxis}>
                        {[0, 20, 40, 60, 80].map((value) => (
                            <Text key={value} style={styles.yAxisLabel}>
                                {value}
                            </Text>
                        ))}
                    </View>

                    {/* Chart content */}
                    <View style={styles.chartContent}>
                        {/* Grid lines */}
                        {[0, 20, 40, 60, 80].map((value) => (
                            <View
                                key={value}
                                style={[
                                    styles.gridLine,
                                    { top: (chartHeight * value) / 80 }
                                ]}
                            />
                        ))}

                        {/* Bar chart */}
                        <View style={styles.barChart}>
                            {dailyActivity.map((day, index) => {
                                const barHeight = (chartHeight * day.total) / maxActivity;
                                const x = (index * (barWidth + 8)) + 4;
                                
                                return (
                                    <View key={day.date} style={styles.barContainer}>
                                        <View
                                            style={[
                                                styles.bar,
                                                {
                                                    height: barHeight,
                                                    backgroundColor: day.total > 0 ? '#ff6b35' : '#f0f0f0',
                                                }
                                            ]}
                                        />
                                        {day.total > 0 && (
                                            <Text style={styles.barValue}>
                                                {day.total}
                                            </Text>
                                        )}
                                    </View>
                                );
                            })}
                        </View>

                        {/* X-axis labels */}
                        <View style={styles.xAxis}>
                            {dailyActivity.map((day) => (
                                <View key={day.date} style={styles.xAxisLabelContainer}>
                                    <Text style={styles.xAxisLabel}>
                                        {formatDate(day.date)}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    </View>
                </View>
            </View>
        );
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
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
            {renderBarChart()}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginVertical: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    loadingContainer: {
        padding: 40,
        alignItems: 'center',
    },
    errorContainer: {
        padding: 40,
        alignItems: 'center',
    },
    errorText: {
        fontSize: 18,
        color: '#666',
        textAlign: 'center',
    },
    chartContainer: {
        backgroundColor: '#fff',
        borderRadius: 12,
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
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginLeft: 8,
    },
    timeRangeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        backgroundColor: '#f8f9fa',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    timeRangeText: {
        fontSize: 14,
        color: '#666',
        marginRight: 4,
    },
    chartArea: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    yAxis: {
        width: 40,
        marginRight: 8,
    },
    yAxisLabel: {
        fontSize: 12,
        color: '#666',
        textAlign: 'right',
        height: 24,
        lineHeight: 24,
    },
    chartContent: {
        flex: 1,
        position: 'relative',
        marginBottom: 20,
    },
    gridLine: {
        position: 'absolute',
        left: 0,
        right: 0,
        height: 1,
        backgroundColor: '#e0e0e0',
    },
    barChart: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        flexDirection: 'row',
        alignItems: 'flex-end',
        paddingHorizontal: 20,
        paddingBottom: 30,
    },
    barContainer: {
        flex: 1,
        alignItems: 'center',
        marginHorizontal: 4,
    },
    bar: {
        width: '100%',
        borderRadius: 4,
        minHeight: 4,
    },
    barValue: {
        fontSize: 10,
        color: '#fff',
        fontWeight: '600',
        marginTop: 2,
        textAlign: 'center',
    },
    xAxis: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        marginTop: 8,
    },
    xAxisLabelContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    xAxisLabel: {
        fontSize: 11,
        color: '#666',
        textAlign: 'center',
        fontWeight: '500',
    },
}); 