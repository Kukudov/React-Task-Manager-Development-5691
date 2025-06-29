import React from 'react';
import { motion } from 'framer-motion';
import ReactECharts from 'echarts-for-react';
import { TaskStats } from '@/types';
import { format } from 'date-fns';

interface MonthlyChartProps {
  stats: TaskStats;
}

const MonthlyChart: React.FC<MonthlyChartProps> = ({ stats }) => {
  const option = {
    backgroundColor: 'transparent',
    title: {
      text: 'Monthly Progress',
      textStyle: {
        color: '#f1f5f9',
        fontSize: 18,
        fontWeight: 600,
      },
      left: 'left',
      top: 20,
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#1e293b',
      borderColor: '#334155',
      textStyle: {
        color: '#f1f5f9',
      },
      formatter: function (params: any) {
        const data = params[0];
        const date = format(new Date(data.name), 'MMM dd, yyyy');
        return `${date}<br/>Tasks Completed: ${data.value}`;
      },
    },
    grid: {
      left: '3%',
      right: '3%',
      bottom: '3%',
      top: '20%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: stats.monthlyData.map(d => d.date),
      axisLine: {
        lineStyle: {
          color: '#475569',
        },
      },
      axisLabel: {
        color: '#94a3b8',
        fontSize: 12,
        formatter: function (value: string) {
          return format(new Date(value), 'dd');
        },
      },
      axisTick: {
        show: false,
      },
    },
    yAxis: {
      type: 'value',
      axisLine: {
        show: false,
      },
      axisLabel: {
        color: '#94a3b8',
        fontSize: 12,
      },
      splitLine: {
        lineStyle: {
          color: '#334155',
          type: 'dashed',
        },
      },
    },
    series: [
      {
        name: 'Completed Tasks',
        type: 'bar',
        data: stats.monthlyData.map(d => d.count),
        itemStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              {
                offset: 0,
                color: '#3b82f6',
              },
              {
                offset: 1,
                color: '#1d4ed8',
              },
            ],
          },
          borderRadius: [4, 4, 0, 0],
        },
        emphasis: {
          itemStyle: {
            color: '#60a5fa',
          },
        },
        barWidth: '60%',
        animationDelay: function (idx: number) {
          return idx * 20;
        },
      },
    ],
    animationEasing: 'elasticOut',
    animationDelayUpdate: function (idx: number) {
      return idx * 5;
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="bg-dark-800/50 backdrop-blur-sm border border-dark-700 rounded-xl p-6"
    >
      <ReactECharts
        option={option}
        style={{ height: '300px' }}
        opts={{ renderer: 'svg' }}
      />
    </motion.div>
  );
};

export default MonthlyChart;