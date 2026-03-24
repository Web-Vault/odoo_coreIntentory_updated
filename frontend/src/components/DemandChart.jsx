import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement, // Changed from PointElement & LineElement
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement, // Changed
  Title,
  Tooltip,
  Legend
);

const DemandChart = ({ forecastData }) => {
  const coffeeColors = {
    light: '#D4A96A', // var(--latte)
    medium: '#C68642', // var(--caramel)
    dark: '#7B4F2E',   // var(--mocha)
    darkest: '#4A2C17' // var(--roast)
  };

  const getBarColor = (value) => {
    if (value < 30) return coffeeColors.light;
    if (value < 45) return coffeeColors.medium;
    if (value < 55) return coffeeColors.dark;
    return coffeeColors.darkest;
  };

  const data = {
    labels: forecastData.map(f => f.day),
    datasets: [
      {
        label: 'Forecasted Demand',
        data: forecastData.map(f => f.value),
        backgroundColor: forecastData.map(f => getBarColor(f.value)),
        borderColor: '#4A2C17', // var(--roast)
        borderWidth: 1,
        borderRadius: 4,
        hoverBackgroundColor: '#2C1A0E', // var(--espresso)
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: true,
        backgroundColor: '#2C1A0E', // var(--espresso)
        titleColor: '#D4A96A', // var(--latte)
        bodyColor: '#F5E6C8', // var(--cream)
        borderColor: '#4A2C17', // var(--roast)
        borderWidth: 1,
        padding: 10,
        displayColors: false,
        callbacks: {
          label: function(context) {
            const label = context.dataset.label || '';
            const value = context.parsed.y;
            const forecastItem = forecastData[context.dataIndex];
            return `${label}: ${value} units`;
          },
          afterLabel: function(context) {
            const forecastItem = forecastData[context.dataIndex];
            return `Insight: ${forecastItem.desc}`;
          }
        }
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#7B5C3E', // var(--text2)
          font: {
            family: '\'DM Sans\', sans-serif',
          },
        },
      },
      y: {
        grid: {
          color: 'rgba(232, 213, 176, 0.1)', // var(--border) with alpha
          drawBorder: false,
        },
        ticks: {
          color: '#7B5C3E', // var(--text2)
          font: {
            family: '\'DM Sans\', sans-serif',
          },
          stepSize: 10,
        },
      },
    },
  };

  return <Bar options={options} data={data} />;
};

export default DemandChart;
