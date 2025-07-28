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
import { getLineChart, LineChartData } from '../services/api';

const { width } = Dimensions.get('window');

interface ChatMetricsChartProps {
    timeRange?: string;
}

export default function ChatMetricsChart({ timeRange = '7d' }: ChatMetricsChartProps) {
    const [chartData, setChartData] = useState<LineChartData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [selectedTimeRange, setSelectedTimeRange] = useState<string>(timeRange);

    useEffect(() => {
        fetchChartData();
    }, [selectedTimeRange]);

    const fetchChartData = async () => {
        setLoading(true);
        try {
            console.log('Fetching chart data for timeRange:', selectedTimeRange);
            const data = await getLineChart(selectedTimeRange);
            console.log('Chart data received:', data);
            setChartData(data);
        } catch (error) {
            console.error('Error fetching chart data:', error);
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

    const renderMetricCard = (title: string, value: string | number, percentage: string, icon: string) => (
        <View style={styles.metricCard}>
            <View style={styles.metricHeader}>
                <View style={styles.metricIcon}>
                    <Icon name={icon} size={20} color="#007AFF" />
                </View>
                <Text style={styles.metricTitle}>{title}</Text>
            </View>
            <View style={styles.metricValueContainer}>
                <Text style={styles.metricValue}>{value}</Text>
                <View style={[
                    styles.percentageBadge,
                    { backgroundColor: percentage.startsWith('-') ? '#ffebee' : '#e8f5e8' }
                ]}>
                    <Text style={[
                        styles.percentageText,
                        { color: percentage.startsWith('-') ? '#d32f2f' : '#2e7d32' }
                    ]}>
                        {percentage}
                    </Text>
                </View>
            </View>
        </View>
    );

    const renderLineChart = () => {
        if (!chartData?.dailyCounts) {
            console.log('No chart data available');
            return null;
        }

        console.log('Rendering chart with data:', chartData.dailyCounts);
        
        const maxCount = Math.max(...chartData.dailyCounts.map(d => d.count), 1);
        const chartHeight = 120;
        const chartWidth = width - 80;
        const pointRadius = 4;

        console.log('Chart dimensions:', { maxCount, chartHeight, chartWidth, pointRadius });

        // Calculate data points
        const dataPoints = chartData.dailyCounts.map((point, index) => {
            const x = (chartWidth * index) / (chartData.dailyCounts.length - 1);
            const y = chartHeight - (chartHeight * point.count) / maxCount;
            return { x, y, count: point.count };
        });

        console.log('Calculated data points:', dataPoints);

        return (
            <View style={styles.chartContainer}>
                <View style={styles.chartHeader}>
                    <View style={styles.chartTitleContainer}>
                        <Icon name="chat" size={20} color="#007AFF" />
                        <Text style={styles.chartTitle}>All Chats</Text>
                    </View>
                    <TouchableOpacity style={styles.timeRangeButton}>
                        <Text style={styles.timeRangeText}>Last 7 Days</Text>
                        <Icon name="keyboard-arrow-down" size={20} color="#666" />
                    </TouchableOpacity>
                </View>

                <View style={styles.chartArea}>
                    {/* Y-axis labels */}
                    <View style={styles.yAxis}>
                        {[0, 10, 20, 30, 40].map((value) => (
                            <Text key={value} style={styles.yAxisLabel}>
                                {value}
                            </Text>
                        ))}
                    </View>

                    {/* Chart content */}
                    <View style={styles.chartContent}>
                        {/* Grid lines */}
                        {[0, 10, 20, 30, 40].map((value) => (
                            <View
                                key={value}
                                style={[
                                    styles.gridLine,
                                    { top: (chartHeight * value) / 40 }
                                ]}
                            />
                        ))}

                        {/* Simple line chart with data points */}
                        <View style={styles.lineChart}>
                            {/* Draw data points */}
                            {dataPoints.map((point, index) => (
                                <View
                                    key={`point-${index}`}
                                    style={[
                                        styles.dataPoint,
                                        {
                                            left: point.x - pointRadius,
                                            top: point.y - pointRadius,
                                        }
                                    ]}
                                />
                            ))}
                            
                            {/* Draw simple connecting lines using View borders */}
                            {dataPoints.map((point, index) => {
                                if (index === 0) return null;
                                
                                const prevPoint = dataPoints[index - 1];
                                const midX = (prevPoint.x + point.x) / 2;
                                const midY = (prevPoint.y + point.y) / 2;
                                const distance = Math.sqrt(
                                    Math.pow(point.x - prevPoint.x, 2) + 
                                    Math.pow(point.y - prevPoint.y, 2)
                                );
                                
                                return (
                                    <View
                                        key={`line-${index}`}
                                        style={[
                                            styles.connectingLine,
                                            {
                                                left: prevPoint.x,
                                                top: prevPoint.y,
                                                width: distance,
                                                height: 2,
                                                backgroundColor: '#ff6b35',
                                            }
                                        ]}
                                    />
                                );
                            })}
                        </View>

                        {/* X-axis labels */}
                        <View style={styles.xAxis}>
                            {chartData.dailyCounts.map((point, index) => (
                                <View key={index} style={styles.xAxisLabelContainer}>
                                    <Text style={styles.xAxisLabel}>
                                        {formatDate(point.label)}
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

    if (!chartData) {
        return (
            <View style={styles.container}>
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>No chart data available</Text>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Metrics Cards */}
            <View style={styles.metricsContainer}>
                {chartData && (
                    <>
                        {renderMetricCard(
                            'TOTAL CHATS',
                            chartData.currentPeriodTotalChats,
                            chartData.percentageChangeInTotalChats,
                            'trending-up'
                        )}
                        <View style={styles.metricsDivider} />
                        {renderMetricCard(
                            'AVG CHATS',
                            chartData.currentPeriodAverageChats,
                            chartData.percentageChangeInAverageChats,
                            'analytics'
                        )}
                    </>
                )}
            </View>

            {/* Line Chart */}
            {renderLineChart()}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        margin: 16,
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
    metricsContainer: {
        flexDirection: 'row',
        marginBottom: 24,
    },
    metricCard: {
        flex: 1,
        alignItems: 'center',
    },
    metricHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    metricIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#f0f8ff',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 8,
    },
    metricTitle: {
        fontSize: 12,
        color: '#666',
        fontWeight: '500',
    },
    metricValueContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    metricValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginRight: 8,
    },
    percentageBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    percentageText: {
        fontSize: 12,
        fontWeight: '600',
    },
    metricsDivider: {
        width: 1,
        backgroundColor: '#e0e0e0',
        marginHorizontal: 16,
    },
    chartContainer: {
        marginTop: 16,
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
        fontSize: 16,
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
        color: '#333',
        marginRight: 4,
    },
    chartArea: {
        flexDirection: 'row',
        height: 160,
    },
    yAxis: {
        width: 30,
        justifyContent: 'space-between',
        paddingRight: 8,
    },
    yAxisLabel: {
        fontSize: 12,
        color: '#666',
        textAlign: 'right',
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
        backgroundColor: '#f0f0f0',
    },
    lineChart: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 40,
    },
    dataPoint: {
        position: 'absolute',
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#ff6b35',
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
    connectingLine: {
        position: 'absolute',
        backgroundColor: '#ff6b35',
    },
}); 