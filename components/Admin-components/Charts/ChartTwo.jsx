"use client";

import React from "react";
import { useContext } from "react";
import { AdminDashboardContext } from "@/app/[locale]/admin-dashboard/page";
import { useState,useEffect } from "react";
import axios from "axios";
import { useTranslations } from "next-intl";
import { Line } from 'react-chartjs-2';
import { Filler } from 'chart.js';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Colors,
} from 'chart.js';

ChartJS.register(
  Filler,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const ChartTwo = ({chartData}) => {

  const t = useTranslations("admin-dashboard");
  const {sidebarHide,
    setSidebarHide,
    updateCard,
    setUpdateCard,
    changeTable,
    setChangeTable,
    userData,
    dataDashboard,
    isDarkMode,
    setIsDarkMode} = useContext(AdminDashboardContext)
    
    const [start, setStart] = useState([]);
    const [end, setEnd] = useState([]);

      useEffect(() => {
        setStart(chartData.line_start)
        setEnd(chartData.line_end)
      }, [chartData])

      const data = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [
          {
            label: 'Campaign Start',
            data: start,
            // fill: true,
            borderColor: '#60A5FA',
            tension: 0.3,
            backgroundColor: '#60A5FA',
            borderWidth: 3
          },{
            label: 'Campaign End',
            data: end,
            // fill: true,
            borderColor: '#1D4ED8',
            tension: 0.3,
            backgroundColor: '#1D4ED8',
            borderWidth: 3
          }
        ],
      };
    
      const options = {
        responsive: true,
        plugins: {
          legend: {
            position: 'top',
            labels: {
              color : isDarkMode ? "white" : "gray"
            }
          },
          title: {
            display: true,
            text: 'Campaign Start and End',
            color: isDarkMode ? "white" : "gray"
          },
        },
        scales: {
          x: {
              ticks: {
                  color:  isDarkMode ? "white" : "gray", // Change x-axis labels color
              },
              grid: {
                  color:  isDarkMode ? "white" : "gray", // Optional: change grid line color
              }
          },
          y: {
              ticks: {
                  color:  isDarkMode ? "white" : "gray", // Change y-axis labels color
              },
              grid: {
                  color:  isDarkMode ? "white" : "gray", // Optional: change grid line color
              }
          }
      }
      };

      const isMobile = window.innerWidth <= 768;

      if (isMobile) {
        options.aspectRatio = 2;
        options.plugins.title.display = false;
        options.height = 400;
      }
    
      return (
          <Line data={data} options={options} width={500} height={300} />
      );
};

export default ChartTwo;
