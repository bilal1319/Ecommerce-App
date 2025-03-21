import React, { useEffect, useState } from "react";
import ReactECharts from "echarts-for-react";

const ChartsGrid = () => {
  const [barData, setBarData] = useState([50, 80, 60, 90, 70]);

  useEffect(() => {
    const interval = setInterval(() => {
      setBarData((prevData) =>
        prevData.map((val) =>
          Math.random() > 0.9 ? val + Math.round(Math.random() * 2000) : val + Math.round(Math.random() * 200)
        )
      );
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const barOptions = {
    title: { text: "Analytics", textStyle: { color: "#fff" } },
    xAxis: { max: "dataMax", axisLabel: { color: "#fff" } },
    yAxis: {
      type: "category",
      data: ["Shoes", "Clothing", "Watch", "Toys", "Skin"],
      inverse: true,
      axisLabel: { color: "#fff" },
      animationDuration: 300,
      animationDurationUpdate: 300,
      max: 2,
    },
    series: [
      {
        realtimeSort: true,
        name: "All",
        type: "bar",
        data: barData,
        label: { show: true, position: "right", color: "#fff", valueAnimation: true },
      },
    ],
    legend: { show: true, textStyle: { color: "#fff" } },
    animationDuration: 0,
    animationDurationUpdate: 3000,
    animationEasing: "linear",
    animationEasingUpdate: "linear",
  };

  const pieOptions = {
    title: {
      text: 'Sales Data',
      left: 'center',
      textStyle: { color: "#fff" } 
    },
    tooltip: {
      trigger: 'item'
    },
    
    series: [
      {
        name: 'Access From',
        type: 'pie',
        radius: '50%',
        data: [
          { value: 1048, name: 'Clothing' },
          { value: 735, name: 'Shoes' },
          { value: 580, name: 'Watches' },
          { value: 484, name: 'Skin care' },
          { value: 300, name: 'Toys' }
        ],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-gray-900 min-h-screen">
      <div className="p-4">
        <ReactECharts option={pieOptions} style={{ height: "400px" }} />
      </div>
      <div className="p-4">
        <ReactECharts option={barOptions} style={{ height: "400px" }} />
      </div>
      
    </div>
  );
};

export default ChartsGrid;
