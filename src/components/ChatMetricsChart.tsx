import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { getLineChart, LineChartData } from '../services/api';

const { width } = Dimensions.get('window');

interface ChatMetricsChartProps {
    timeRange?: string;
}

export default function ChatMetricsChart({ timeRange = '7d' }: ChatMetricsChartProps) {
    const [chartData, setChartData] = useState<LineChartData | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [selectedTimeRange, setSelectedTimeRange] = useState<string>(timeRange);

    useEffect(() => {
        executeFetchChartData();
    }, [selectedTimeRange]);

    const executeFetchChartData = async (): Promise<void> => {
        setIsLoading(true);
        try {
            const data = await getLineChart(selectedTimeRange);
            setChartData(data as LineChartData);
        } catch (err) {
            console.error('Error fetching chart data:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const formatDateLabel = (dateString: string): string => {
        const date: Date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            day: 'numeric',
            month: 'short',
        });
    };

    const renderMetricCard = (
        title: string,
        value: string | number,
        percentage: string,
        icon: string
    ): React.ReactElement => {
        const isNegative: boolean = percentage.startsWith('-');
        return (
            <View style={styles.metricCard}>
                <View style={styles.metricHeader}>
                    <View style={styles.metricIcon}>
                        <Icon name={icon} size={16} color="#6366F1" />
                    </View>
                    <Text style={styles.metricTitle}>{title}</Text>
                </View>
                <View style={styles.metricValueContainer}>
                    <Text style={styles.metricValue}>{value}</Text>
                    <View
                        style={[
                            styles.percentageBadge,
                            { backgroundColor: isNegative ? '#FEF2F2' : '#F0FDF4' },
                        ]}
                    >
                        <Text
                            style={[
                                styles.percentageText,
                                { color: isNegative ? '#DC2626' : '#16A34A' },
                            ]}
                        >
                            {percentage}
                        </Text>
                    </View>
                </View>
            </View>
        );
    };

    const renderBarChart = (): React.ReactElement | null => {
        if (!chartData?.dailyCounts) {
            return null;
        }

        const chartConfig = {
            backgroundColor: '#F8FAFC',
            backgroundGradientFrom: '#F8FAFC',
            backgroundGradientTo: '#F8FAFC',
            decimalPlaces: 0,
            color: (opacity: number = 1) => `rgba(99, 102, 241, ${opacity})`,
            labelColor: (opacity: number = 1) => `rgba(71, 85, 105, ${opacity})`,
            style: {
                borderRadius: 12,
            },
            barPercentage: 0.6,
            propsForLabels: {
                fontSize: 10,
                fontWeight: '500',
            },
        };

        const data = {
            labels: chartData.dailyCounts.map(point => formatDateLabel(point.label)),
            datasets: [
                {
                    data: chartData.dailyCounts.map(point => point.count),
                },
            ],
        };

        return (
            <View style={styles.chartContainer}>
                <View style={styles.chartHeader}>
                    <View style={styles.chartTitleContainer}>
                        <Icon name="bar-chart" size={18} color="#6366F1" />
                        <Text style={styles.chartTitle}>Chat Activity</Text>
                    </View>
                    <Text style={styles.timeRangeText}>Last 7 Days</Text>
                </View>
                <BarChart
                    data={data}
                    width={width - 48}
                    height={180}
                    yAxisLabel=""
                    yAxisSuffix=""
                    chartConfig={chartConfig}
                    verticalLabelRotation={0}
                    showBarTops={true}
                    showValuesOnTopOfBars={true}
                    fromZero={true}
                    style={styles.chart}
                />
            </View>
        );
    };

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#6366F1" />
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
            <View style={styles.metricsContainer}>
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
            </View>
            {renderBarChart()}
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
        fontFamily: 'inter',
    },
    loadingContainer: {
        padding: 32,
        alignItems: 'center',
        fontFamily: 'inter',
    },
    errorContainer: {
        padding: 32,
        alignItems: 'center',
        fontFamily: 'inter',
    },
    errorText: {
        fontSize: 14,
        color: '#64748B',
        textAlign: 'center',
        fontFamily: 'inter',
    },
    metricsContainer: {
        flexDirection: 'row',
        fontFamily: 'inter',
        marginBottom: 16,
    },
    metricCard: {
        flex: 1,
        fontFamily: 'inter',
        alignItems: 'center',
    },
    metricHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        fontFamily: 'inter',
        marginBottom: 6,
    },
    metricIcon: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#EEF2FF',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 6,
        fontFamily: 'inter',
    },
    metricTitle: {
        fontSize: 10,
        color: '#64748B',
        fontWeight: '500',
        fontFamily: 'inter',
    },
    metricValueContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        fontFamily: 'inter',
    },
    metricValue: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1E293B',
        marginRight: 6,
        fontFamily: 'inter',
    },
    percentageBadge: {
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 6,
        fontFamily: 'inter',
    },
    percentageText: {
        fontSize: 10,
        fontWeight: '600',
        fontFamily: 'inter',
    },
    metricsDivider: {
        width: 1,
        backgroundColor: '#E2E8F0',
        marginHorizontal: 12,
        fontFamily: 'inter',
    },
    chartContainer: {
        alignItems: 'center',
        fontFamily: 'inter',
    },
    chartHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
        fontFamily: 'inter',
        width: '100%',
    },
    chartTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        fontFamily: 'inter',
    },
    chartTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1E293B',
        fontFamily: 'inter',
        marginLeft: 6,
    },
    timeRangeText: {
        fontSize: 12,
        color: '#64748B',
        fontWeight: '500',
        fontFamily: 'inter',
    },
    chart: {
        marginVertical: 4,
        borderRadius: 12,
        fontFamily: 'inter',
    },
});